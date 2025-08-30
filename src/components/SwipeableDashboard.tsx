import React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SwipeableDashboardProps {
  children: React.ReactNode[];
}

export default function SwipeableDashboard({ children }: SwipeableDashboardProps) {
  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {children.map((child, index) => (
        <View key={index} style={styles.page}>
          {child}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    height: '100%',
  },
  contentContainer: {
    alignItems: 'center',
  },
  page: {
    width,
    paddingHorizontal: 16,
  },
});
