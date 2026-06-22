import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { CODE_OF_HONOR } from '../constants/rules';

export type ImpactType = 'POINTS' | 'DEBT';
export type TimeModifier = 'DOUBLE_BEFORE_6AM' | 'NONE';

export interface Rule {
  id: string;
  name: string;
  category: 'REOCCURING' | 'ONCE_DAILY' | 'SLEEP_TAXES' | 'EXERCISE' | 'RECREATIONAL' | 'SALES' | 'PERSONAL';
  impact_type: ImpactType;
  base_value: number;
  iconName: string;
  
  requires_input?: boolean;
  input_step?: number; // e.g. 10 for "per 10€"
  time_modifier?: TimeModifier;
  
  daily_max?: number;
  weekly_max?: number;
  free_uses_per_week?: number;
  miss_penalty?: number;
}

export interface ActionEntry {
  id: string;
  rule_id: string;
  timestamp: number;
  points_applied: number;
  debt_applied: number;
}

interface TrackerState {
  userId: string | null;
  userName: string | null;
  myPoints: number;
  myDebt: number; // Euro debt
  myWeeklyDebt: number;
  myTotalDebt: number;
  opponentPoints: number;
  opponentName: string | null;
  rules: Rule[];
  actionEntries: ActionEntry[];
  isLoading: boolean;
  
  lastSettlementDate: string | null;
  lastWeeklyResetDate: string | null;
  lastGmDate: string | null;

  fetchState: (userId: string) => Promise<void>;
  fetchRules: () => Promise<void>;
  logAction: (rule: Rule, multiplier?: number) => void;
  undoAction: (actionId: string) => void;
  resetDay: () => void;
  
  checkAndRunSettlement: () => void;
  logGm: (wakeTime: Date) => void;
  updateGm: (wakeTime: Date) => void;
  resetGm: () => void; // For testing
  setOpponentPoints: (points: number) => void;
}

