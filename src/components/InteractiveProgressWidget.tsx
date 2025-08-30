import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import EnhancedChart from './EnhancedChart';

const { width } = Dimensions.get('window');

interface ProgressData {
  label: string;
  value: number;
  maxValue: number;
  color?: string;
}

interface InteractiveProgressWidgetProps {
  title: string;
  data: ProgressData[];
  onDataPointPress?: (data: ProgressData, index: number) => void;
  showControls?: boolean;
}

export default function InteractiveProgressWidget({
  title,
  data,
  onDataPointPress,
  showControls = true
}: InteractiveProgressWidgetProps) {
  const t = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'progress' | 'pie' | 'line'>('progress');

  const handleDataPointPress = (index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
    onDataPointPress?.(data[index], index);
  };

  const enhancedData = data.map((item, index) => ({
    ...item,
    color: selectedIndex === index ? t.secondary : item.color || t.primary,
  }));

  const renderDataPoints = () => {
    if (chartType !== 'bar' && chartType !== 'progress') return null;

    return (
      <View style={styles.dataPointsContainer}>
        {data.map((item, index) => {
          const percentage = (item.value / item.maxValue) * 100;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dataPoint,
                selectedIndex === index && [
                  styles.dataPointSelected,
                  { backgroundColor: t.secondary + '20', borderColor: t.secondary }
                ]
              ]}
              onPress={() => handleDataPointPress(index)}
            >
              <View style={styles.dataPointHeader}>
                <Text style={[styles.dataPointLabel, { color: t.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.dataPointValue, { color: t.primary }]}>
                  {Math.round(percentage)}%
                </Text>
              </View>
              <View style={[styles.miniProgressBar, { backgroundColor: t.border }]}>
                <View
                  style={[
                    styles.miniProgressFill,
                    {
                      backgroundColor: selectedIndex === index ? t.secondary : t.primary,
                      width: `${Math.min(percentage, 100)}%`
                    }
                  ]}
                />
              </View>
              <Text style={[styles.dataPointDetails, { color: t.textLight }]}>
                {item.value} / {item.maxValue}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        
        {showControls && (
          <View style={styles.controls}>
            {['progress', 'bar', 'pie', 'line'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.controlButton,
                  chartType === type && [
                    styles.controlButtonActive,
                    { backgroundColor: t.primary }
                  ]
                ]}
                onPress={() => setChartType(type as any)}
              >
                <Ionicons
                  name={type === 'progress' ? 'trending-up' : 
                         type === 'bar' ? 'bar-chart' : 
                         type === 'pie' ? 'pie-chart' : 'analytics'}
                  size={16}
                  color={chartType === type ? '#fff' : t.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <EnhancedChart
        title=""
        data={enhancedData}
        type={chartType}
        showControls={false}
        animated={true}
        height={chartType === 'pie' || chartType === 'line' ? 200 : undefined}
      />

      {renderDataPoints()}

      {selectedIndex !== null && (
        <View style={[styles.detailPanel, { backgroundColor: t.secondary + '10' }]}>
          <Text style={[styles.detailTitle, { color: t.text }]}>
            {data[selectedIndex].label}
          </Text>
          <Text style={[styles.detailText, { color: t.textLight }]}>
            Progresso: {data[selectedIndex].value} de {data[selectedIndex].maxValue} ({Math.round((data[selectedIndex].value / data[selectedIndex].maxValue) * 100)}%)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  controlButtonActive: {
    backgroundColor: '#007AFF',
  },
  dataPointsContainer: {
    marginTop: 16,
    gap: 12,
  },
  dataPoint: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dataPointSelected: {
    borderWidth: 1,
  },
  dataPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dataPointLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  dataPointValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  miniProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  dataPointDetails: {
    fontSize: 12,
  },
  detailPanel: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
  },
});
