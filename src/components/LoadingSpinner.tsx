import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 'medium',
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const spinAnimation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    spinAnimation.start();
    pulseAnimation.start();

    return () => {
      spinAnimation.stop();
      pulseAnimation.stop();
    };
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getSize = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 80;
      default:
        return 60;
    }
  };

  const spinnerSize = getSize();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinnerContainer,
          {
            width: spinnerSize,
            height: spinnerSize,
            transform: [{ rotate: spin }, { scale: pulseValue }],
          },
        ]}
      >
        <LinearGradient
          colors={['#007AFF', '#5856D6', '#FF3B30']}
          style={styles.spinner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  spinnerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingSpinner;

