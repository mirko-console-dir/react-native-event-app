import React, {useEffect, useRef, useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from "react-native-modal";
import { onError } from '@apollo/client/link/error';
import { Feather } from '@expo/vector-icons';


interface ConfirmCompletedActionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ConfirmCompletedActionModal: React.FC<ConfirmCompletedActionModalProps> = ({ isVisible, onClose }) => {

  const checkIcon = useRef(null)

  useEffect(() => {
    if(isVisible){
      setTimeout(() => {
        onClose()
      }, 1000) 
    }
  },[isVisible])

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={modalStyles.centeredView}>
            <View style={[modalStyles.modalView, {overflow: 'hidden'}]}>
              <Feather name='circle' size={60} color='white' backgroundColor='green' style={{borderRadius:100,position: 'relative'}}/>
              <Feather ref={checkIcon} name='check' size={48} color='white' style={{overflow:'hidden',position: 'absolute', top: 5, right: 5}} />
            </View>
          </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: 60,
    backgroundColor: 'white',
    borderRadius: 100,
    justifyContent: 'center',
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
});

export default ConfirmCompletedActionModal;
