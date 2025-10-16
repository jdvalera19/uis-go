import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onRecordingStart,
  onRecordingStop,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setRecordingDuration(0);
    }
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      if (permissionResponse?.status !== 'granted') {
        const permission = await requestPermission();
        if (permission.status !== 'granted') {
          Alert.alert('Permisos requeridos', 'Se necesita permiso para grabar audio');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      onRecordingStart();
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        onRecordingComplete(uri);
      }
      
      setRecording(null);
      onRecordingStop();
    } catch (error) {
      Alert.alert('Error', 'No se pudo detener la grabación');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.recordingButton,
          isRecording && styles.recordingButtonActive,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? 'stop' : 'mic'}
            size={32}
            color={isRecording ? '#FF3B30' : '#007AFF'}
          />
        </TouchableOpacity>
      </Animated.View>

      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>Grabando...</Text>
          <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  recordingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  recordingButtonActive: {
    backgroundColor: '#FF3B30',
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    marginTop: 16,
    alignItems: 'center',
  },
  recordingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 4,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
  },
});

export default VoiceRecorder;

