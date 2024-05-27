import React, {useEffect, useState}from 'react';
import { View, Platform, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from "react-native-modal";

import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import {addCommentToTask} from '../../../reduxReducers/projectSlice' 

import { useMutation } from '@apollo/client';
import { ADD_COMMENT_TODO } from '../../../../apollo/mutations/todo/todoMutations'; 

interface AddCommentModalProps {
  isVisible: boolean;
  todoId: string; // Pass the projectId to the modal
  projectId: string; // Pass the projectId to the modal
  onClose: () => void;
}
interface InputTypes {
  commentText: string
}
const AddCommentModal: React.FC<AddCommentModalProps> = ({ isVisible, todoId, projectId, onClose }) => {

 const [addCommentTodo] = useMutation(ADD_COMMENT_TODO);    
 const dispatch = useDispatch()

 const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();    

  const addComment = async (formData: InputTypes) => {
    const {commentText} = formData
    if(!commentText.trim()){
      setError("commentText", {
        message: "You must enter a comment",
      })
      return
    }
    try {
      const commentAdded = await addCommentTodo({
        variables: {
          todoId: todoId,
          input: {
            commentText: commentText.trim()
          },
        },
      });
      console.log('====================================');
      console.log('Todo comment:', commentAdded.data.addCommentTodo);
      console.log('====================================');
      dispatch(addCommentToTask({projectId: projectId, taskId: todoId, comment: commentAdded.data.addCommentTodo}))
      reset()
      clearErrors("commentText")
      onClose()
    } catch (error) {
      console.log('=========ERROR==========');
      console.error('Error add comment todo:', error);
      console.log('====================================');
    } finally {
      console.log('====================================');
      console.log('completed');
      console.log('====================================');
    }
  }
  const close = () => {
    reset()
    onClose()
  }
  return (
      <Modal isVisible={isVisible} onBackdropPress={close}>
        <View style={styles.modalContent}>
          <Controller
              control={control}
              render={({ field }) => (
                <>
                    <TextInput
                      placeholder="Comment"
                      value={field.value}
                      onChangeText={field.onChange}
                      style={styles.input}
                      multiline={true}
                      numberOfLines={3}
                    />
                    {errors.commentText && 
                      <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.commentText.message}</Text>
                    }
                </>
              )}
              name="commentText"
          />
          <TouchableOpacity style={{ borderWidth: 0.3, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, alignSelf: 'center' }} 
            onPress={handleSubmit(addComment)}
          >
            <Text>Add Comment</Text>
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
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffff', // Add a semi-transparent white background
    padding: 22,
    borderRadius: 4,
    height: 200,
  },
  modalHeader: {
    fontSize: 20,
  },
  input: {
    fontSize: 20,
    height: 50,
    width: '100%',
    textAlign: 'center'
  },
});

export default AddCommentModal;

