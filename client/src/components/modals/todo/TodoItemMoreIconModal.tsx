import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert } from 'react-native';
import Modal from 'react-native-modal';
import styles from '../../../styles';
import { useMutation } from '@apollo/client';
import { DELETE_TODO } from '../../../../apollo/mutations/todo/todoMutations';

import { useDispatch } from 'react-redux';
import { deleteTaskFromProject } from '../../../reduxReducers/projectSlice';
import { useToast } from '../../../utils/toastContext/ToastContext';

interface TodoItemMoreIconModalProps {
  isVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  todoId: string;
  projectId: string;
  todoContent: string;
}

const TodoItemMoreIconModal: React.FC<TodoItemMoreIconModalProps> = ({ isVisible, onClose, onEdit, todoId, todoContent, projectId }) => {
  const { success, error, warning } = useToast();

  const [deleteTodoMutation] = useMutation(DELETE_TODO);
  const dispatch = useDispatch();

  const deleteTodo = useCallback(async () => {
    try {
      const { data } = await deleteTodoMutation({
        variables: {
          todoId: todoId,
        },
      });

      dispatch(deleteTaskFromProject({ projectId: projectId, taskId: todoId }));
      success('Task Deleted');
    } catch (err) {
      error('Error deleting Task');
    }finally{
      onClose();
    }
  },[projectId,todoId,success,error]);

  const askConfirmDelete = useCallback(() =>
    Alert.alert('Delete Task?', '', [
      {text: 'Cancel', onPress: () => {}},
      {text: 'OK', onPress: () => deleteTodo()}
  ]),[deleteTodo]);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
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
