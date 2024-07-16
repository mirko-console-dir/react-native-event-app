import React, { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  TouchableWithoutFeedback,
  TextInput,
  Keyboard,
  Platform,
  Text,
  ActivityIndicator
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import styles from '../../../styles';
import { Memo } from '../../../utils/interfaces/types';

import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../../../../app/store';
import { updateMemo } from '../../../reduxReducers/memoSlice';

import { useMutation } from '@apollo/client';
import { EDIT_MEMO } from '../../../../apollo/mutations/memo/memoMutations';

import ConfirmCompletedActionModal from '../../modals/ConfirmCompletedActionModal'
import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';


interface InputTypes {
  editedTitle: string;
  editedContent: string;
}

const EditMemo = () => {
  const navigation = useNavigation<any>();
  
  const route = useRoute();
  const { memoId } = route.params as { memoId: string };

  const memo: Memo | any = useSelector((state: RootState) => {
    return state.memos.memos.find((memo) => memo.id === memoId);
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<InputTypes>({
    defaultValues: {
      editedTitle: memo.title,
      editedContent: memo.content,
    }
  });

  const [editMemo, {loading}] = useMutation(EDIT_MEMO);
  const dispatch = useDispatch()

   /* CONFIRM ACTION MODAL */
   const [confirmActionModalVisible, setConfirmActionModalVisible] = useState(false)
   const toggleConfirmActionModal = () => {
    setConfirmActionModalVisible(!confirmActionModalVisible)
    setTimeout(() => {
      if(confirmActionModalVisible == false){
        navigation.goBack()
      }
    },1000)
   }
   /*END  CONFIRM ACTION MODAL */
  const handleEditMemo = async (formData : any) => {
    const { editedTitle, editedContent } = formData;

    try {
      const editedMemo = await editMemo({
        variables: {
          memoId: memoId,
          input: {
            title: editedTitle.trim(),
            content: editedContent,
          },
        },
      });

      // Handle the response, e.g., show a success message or navigate to another screen
      console.log('Memo edited:', editedMemo.data.editMemo);
      // Update local storage
      const updatedMemo = {
        id: memoId,
        title: editedMemo.data.editMemo.title,
        content: editedMemo.data.editMemo.content,
        owner: editedMemo.data.editMemo.owner,
      };
      dispatch(updateMemo(updatedMemo))
      toggleConfirmActionModal()
      // editProjectInProjectsStorage(updatedProject);
    } catch (error) {
      console.error('Error editing memo:', error);
      // Handle the error, e.g., show an error message
    } finally{
      reset()
    }
  };

  const SaveButtonMemo = () => (
      <SaveButton onPress={handleSubmit(handleEditMemo)}/>
  )
  useNavigationOptions({headerRight: SaveButtonMemo});


  if(loading){
    return (
        <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
        </View>
    )
  }
  return (
    <SafeAreaView style={{flex:1}}>
    <ConfirmCompletedActionModal isVisible={confirmActionModalVisible} onClose={toggleConfirmActionModal}/>

    <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
    <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
          <View style={styles.createMemoPage}>
            <View style={styles.container}>
              <View style={[styles.createMemoPage.main, styles.flexRowAllCenter]}>
                <View style={styles.createMemoPage.main.form}>
                  <View style={styles.createMemoPage.main.form.inputContainer}>
                  <Controller
                    control={control}
                    render={({ field }) => (
                      <>
                      <TextInput
                        placeholder="Add Title"
                        value={field.value}
                        onChangeText={field.onChange}
                        style={[
                          styles.createMemoPage.main.form.inputContainer.input,
                          styles.createMemoPage.main.form.inputContainer.inputTitle,
                        ]}
                        multiline={true}
                        numberOfLines={2}
                      />
                      {errors.editedTitle && 
                        <Text style={{color:'red'}}>{errors.editedTitle.message}</Text>
                      }
                    </>
                    )}
                    name="editedTitle"
                    rules={{ 
                      required: 'You must enter a title',
                      validate: (value) => {
                        // Check if the trimmed value is an empty string
                        if (value.trim() === '') {
                          return 'Title cannot be empty';
                        }
                        return true;
                      },
                    }}
                  />

                  </View>
                  <View style={styles.createMemoPage.main.form.inputContainer}>
                    <Controller
                      control={control}
                      render={({ field }) => (
                        <>
                          <TextInput
                            placeholder="Add memo"
                            value={field.value}
                            onChangeText={field.onChange}
                            style={[
                              styles.createMemoPage.main.form.inputContainer.input,
                              styles.createMemoPage.main.form.inputContainer.inputBigContent,
                            ]}
                            multiline={true}
                            numberOfLines={6}
                          />
                          {errors.editedContent && 
                            <Text style={{color:'red'}}>{errors.editedContent.message}</Text>
                          }
                        </>
                      )}
                      name="editedContent"
                      rules={{ 
                        required: 'You must enter a content',
                        validate: (value) => {
                          // Check if the trimmed value is an empty string
                          if (value.trim() === '') {
                            return 'Content cannot be empty';
                          }
                          return true;
                        },
                      }}
                    />
                  </View>
                </View> 
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

export default EditMemo;
