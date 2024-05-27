import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from "react-native-modal";
import styles from '../../styles';
import { BlurView } from 'expo-blur'; 
import {Feather} from '@expo/vector-icons';

interface AskConfirmationModalProps {
  isVisible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AskConfirmationModal: React.FC<AskConfirmationModalProps> = ({ isVisible, onConfirm, onCancel, message }) => {
  return (
    <Modal isVisible={isVisible} onBackdropPress={onCancel}>
      <BlurView style={StyleSheet.absoluteFill} intensity={50} tint="dark">
        <TouchableWithoutFeedback onPress={onCancel}>
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>
              <Text style={[styles.h2, { textAlign: 'center', textTransform:'capitalize' }]}>{message}? </Text>
              <View style={modalStyles.actions}>
                <TouchableOpacity onPress={onConfirm} style={modalStyles.confirmButton}>
                  <Feather name={'check'} size={25} color={'#0596A0'}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={modalStyles.cancelButton}>
                  <Feather name={'x'} size={25} color={'#CC0404'}/>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </BlurView>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 50,
    alignItems: 'center',
    marginTop: 20
  },
  modalView: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    borderWidth: 2,
    padding: 15,
    borderRadius: 100,
    borderColor: '#0596A0',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cancelButton: {
    borderWidth: 2,
    padding: 15,
    borderRadius: 100,
    borderColor: '#CC0404',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default AskConfirmationModal;
