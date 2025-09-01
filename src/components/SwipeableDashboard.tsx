import React, { useRef } from 'react';
import { ScrollView, View, StyleSheet, Dimensions, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const { width } = Dimensions.get('window');

interface SwipeableDashboardProps {
  children: React.ReactNode[];
}

export default function SwipeableDashboard({ children }: SwipeableDashboardProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  return (
    <Animated.ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {children.map((child, index) => (
        <Animated.View key={index} style={[styles.page]}>
          {child}
        </Animated.View>
      ))}
    </Animated.ScrollView>
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
