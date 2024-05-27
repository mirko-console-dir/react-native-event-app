import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import styles from '../../../styles';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { DELETE_TODO } from '../../../../apollo/mutations/todo/todoMutations';
import AskConfirmationModal from '../AskConfirmationModal'

import { useDispatch } from 'react-redux';
import { deleteTaskFromProject } from '../../../reduxReducers/projectSlice';

interface TodoItemMoreIconModalProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  todoId: string;
  projectId: string;
  todoContent: string;
}

const TodoItemMoreIconModal: React.FC<TodoItemMoreIconModalProps> = ({ isVisible, onClose, onEdit, todoId, todoContent, projectId }) => {

  const [deleteTodoMutation] = useMutation(DELETE_TODO);
  const dispatch = useDispatch();

  const [isModalConfirmDeleteVisible, setModalConfirmDeleteVisible] = useState(false);

  const askConfirmDelete = () => {
    setModalConfirmDeleteVisible(true);
  };

  const deleteTodo = async () => {
    try {
      const { data } = await deleteTodoMutation({
        variables: {
          todoId: todoId,
        },
      });

      if (data.deleteTodo) {
        dispatch(deleteTaskFromProject({ projectId: projectId, taskId: todoId }));
        onClose();
      } else {
        console.log('Failed to delete todo');
        // Handle the failure, e.g., show an error message
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      // Handle the error, e.g., show an error message
      onClose();
    }
  };

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <AskConfirmationModal
          isVisible={isModalConfirmDeleteVisible}
          message={'Delete task'}
          onConfirm={() => deleteTodo()}
          onCancel={() => setModalConfirmDeleteVisible(false)}
        />
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={modalStyles.centeredView}>
          <View style={modalStyles.modalView}>
              <View>
                <Text style={[styles.h2, styles.textCenter]}>{todoContent}</Text>
                <View style={modalStyles.actions}>
                <TouchableOpacity onPress={() => askConfirmDelete()} style={[modalStyles.btn, modalStyles.deleteBtn]}>
                    <Text style={styles.textCenter}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => [onEdit(), onClose()]}  style={[modalStyles.btn, modalStyles.editBtn]}>
                    <Text style={styles.textCenter}>Edit</Text>
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
    marginTop: 20,
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
    marginVertical: 10,
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

export default TodoItemMoreIconModal;
