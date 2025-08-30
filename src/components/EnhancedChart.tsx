import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { CartesianChart, Line, Pie, CartesianAxis } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 64;

interface ChartData {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  x?: number | string;
  y?: number;
}

interface EnhancedChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'progress' | 'pie';
  showControls?: boolean;
  animated?: boolean;
  height?: number;
}

export default function EnhancedChart({ 
  title, 
  data, 
  type = 'bar', 
  showControls = true,
  animated = true,
  height = 250
}: EnhancedChartProps) {
  const t = useTheme();
  const [currentType, setCurrentType] = useState(type);
  const [animation] = useState(new Animated.Value(0));
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    setChartData(prepareChartData(data, currentType));
    
    if (animated) {
      animation.setValue(0);
      Animated.timing(animation, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [data, currentType, animated]);

  const prepareChartData = (rawData: ChartData[], chartType: string): ChartData[] => {
    if (chartType === 'pie') {
      return rawData.map((item, index) => ({
        ...item,
        x: item.label,
        y: item.value,
        color: item.color || getColorByIndex(index),
      }));
    } else if (chartType === 'line') {
      return rawData.map((item, index) => ({
        ...item,
        x: index + 1,
        y: item.value,
        color: item.color || t.primary,
      }));
    }
    return rawData;
  };

  const getColorByIndex = (index: number): string => {
    const colors = [
      t.primary,
      t.secondary,
      t.accent,
      t.error,
      t.warning,
      t.success,
    ];
    return colors[index % colors.length];
  };

  const renderBarChart = () => (
    <View style={styles.chartContainer}>
      {data.map((item, index) => {
        const percentage = item.maxValue ? (item.value / item.maxValue) * 100 : 0;
        const animatedWidth = animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', `${Math.min(percentage, 100)}%`],
        });

        return (
          <View key={index} style={styles.barItem}>
            <View style={styles.barLabel}>
              <Text style={[styles.barText, { color: t.text }]}>{item.label}</Text>
              <Text style={[styles.barValue, { color: t.textLight }]}>
                {item.maxValue ? `${item.value}/${item.maxValue}` : item.value}
              </Text>
            </View>
            <View style={[styles.barContainer, { backgroundColor: t.border }]}>
              {animated ? (
                <Animated.View 
                  style={[
                    styles.barFill, 
                    { 
                      backgroundColor: getColorByIndex(index),
                      width: animatedWidth
                    }
                  ]} 
                />
              ) : (
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      backgroundColor: getColorByIndex(index),
                      width: `${Math.min(percentage, 100)}%`
                    }
                  ]} 
                />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderProgressChart = () => (
    <View style={styles.progressContainer}>
      {data.map((item, index) => {
        const percentage = item.maxValue ? (item.value / item.maxValue) * 100 : 0;
        const animatedWidth = animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0%', `${Math.min(percentage, 100)}%`],
        });

        return (
          <View key={index} style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: t.text }]}>{item.label}</Text>
              <Text style={[styles.progressPercentage, { color: getColorByIndex(index) }]}>
                {Math.round(percentage)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: t.border }]}>
              {animated ? (
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: getColorByIndex(index),
                      width: animatedWidth
                    }
                  ]} 
                />
              ) : (
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: getColorByIndex(index),
                      width: `${Math.min(percentage, 100)}%`
                    }
                  ]} 
                />
              )}
            </View>
            {item.maxValue && (
              <Text style={[styles.progressValue, { color: t.textLight }]}>
                {item.value} de {item.maxValue}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );

  const renderPieChart = () => {
    if (chartData.length === 0) return null;

    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <View style={styles.victoryContainer}>
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <View
                  key={index}
                  style={[
                    styles.pieSegment,
                    {
                      backgroundColor: item.color || getColorByIndex(index),
                      flex: item.value
                    }
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.pieLegend}>
            {chartData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <View key={index} style={styles.legendItem}>
                  <View 
                    style={[
                      styles.legendColor, 
                      { backgroundColor: item.color || getColorByIndex(index) }
                    ]} 
                  />
                  <Text style={[styles.legendText, { color: t.text }]}>
                    {item.label}: {item.value} ({Math.round(percentage)}%)
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    if (chartData.length === 0) return null;

    const maxValue = Math.max(...chartData.map(d => d.value));
    const chartHeight = 150;
    const chartWidth = CHART_WIDTH;
    const pointRadius = 6;
    
    const points = chartData.map((item, index) => {
      const x = (index / (chartData.length - 1 || 1)) * chartWidth;
      const y = chartHeight - (item.value / maxValue) * chartHeight;
      return { x, y, value: item.value, label: item.label };
    });

    // Generate SVG path for the line
    let path = '';
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const current = points[i];
        const controlX1 = prev.x + (current.x - prev.x) / 2;
        const controlX2 = current.x - (current.x - prev.x) / 2;
        path += ` C ${controlX1} ${prev.y} ${controlX2} ${current.y} ${current.x} ${current.y}`;
      }
    }

    return (
      <View style={styles.victoryContainer}>
        <View style={[styles.lineChartContainer, { height: chartHeight + 40 }]}>
          <View style={styles.lineChart}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <Text key={index} style={[styles.axisLabel, { color: t.textLight }]}>
                  {Math.round(maxValue * ratio)}
                </Text>
              ))}
            </View>
            
            {/* Chart area */}
            <View style={styles.chartArea}>
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <View
                  key={index}
                  style={[
                    styles.gridLine,
                    { 
                      top: chartHeight * ratio,
                      backgroundColor: t.border
                    }
                  ]}
                />
              ))}
              
              {/* Line path */}
              <View style={styles.linePathContainer}>
                <View 
                  style={[
                    styles.linePath,
                    { 
                      backgroundColor: t.primary,
                      height: 3,
                      transform: [{ scaleX: 1 }, { scaleY: 1 }]
                    }
                  ]}
                />
              </View>
              
              {/* Data points */}
              {points.map((point, index) => (
                <View
                  key={index}
                  style={[
                    styles.dataPoint,
                    {
                      left: point.x - pointRadius,
                      top: point.y - pointRadius,
                      backgroundColor: t.primary,
                      borderColor: t.background,
                      borderWidth: 2
                    }
                  ]}
                >
                  <Text style={styles.dataPointValue}>{point.value}</Text>
                </View>
              ))}
            </View>
          </View>
          
          {/* X-axis labels */}
          <View style={styles.xAxis}>
            {chartData.map((item, index) => (
              <Text 
                key={index} 
                style={[
                  styles.axisLabel, 
                  { color: t.textLight, width: chartWidth / chartData.length }
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderChart = () => {
    switch (currentType) {
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'progress':
        return renderProgressChart();
      default:
        return renderBarChart();
    }
  };

  const chartTypes = [
    { type: 'bar', icon: 'bar-chart', label: 'Barras' },
    { type: 'progress', icon: 'trending-up', label: 'Progresso' },
    { type: 'pie', icon: 'pie-chart', label: 'Pizza' },
    { type: 'line', icon: 'analytics', label: 'Linha' },
  ];

  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: t.card },
        animated && {
          opacity: animation,
          transform: [{
            translateY: animation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>{title}</Text>
        
        {showControls && (
          <View style={styles.controls}>
            {chartTypes.map((chartType) => (
              <TouchableOpacity
                key={chartType.type}
                style={[
                  styles.controlButton,
                  currentType === chartType.type && [
                    styles.controlButtonActive,
                    { backgroundColor: t.primary }
                  ]
                ]}
                onPress={() => setCurrentType(chartType.type as any)}
              >
                <Ionicons 
                  name={chartType.icon as any} 
                  size={16} 
                  color={currentType === chartType.type ? '#fff' : t.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {renderChart()}
    </Animated.View>
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
  victoryContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pieChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  pieSegment: {
    height: '100%',
  },
  pieLegend: {
    marginLeft: 20,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lineChartContainer: {
    width: '100%',
  },
  lineChart: {
    flexDirection: 'row',
    height: 150,
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
  },
  linePathContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  linePath: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -1.5,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataPointValue: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  comingSoon: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
