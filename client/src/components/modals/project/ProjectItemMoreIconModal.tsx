import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Modal from "react-native-modal";
import styles from '../../../styles';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { DELETE_PROJECT } from '../../../../apollo/mutations/project/projectMutations';
import AskConfirmationModal from '../AskConfirmationModal';
import { useDispatch } from 'react-redux';
import { deleteStoredProject } from '../../../reduxReducers/projectSlice';

interface ProjectItemMoreIconModalProps {
  isVisible: boolean;
  onClose: () => void;
  onDelete: () => void; 
  projectId: any; 
  projectTitle: any;
}

const ProjectItemMoreIconModal: React.FC<ProjectItemMoreIconModalProps> = ({ isVisible, onClose, onDelete, projectId, projectTitle }) => {
  const navigation = useNavigation<any>();

  const [deleteProjectMutation] = useMutation(DELETE_PROJECT);
  const dispatch = useDispatch();

  const [isModalConfirmDeleteVisible, setModalConfirmDeleteVisible] = useState(false);
  const askConfirmDelete = () =>{
    setModalConfirmDeleteVisible(true)
  }

  const deleteProject = async (projectId: string) => {
      try {
        const { data } = await deleteProjectMutation({
          variables: {
            projectId: projectId,
          },
        });
  
        if (data.deleteProject) {
          console.log('Project deleted successfully');
          dispatch(deleteStoredProject(projectId))

          onDelete();
          onClose();
        } else {
          console.log('Failed to delete project');
          // Handle the failure, e.g., show an error message
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        // Handle the error, e.g., show an error message
        onClose()
      }
  }

  const editProject = () => {
    onClose()
    navigation.navigate('Edit Event', {projectId: projectId}) 
  }
  
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <AskConfirmationModal
          isVisible={isModalConfirmDeleteVisible}
          message={'Delete event'}
          onConfirm={() => deleteProject(projectId)}
          onCancel={() => setModalConfirmDeleteVisible(false)}
        />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={modalStyles.centeredView}>
              <View style={modalStyles.modalView}>
                  <View>
                    <Text style={[styles.h2, styles.textCenter]}>{projectTitle}</Text>
                    <View style={modalStyles.actions}>
                      <TouchableOpacity onPress={() => {askConfirmDelete()}}  style={[modalStyles.btn, modalStyles.deleteBtn]}>
                        <Text style={styles.textCenter}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {editProject()}}  style={[modalStyles.btn, modalStyles.editBtn]}>
                        <Text style={styles.textCenter} >Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
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
    marginTop: 22,
  },
  actions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 50,
    marginTop: 20
  },
  btn: {
    width: 100,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  editBtn: {
    borderColor: 'green',
    color: 'green'
  },
  deleteBtn: {
      borderColor: 'red',
      color: 'red'
  },
  icon: {
    marginVertical: 10
  },
  modalView: {
    width: 300,
    margin: 20,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default ProjectItemMoreIconModal;
