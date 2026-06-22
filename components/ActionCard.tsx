import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import * as icons from 'lucide-react-native';

import { Rule } from '../store/trackerStore';

interface ActionCardProps {
  rule: Rule;
  onPress: () => void;
}

export default function ActionCard({ rule, onPress }: ActionCardProps) {
  // eslint-disable-next-line import/namespace
  const IconComponent = (icons as any)[rule.iconName] || icons.Circle;
  const isPositiveForOpponent = rule.base_value > 0; // Positive points/debts are BAD for the user
  
  const displayValue = rule.impact_type === 'DEBT' 
    ? `${rule.base_value > 0 ? '+' : ''}${rule.base_value}€` 
    : `${rule.base_value > 0 ? '+' : ''}${rule.base_value}`;
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContent}>
        <IconComponent color="#8E8E93" size={24} />
        <Text style={styles.name}>{rule.name}</Text>
      </View>
      <View style={styles.pointsContainer}>
        <Text style={[styles.points, { color: isPositiveForOpponent ? '#FF453A' : '#32D74B' }]}>
          {displayValue}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E', // Apple dark mode card color
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
  },
  pointsContainer: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  points: {
    fontSize: 17,
    fontWeight: 'bold',
  },
});
