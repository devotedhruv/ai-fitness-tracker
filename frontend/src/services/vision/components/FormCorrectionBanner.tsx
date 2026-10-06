import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { FormFault } from '../types';
import { Icon } from '../../../components/Icon';

interface FormCorrectionBannerProps {
  fault?: FormFault;
  topOffset?: number;
}

export const FormCorrectionBanner: React.FC<FormCorrectionBannerProps> = ({ fault, topOffset }) => {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const defaultTop = Platform.select({
    ios: 245,
    android: 225,
    web: 205,
    default: 215,
  });
  const resolvedTop = topOffset ?? defaultTop;

  useEffect(() => {
    if (fault) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -80,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fault, slideAnim, opacityAnim]);

  if (!fault) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: resolvedTop,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Icon name="alert" size={18} color="#FF3B30" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>NO-REP: {fault.name.toUpperCase()}</Text>
          <Text style={styles.message}>{fault.correctionMessage}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
    alignItems: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1212',
    borderColor: '#FF3B30',
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    maxWidth: 420,
    width: '100%',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF453A',
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 17,
  },
});
