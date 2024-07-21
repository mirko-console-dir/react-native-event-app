import React, { useCallback } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import styles from '../../../styles';

import { useDispatch } from 'react-redux';
import { addMemo } from '../../../reduxReducers/memoSlice';

import { CREATE_MEMO } from '../../../../apollo/mutations/memo/memoMutations';
import { useMutation } from '@apollo/client';

import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';

interface InputTypes {
  title: string;
  content: string;
}

const CreateMemo = () => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const { control, handleSubmit, reset, formState: { errors } } = useForm<InputTypes>();

  const [createMemo, { data, error, loading }] = useMutation(CREATE_MEMO);
  const dispatch = useDispatch()

  const handleCreateMemo = useCallback(async (formData : any) => {
    const { title, content } = formData;

      try {
        const result = await createMemo({
          variables: {
            input: {
              title: title.trim(),
              content: content.trim(),
            },
          }
        })
        console.log('Memo created:', result.data.createMemo);

        const newMemo = result.data.createMemo
        dispatch(addMemo(newMemo))
  
      } catch (error) {
        console.error('Error creating todo list client:', error);
      } finally {
        reset()
      }
    
  },[createMemo, dispatch, reset]);

    // Save button
    const SaveButtonMemo = useCallback(() => (
      <SaveButton onPress={handleSubmit(handleCreateMemo)}/>
    ), [handleCreateMemo, handleSubmit]);
    useNavigationOptions({headerRight: SaveButtonMemo});


    // END Save button
    if(loading){
      return (
          <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
          </View>
      )
    }
  return (
      <SafeAreaView style={{flex:1}}>
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
                              {errors.title && 
                                <Text style={{color:'red'}}>{errors.title.message}</Text>
                              }
                            </>
                            
                          )}
                          name="title"
                          defaultValue=""
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
                              {errors.content && 
                                <Text style={{color:'red'}}>{errors.content.message}</Text>
                              }
                            </>
                          )}
                          name="content"
                          defaultValue=""
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

export default CreateMemo;