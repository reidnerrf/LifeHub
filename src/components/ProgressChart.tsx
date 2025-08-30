import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');

interface ProgressChartProps {
  title: string;
  data: { label: string; value: number; maxValue: number }[];
  type?: 'bar' | 'line' | 'progress';
}

export default function ProgressChart({ title, data, type = 'bar' }: ProgressChartProps) {
  const t = useTheme();

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const percentage = (item.value / item.maxValue) * 100;
        return (
          <View key={index} style={styles.barItem}>
            <View style={styles.barLabel}>
              <Text style={[styles.barText, { color: t.text }]}>{item.label}</Text>
              <Text style={[styles.barValue, { color: t.textLight }]}>
                {item.value}/{item.maxValue}
              </Text>
            </View>
            <View style={[styles.barContainer, { backgroundColor: t.border }]}>
              <View 
                style={[
                  styles.barFill, 
                  { 
                    backgroundColor: t.primary,
                    width: `${Math.min(percentage, 100)}%`
                  }
                ]} 
              />
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderProgressChart = () => (
    <View style={styles.progressContainer}>
      {data.map((item, index) => {
        const percentage = (item.value / item.maxValue) * 100;
        return (
          <View key={index} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: t.text }]}>{item.label}</Text>
              <Text style={[styles.progressPercentage, { color: t.primary }]}>
                {Math.round(percentage)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: t.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    backgroundColor: t.primary,
                    width: `${Math.min(percentage, 100)}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressValue, { color: t.textLight }]}>
              {item.value} de {item.maxValue}
            </Text>
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: t.card }]}>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      {type === 'progress' ? renderProgressChart() : renderBarChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    gap: 12,
  },
  barItem: {
    gap: 8,
  },
  barLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barText: {
    fontSize: 14,
    fontWeight: '500',
  },
  barValue: {
    fontSize: 12,
  },
  barContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressContainer: {
    gap: 16,
  },
  progressItem: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressValue: {
    fontSize: 12,
    textAlign: 'center',
  },
});