import React, {useMemo, useState,useRef}from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ScrollView } from 'react-native';
import Modal from "react-native-modal";
import { useForm, Controller } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { deleteCommentFromTask,updateCommentFromTask } from '../../../reduxReducers/projectSlice';

import { useMutation } from '@apollo/client';
import { DELETE_COMMENT_TODO,EDIT_COMMENT_TODO } from '../../../../apollo/mutations/todo/todoMutations';
import AskConfirmationModal from '../AskConfirmationModal'

interface CommentModalProps {
  isVisible: boolean;
  todoId: string; // Pass the projectId to the modal
  projectId: string;
  onClose: () => void;
  commentItem: any;
  mode: string,
}
interface InputTypes {
    commentText: string
}
const CommentModal: React.FC<CommentModalProps> = ({ isVisible, projectId, todoId, onClose, commentItem, mode }) => { 
    const [commentMode, setCommentMode] = useState(mode)

    const [comment, setComment] = useState(commentItem)

    const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>({
        defaultValues: {
            commentText: commentItem.commentText,
        }
      });   

    /* useEffect(() => {
        setCommentMode(mode)
    },[mode]) */
    useMemo(() => setCommentMode(mode) , [mode]);

    

    /* Edit Comment */
    const [editCommentTodo] = useMutation(EDIT_COMMENT_TODO);
    const dispatch = useDispatch()
    
    const editComment = async (formData: InputTypes) => {
        const {commentText} = formData
        if(commentText != commentItem.commentText) {
            try {
                const { data } = await editCommentTodo({
                    variables: {
                        todoId: todoId,
                        commentId: comment.id,
                        input: {
                            commentText: commentText
                        }
                    },
                });
                if (data.editCommentTodo) {
                    console.log('Comment edited successfully');
                    console.log(data.editCommentTodo);
                    dispatch(updateCommentFromTask({projectId:projectId, taskId: todoId, commentId: commentItem.id, commentText: commentText}))
                } else {
                    console.log('Failed to edit comment');
                    // Handle the failure, e.g., show an error message
                }
            } catch(error) {
                console.log('error edit comment ',error);
            } finally {
                onClose()
            }
        } else {
            console.log('nothing edit');
            onClose()
        }
    }
    /* End Edit Comment */

    /* Delete Comment */
    const [deleteCommentTodo] = useMutation(DELETE_COMMENT_TODO);

    const [isModalConfirmDeleteVisible, setModalConfirmDeleteVisible] = useState(false);
    const askConfirmDelete = () => {
        setModalConfirmDeleteVisible(true)
    }
    const deleteComment = async (commentId: any) => {
        try {
            const { data } = await deleteCommentTodo({
                variables: {
                todoId: todoId,
                commentId: commentId,
                },
            });

            if (data.deleteCommentTodo) {
                console.log('Comment deleted successfully');
                console.log(data.deleteCommentTodo);
                dispatch(deleteCommentFromTask({projectId: projectId, taskId: todoId, commentId: commentId}))
            } else {
                console.log('Failed to delete comment');
                // Handle the failure, e.g., show an error message
            }
        } catch (error) {
        console.error('Error deleting project:', error);
        // Handle the error, e.g., show an error message
        } finally { // run the following code indipendently if success or error
          setModalConfirmDeleteVisible(false)
          onClose()
        }
    }
    /* End Delete Comment */
    const inputRef = useRef<TextInput>(null)


    return (
        <Modal isVisible={isVisible} onBackdropPress={onClose}>
            <AskConfirmationModal
                isVisible={isModalConfirmDeleteVisible}
                message={'Delete comment'}
                onConfirm={() => deleteComment(commentItem.id)}
                onCancel={() => setModalConfirmDeleteVisible(false)}
            />
            <View style={styles.modalContent}>
                <ScrollView style={styles.main} >
                    {commentMode == 'edit' ? 
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
                            rules={{ 
                                required: 'You must enter a comment',
                                validate: (value) => {
                                    // Check if the trimmed value is an empty string
                                    if (value.trim() === '') {
                                        return 'Comment cannot be empty';
                                    }
                                    return true;
                                },
                            }}
                        />
                        : 
                        <>
                            <Text style={[styles.commentText,{textAlign: 'center'}]}>{commentItem.commentText}</Text>
                        </>
                    }
                </ScrollView>
                <View style={styles.actions}>
                    {commentMode == 'edit' ? 
                    <>
                        <TouchableOpacity
                            style={[styles.btn, styles.cancelBtn]} onPress={onClose}
                        >
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSubmit(editComment)}
                            style={[styles.btn, styles.doneBtn]}
                        >
                            <Text>Done</Text>
                        </TouchableOpacity>
                    </>
                    :  
                    <>
                        <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={askConfirmDelete}>
                            <Text>
                                Delete
                            </Text> 
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => setCommentMode('edit')}>
                            <Text>
                                Edit
                            </Text> 
                        </TouchableOpacity>
                    </>
                    }
                </View>
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
        height: 300,
    },
    main: {
        maxHeight: 200,
        width: '100%',
    },
    commentText: {
        fontSize: 18,
    },
    actions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        borderRadius: 20,
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 30,
    },
    editBtn: {
       borderColor: 'green',
       color: 'green'
    },
    deleteBtn: {
        borderColor: 'red',
        color: 'red'
    },
    doneBtn: {
    },
    cancelBtn: {},
    input: {
        fontSize: 20,
        height: 50,
        width: '100%',
        textAlign: 'center'
    },
});

export default CommentModal;

