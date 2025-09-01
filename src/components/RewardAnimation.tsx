import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface RewardAnimationProps {
  visible: boolean;
  onClose: () => void;
  type: 'achievement' | 'medal' | 'level_up' | 'streak' | 'quest';
  title: string;
  description: string;
  points?: number;
  experience?: number;
  icon?: string;
  color?: string;
}

export default function RewardAnimation({
  visible,
  onClose,
  type,
  title,
  description,
  points,
  experience,
  icon,
  color
}: RewardAnimationProps) {
  const t = useTheme();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const particleAnim1 = useRef(new Animated.Value(0)).current;
  const particleAnim2 = useRef(new Animated.Value(0)).current;
  const particleAnim3 = useRef(new Animated.Value(0)).current;
  const particleAnim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      translateYAnim.setValue(50);
      particleAnim1.setValue(0);
      particleAnim2.setValue(0);
      particleAnim3.setValue(0);
      particleAnim4.setValue(0);

      // Start main animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Start particle animations
      const particleAnimations = [
        particleAnim1,
        particleAnim2,
        particleAnim3,
        particleAnim4,
      ];

      particleAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 800,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });

      // Auto-close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'achievement':
        return {
          icon: icon || 'trophy',
          color: color || t.warning,
          bgColor: t.warning + '20',
        };
      case 'medal':
        return {
          icon: icon || 'medal',
          color: color || t.success,
          bgColor: t.success + '20',
        };
      case 'level_up':
        return {
          icon: icon || 'star',
          color: color || t.primary,
          bgColor: t.primary + '20',
        };
      case 'streak':
        return {
          icon: icon || 'flame',
          color: color || t.error,
          bgColor: t.error + '20',
        };
      case 'quest':
        return {
          icon: icon || 'checkmark-circle',
          color: color || t.secondary,
          bgColor: t.secondary + '20',
        };
      default:
        return {
          icon: 'gift',
          color: t.primary,
          bgColor: t.primary + '20',
        };
    }
  };

  const config = getTypeConfig();

  const renderParticles = () => {
    const particles = [
      { anim: particleAnim1, x: -60, y: -60 },
      { anim: particleAnim2, x: 60, y: -60 },
      { anim: particleAnim3, x: -60, y: 60 },
      { anim: particleAnim4, x: 60, y: 60 },
    ];

    return particles.map((particle, index) => (
      <Animated.View
        key={index}
        style={[
          styles.particle,
          {
            backgroundColor: config.color,
            transform: [
              {
                translateX: particle.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, particle.x],
                }),
              },
              {
                translateY: particle.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, particle.y],
                }),
              },
              {
                scale: particle.anim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1.2, 0.8],
                }),
              },
            ],
            opacity: particle.anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 0],
            }),
          },
        ]}
      />
    ));
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.overlayTouchable}
        onPress={onClose}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: t.card,
              transform: [
                { scale: scaleAnim },
                { translateY: translateYAnim },
              ],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Particles */}
          {renderParticles()}

          {/* Main Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={48} color={config.color} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { color: t.text }]}>{title}</Text>
            <Text style={[styles.description, { color: t.textLight }]}>
              {description}
            </Text>

            {/* Rewards */}
            {(points || experience) && (
              <View style={styles.rewards}>
                {points && (
                  <View style={styles.reward}>
                    <Ionicons name="trophy" size={16} color={t.warning} />
                    <Text style={[styles.rewardText, { color: t.warning }]}>
                      +{points} pontos
                    </Text>
                  </View>
                )}
                {experience && (
                  <View style={styles.reward}>
                    <Ionicons name="star" size={16} color={t.primary} />
                    <Text style={[styles.rewardText, { color: t.primary }]}>
                      +{experience} XP
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color={t.text} />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.8,
    maxWidth: 320,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  rewards: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  reward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
