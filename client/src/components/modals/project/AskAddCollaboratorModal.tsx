import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Modal from "react-native-modal";
import styles from '../../../styles';
import AddCollaboratorsModal from '../../modals/project/AddCollaboratorsModal';

interface AskAddCollaboratorModalProps {
  isVisible: boolean;
  projectId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AskAddCollaboratorModal: React.FC<AskAddCollaboratorModalProps> = ({projectId, isVisible, onConfirm, onCancel }) => {

  const [collaboratorModal, setCollaboratorModal] = useState(false)
  const toggleAddCollabModal = () =>{
    setCollaboratorModal(!collaboratorModal)
  }
  return (
    <Modal isVisible={isVisible} onBackdropPress={onCancel}>
        <AddCollaboratorsModal 
          isVisible={collaboratorModal} 
          onClose={toggleAddCollabModal} 
          projectId={projectId} 
        />
        {/* !collaboratorModal to fix the overlapping modals */}
        {!collaboratorModal && 
          <View style={modalStyles.centeredView}>
            <View style={modalStyles.modalView}>
              <Text style={[styles.h2, { textAlign: 'center' }]}>Add a collaborator?</Text>
              <View style={modalStyles.actions}>
                <TouchableOpacity onPress={toggleAddCollabModal} style={modalStyles.confirmButton}>
                  <Text>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onCancel} style={modalStyles.cancelButton}>
                  <Text>Later</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
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
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
    width: '100%'
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 2,
    padding: 10,
    borderRadius: 30,
    borderColor: '#0596A0',
    width: 100,
    text: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#0596A0', 
    }
  },
  cancelButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 2,
    padding: 10,
    borderRadius: 30,
    borderColor: '#CC0404',
    width: 100,
    text: {
      textAlign: 'center',
      fontWeight: 'bold',
      color: '#CC0404', 
    }
  },
});

export default AskAddCollaboratorModal;
