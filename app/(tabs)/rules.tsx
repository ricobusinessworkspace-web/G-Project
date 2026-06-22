import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTrackerStore, Rule } from '@/store/trackerStore';
import ActionCard from '@/components/ActionCard';

export default function RulesScreen() {
  const { rules, logAction } = useTrackerStore();

  // Group rules by category
  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, Rule[]>);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Rulebook</Text>
        
        {Object.entries(groupedRules).map(([category, catRules]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.sectionTitle}>{category.replace('_', ' ')}</Text>
            {catRules.map(rule => (
              <ActionCard
                key={rule.id}
                rule={rule}
                onPress={() => logAction(rule)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
});
