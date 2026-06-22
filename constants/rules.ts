import { Rule } from '../store/trackerStore';

export const CODE_OF_HONOR: Rule[] = [
  // REOCCURING
  { id: 're_1', name: 'Rawdog', category: 'REOCCURING', impact_type: 'POINTS', base_value: 1, iconName: 'Smartphone' },
  { id: 're_2', name: 'Bed Goon', category: 'REOCCURING', impact_type: 'POINTS', base_value: 2, iconName: 'Bed' },
  { id: 're_3', name: 'Phone Addy', category: 'REOCCURING', impact_type: 'POINTS', base_value: 3, iconName: 'Phone' },
  { id: 're_4', name: 'Sex Always', category: 'REOCCURING', impact_type: 'POINTS', base_value: 3, iconName: 'Flame' },
  { id: 're_5', name: 'Entertainment', category: 'REOCCURING', impact_type: 'POINTS', base_value: 5, iconName: 'MonitorPlay', free_uses_per_week: 1 },
  { id: 're_6', name: 'Nudebabes', category: 'REOCCURING', impact_type: 'DEBT', base_value: 10, iconName: 'Lock' },
  { id: 're_7', name: 'Jerking Off', category: 'REOCCURING', impact_type: 'DEBT', base_value: 10, iconName: 'Hand', free_uses_per_week: 1 },

  // ONCE DAILY
  { id: 'od_1', name: 'Bussy', category: 'ONCE_DAILY', impact_type: 'POINTS', base_value: 1, iconName: 'Cat' },
  { id: 'od_2', name: 'No 300 PA / SU / 3k', category: 'ONCE_DAILY', impact_type: 'POINTS', base_value: 3, iconName: 'XCircle' },
  { id: 'od_3', name: 'Drugs', category: 'ONCE_DAILY', impact_type: 'POINTS', base_value: 5, iconName: 'Pill' },
  { id: 'od_4', name: 'Fastfood', category: 'ONCE_DAILY', impact_type: 'POINTS', base_value: 5, iconName: 'Pizza' },

  // SLEEP TAXES (Manual fallback rules, though primarily handled by GM button)
  { id: 'sl_1', name: 'Baby Nap (>1h)', category: 'SLEEP_TAXES', impact_type: 'POINTS', base_value: 7, iconName: 'Moon' },

  // PERSONAL RULES
  { id: 'pr_1', name: 'Gay Motherf*** (Rico)', category: 'PERSONAL', impact_type: 'POINTS', base_value: 1, iconName: 'User' },
  { id: 'pr_2', name: 'Boozy Alone (Leo)', category: 'PERSONAL', impact_type: 'POINTS', base_value: 5, iconName: 'Beer' },

  // EXERCISE
  { id: 'ex_1', name: '100 Pushups', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Dumbbell', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_2', name: '100 Situps', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Activity', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_3', name: '1km Jogging', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Footprints', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_4', name: 'Gym / Boxing (20min)', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Swords', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_5', name: 'Seilspringen (7min)', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Activity', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_6', name: '50 Squatjumps', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Activity', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_7', name: '50 Pull-ups', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Activity', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_8', name: '50 Dips', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Activity', time_modifier: 'DOUBLE_BEFORE_6AM' },
  { id: 'ex_9', name: '50 Legraises', category: 'EXERCISE', impact_type: 'POINTS', base_value: -1, iconName: 'Activity', time_modifier: 'DOUBLE_BEFORE_6AM' },
  
  // EXERCISE (DEBT REDUCTION)
  { id: 'ex_10', name: '500 Pushups (Debt Red.)', category: 'EXERCISE', impact_type: 'DEBT', base_value: -5, iconName: 'ShieldCheck' },
  { id: 'ex_11', name: '10km Run (Debt Red.)', category: 'EXERCISE', impact_type: 'DEBT', base_value: -10, iconName: 'ShieldCheck' },

  // RECREATIONAL
  { id: 'rec_1', name: 'Cold Shower (1min)', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -1, iconName: 'ThermometerSnowflake' },
  { id: 'rec_2', name: '30 Min Learning', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -1, iconName: 'BookOpen', daily_max: 4 },
  { id: 'rec_3', name: '30 Min Podcast', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -1, iconName: 'Headphones', daily_max: 2 },
  { id: 'rec_4', name: '10 Min Chess Win', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -1, iconName: 'Gamepad2', daily_max: 1 },
  { id: 'rec_5', name: 'First Pitch / 10 CC', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -1, iconName: 'PhoneCall', daily_max: 1 },
  { id: 'rec_6', name: '15 Min Reading', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -2, iconName: 'Book', daily_max: 4 },
  { id: 'rec_7', name: '15 Min Meditation', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -2, iconName: 'Wind', daily_max: 4 },
  { id: 'rec_8', name: 'One Page Journal', category: 'RECREATIONAL', impact_type: 'POINTS', base_value: -2, iconName: 'PenTool', daily_max: 1 },

  // SALES
  { id: 'sa_1', name: 'Revenue', category: 'SALES', impact_type: 'POINTS', base_value: -1, iconName: 'Banknote', requires_input: true, input_step: 10 },
];