export const useTrackerStore = create<TrackerState>((set, get) => ({
  userId: null,
  userName: null,
  myPoints: 5, // Starts at +5 daily
  myDebt: 0,
  myWeeklyDebt: 0,
  myTotalDebt: 0,
  opponentPoints: 7, 
  opponentName: null,
  rules: [],
  actionEntries: [],
  isLoading: false,
  
  lastSettlementDate: null,
  lastWeeklyResetDate: null,
  lastGmDate: null,

  fetchState: async (userId: string) => {
    set({ isLoading: true });
    // Try to fetch existing state
    const { data, error } = await supabase.from('user_stats').select('*').eq('user_id', userId).single();
    
    if (data) {
      set({
        myPoints: data.my_points ?? 5,
        myDebt: data.my_debt ?? 0,
        myWeeklyDebt: data.my_weekly_debt ?? 0,
        myTotalDebt: data.my_total_debt ?? 0,
        lastSettlementDate: data.last_settlement_date,
        lastWeeklyResetDate: data.last_weekly_reset_date,
        lastGmDate: data.last_gm_date,
        userName: data.name,
      });
    } else {
      // Initialize if missing
      await supabase.from('user_stats').insert({
        user_id: userId,
        my_points: 5,
        my_debt: 0,
        my_weekly_debt: 0,
        my_total_debt: 0
      });
    }

    // Fetch opponent stats
    const { data: opponentData } = await supabase.from('user_stats').select('*').neq('user_id', userId).maybeSingle();
    if (opponentData) {
      set({
        opponentPoints: opponentData.my_points ?? 5,
        opponentName: opponentData.name ?? 'Opponent',
      });
    }

    set({ isLoading: false });
  },

  setOpponentPoints: (points: number) => set({ opponentPoints: points }),
  
  fetchRules: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('action_rules').select('*');
    
    if (error) {
      console.error('Error fetching rules:', error);
      set({ isLoading: false });
      return;
    }
    
    const mappedRules = data.map(r => ({
      ...r,
      iconName: r.icon_name, // Map DB snake_case to camelCase
    })) as Rule[];

    set({ rules: mappedRules, isLoading: false });
  },
  
  checkAndRunSettlement: async () => {
    const state = get();
    if (!state.userId) return;

    const now = new Date();
    // "Logical day" changes at 4:00 AM. 
    const logicalNow = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const todayStr = logicalNow.toISOString().split('T')[0];

    if (state.lastSettlementDate && state.lastSettlementDate !== todayStr) {
      // Settlement triggers!
      const diff = state.myPoints - state.opponentPoints;
      let newDebt = 0;
      if (diff > 0 && diff < 10) newDebt = 5;
      else if (diff >= 10 && diff < 20) newDebt = 10;
      else if (diff >= 20) newDebt = 15;

      let newWeeklyDebt = state.myWeeklyDebt + newDebt;
      let newTotalDebt = state.myTotalDebt;
      
      // Monday is day 1. If today is Monday and we haven't reset this week
      if (logicalNow.getDay() === 1 && state.lastWeeklyResetDate !== todayStr) {
          if (newWeeklyDebt < 0) {
            newTotalDebt += newWeeklyDebt; // Subtract negative weekly debt from total
          }
          newWeeklyDebt = 0;
      }

      const updates = {
        last_settlement_date: todayStr,
        last_weekly_reset_date: logicalNow.getDay() === 1 ? todayStr : state.lastWeeklyResetDate,
        my_points: 5,
        my_weekly_debt: logicalNow.getDay() === 1 && state.lastWeeklyResetDate !== todayStr ? 0 : newWeeklyDebt,
        my_total_debt: newTotalDebt,
        my_debt: state.myDebt + newDebt,
      };

      set({
        lastSettlementDate: updates.last_settlement_date,
        lastWeeklyResetDate: updates.last_weekly_reset_date,
        myPoints: updates.my_points,
        myWeeklyDebt: updates.my_weekly_debt,
        myTotalDebt: updates.my_total_debt,
        myDebt: updates.my_debt,
      });

      await supabase.from('user_stats').update(updates).eq('user_id', state.userId);

    } else if (!state.lastSettlementDate) {
      set({ lastSettlementDate: todayStr, lastWeeklyResetDate: todayStr });
      await supabase.from('user_stats').update({
        last_settlement_date: todayStr,
        last_weekly_reset_date: todayStr,
      }).eq('user_id', state.userId);
    }
  },

  logGm: async (wakeTime: Date) => {
    const state = get();
    if (!state.userId) return;

    const logicalNow = new Date(wakeTime.getTime() - 4 * 60 * 60 * 1000);
    const todayStr = logicalNow.toISOString().split('T')[0];

    let sleepTax = 5; // Daily base
    const hours = wakeTime.getHours();
    const minutes = wakeTime.getMinutes();
    const isWeekend = wakeTime.getDay() === 0 || wakeTime.getDay() === 6;

    if (isWeekend) {
      if (hours > 12 || (hours === 12 && minutes > 0)) sleepTax += 5;
      if (hours > 10 || (hours === 10 && minutes > 0)) sleepTax += 10;
      if (hours > 8 || (hours === 8 && minutes > 0)) sleepTax += 5;
    } else {
      if (hours > 10 || (hours === 10 && minutes > 0)) sleepTax += 5;
      if (hours > 8 || (hours === 8 && minutes > 0)) sleepTax += 5;
      if (hours > 7 || (hours === 7 && minutes > 0)) sleepTax += 5;
      if (hours > 5 || (hours === 5 && minutes > 0)) sleepTax += 5;
    }

    const timestamp = wakeTime.getTime();
    
    // DB
    await supabase.from('action_entries').insert({
      user_id: state.userId,
      rule_id: 'sl_1',
      timestamp: timestamp,
      points_applied: sleepTax,
      debt_applied: 0,
    });

    await supabase.from('user_stats').update({
      my_points: state.myPoints + sleepTax,
      last_gm_date: todayStr,
    }).eq('user_id', state.userId);

    set({
      myPoints: state.myPoints + sleepTax,
      lastGmDate: todayStr,
      actionEntries: [
        ...state.actionEntries,
        {
          id: 'gm_' + todayStr, // Temp local ID
          rule_id: 'sl_1',
          timestamp: timestamp,
          points_applied: sleepTax,
          debt_applied: 0,
        }
      ]
    });
  },

  updateGm: async (wakeTime: Date) => {
      const logicalNow = new Date(wakeTime.getTime() - 4 * 60 * 60 * 1000);
      const todayStr = logicalNow.toISOString().split('T')[0];
      await get().undoAction('gm_' + todayStr);
      await get().logGm(wakeTime);
  },

  logAction: async (rule, multiplier = 1) => {
    const state = get();
    if (!state.userId) return;

    let pointsToApply = 0;
    let debtToApply = 0;
    
    const isBefore6am = new Date().getHours() < 6;
    let finalBaseValue = rule.base_value * multiplier;
    
    if (rule.time_modifier === 'DOUBLE_BEFORE_6AM' && isBefore6am) {
      finalBaseValue *= 2;
    }

    if (rule.impact_type === 'POINTS') {
      pointsToApply = finalBaseValue;
    } else if (rule.impact_type === 'DEBT') {
      debtToApply = finalBaseValue;
    }

    const timestamp = Date.now();

    const newEntry: ActionEntry = {
      id: Math.random().toString(), // local fallback
      rule_id: rule.id,
      timestamp: timestamp,
      points_applied: pointsToApply,
      debt_applied: debtToApply,
    };

    set({
      myPoints: state.myPoints + pointsToApply,
      myDebt: state.myDebt + debtToApply,
      myWeeklyDebt: state.myWeeklyDebt + debtToApply,
      myTotalDebt: state.myTotalDebt + debtToApply,
      actionEntries: [...state.actionEntries, newEntry],
    });

    await supabase.from('action_entries').insert({
      user_id: state.userId,
      rule_id: rule.id,
      timestamp: timestamp,
      points_applied: pointsToApply,
      debt_applied: debtToApply,
    });

    await supabase.from('user_stats').update({
      my_points: state.myPoints + pointsToApply,
      my_debt: state.myDebt + debtToApply,
      my_weekly_debt: state.myWeeklyDebt + debtToApply,
      my_total_debt: state.myTotalDebt + debtToApply,
    }).eq('user_id', state.userId);
  },
  
  undoAction: async (actionId: string) => {
    const state = get();
    if (!state.userId) return;

    // gm actions have id 'gm_YYYY-MM-DD', but we can just use the timestamp hack
    const entry = state.actionEntries.find(e => e.id === actionId || (actionId.startsWith('gm_') && e.id === actionId));
    if (!entry) return;

    set({
      myPoints: state.myPoints - entry.points_applied,
      myDebt: state.myDebt - entry.debt_applied,
      myWeeklyDebt: state.myWeeklyDebt - entry.debt_applied,
      myTotalDebt: state.myTotalDebt - entry.debt_applied,
      actionEntries: state.actionEntries.filter(e => e.id !== actionId),
    });

    await supabase.from('action_entries')
      .delete()
      .eq('user_id', state.userId)
      .eq('timestamp', entry.timestamp);

    await supabase.from('user_stats').update({
      my_points: state.myPoints - entry.points_applied,
      my_debt: state.myDebt - entry.debt_applied,
      my_weekly_debt: state.myWeeklyDebt - entry.debt_applied,
      my_total_debt: state.myTotalDebt - entry.debt_applied,
    }).eq('user_id', state.userId);
  },
  
  resetDay: () => set({ myPoints: 5, myDebt: 0, actionEntries: [] }),
  resetGm: () => set({ lastGmDate: null }),
}));
