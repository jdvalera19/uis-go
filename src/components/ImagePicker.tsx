import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface ImagePickerProps {
  onImageSelected: (uri: string) => void;
  onImageRemoved: () => void;
  selectedImage?: string;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  onImageSelected,
  onImageRemoved,
  selectedImage,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesita permiso para acceder a la galería');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
    setShowOptions(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesita permiso para usar la cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
    setShowOptions(false);
  };

  const removeImage = () => {
    onImageRemoved();
    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      {selectedImage ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
          <TouchableOpacity style={styles.removeButton} onPress={removeImage}>
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowOptions(true)}
        >
          <Ionicons name="image" size={24} color="#007AFF" />
          <Text style={styles.pickerText}>Agregar imagen</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar imagen</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={takePhoto}>
              <Ionicons name="camera" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Tomar foto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
              <Ionicons name="images" size={24} color="#007AFF" />
              <Text style={styles.optionText}>Elegir de galería</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderStyle: 'dashed',
  },
  pickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ImagePickerComponent;

