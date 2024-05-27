import React, {useEffect, useState}from 'react';
import { View, Platform, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'expo-camera'; // Import Camera from expo-camera

interface ImagePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImageSelected: (imageUri: string) => void;
  onImageTaken: (imageUri: string) => void;
}

const ImagePickerModal: React.FC<ImagePickerModalProps> = ({ isVisible, onClose, onImageSelected,onImageTaken }) => {

  const pickImage = async () => {

    // Check and request gallery permission here before launching the image library
    /* REACTIVATE THE PERMISSIOOOOOOOOOON  */
   /*  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      // Handle the case where permission is not granted
      console.log('Gallery permission not granted');
      return;
    } */

    let result: ImagePicker.ImagePickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4,6],
      /* quality: 1, max quality */
      quality: 0,
    });

    if (!result.canceled) {
      onImageSelected(result.assets[0].uri);
      onClose(); // Close the modal
    }
  };

  const openCamera = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      console.log('Camera permission not granted');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    }) as ImagePicker.ImagePickerSuccessResult;
  
    if (!result.canceled) {
      onImageTaken(result.assets[0].uri);
    }
    onClose();
  };


  return (
      <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Choose an option</Text>
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <MaterialIcons name="photo-library" size={24} color="black" />
              <Text style={styles.modalButtonText}>Select from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
              <MaterialIcons name="photo-camera" size={24} color="black" />
              <Text style={styles.modalButtonText}>Open Camera</Text>
            </TouchableOpacity> 
            
            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
        </View>     
      </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Add a semi-transparent white background
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    fontSize: 20,
    marginBottom: 16,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtonText: {
    marginLeft: 10,
  },
});

export default ImagePickerModal;
