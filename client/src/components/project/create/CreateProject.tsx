import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ActivityIndicator,
  Alert
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import styles from '../../../styles';

import { useMutation } from '@apollo/client';
import { CREATE_PROJECT } from '../../../../apollo/mutations/project/projectMutations';

import DatePicker from 'react-native-modern-datepicker';
import AddCollaboratorsModal from '../../modals/project/AddCollaboratorsModal';

import { useDispatch } from 'react-redux';
import { addProject } from '../../../reduxReducers/projectSlice';
import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';
import { useToast } from '../../../utils/toastContext/ToastContext';


type StackProps = {
  today: string; // Declare the 'today' prop
};

interface InputTypes {
  title: string;
  expireDate: string;
}

const CreateProject = ({today}: StackProps) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  const { success,error : errorToast, warning } = useToast();

  const navigation = useNavigation<any>();
  const [selectedDate, setSelectedDate] = useState(null)

  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  

  const [createProject, { data, error, loading }] = useMutation(CREATE_PROJECT);
  const dispatch = useDispatch();

  const [newProjectCreated, setNewProjectCreated] = useState({
    projectId: '',
    projectTitle: '',
    expireDate: ''
  }); 

  // Close keybord avoid conflict with data picker onChange and setValue form
  const handleDateSelected = useCallback((date: string) => {
    date ?? setSelectedDate(date);
    
    setValue('expireDate', date);
    if(errors.expireDate){
      clearErrors("expireDate") 
    }
    Keyboard.dismiss();
  }, [clearErrors, errors.expireDate, setValue]);
  
  // END Close keybord avoid conflict with data picker onChange and setValue form
  // Ask if want to add collaborator 
  const [collaboratorModal, setCollaboratorModal] = useState(false)
  const toggleAddCollabModal = () =>{
    setCollaboratorModal(prev=> !prev)
  }

  const askCollaborator = () =>
    Alert.alert('Add a Collaborator for the task?', 'Collaborate with other users', [
      {text: 'Maybe Later', onPress: () => {
        navigation.navigate('TodoStack', {screen:'Create Task', params: { projectId: newProjectCreated.projectId, projectTitle: newProjectCreated.projectTitle, projectExpireDate: newProjectCreated.expireDate}})
        }
      },
      {text: 'OK', onPress: () => toggleAddCollabModal()}
  ])
  // END Ask if want to add collaborator 

  const handleCreateProject = useCallback(async (formData: InputTypes) => {
    const {title, expireDate} = formData

    if (title.trim() === '' || !expireDate) {
      if(title.trim() === ''){
        setError("title", {
          message: "You must enter a title",
        })
      }
      if(!expireDate){
        setError("expireDate", {
          message: "You must select a date",
        })
      }
      return;
    } 
    try {
      const result = await createProject({
        variables: {
          input: {
            title: title.trim(),
            expireDate
          },
        }
      })
      const newProject = result.data.createProject
      dispatch(addProject(newProject));
      setNewProjectCreated({
        projectId: newProject.id,
        projectTitle: newProject.title,
        expireDate: newProject.expireDate
      });  
      resetValueForm()
      success('Event Created')
      askCollaborator()

    } catch (err) {
      errorToast('Error creating Event');
    }  
  }, [askCollaborator, createProject, dispatch, errorToast, setError, success]);
 
  const resetValueForm = () => {
    reset({ title: '', expireDate: '' })
    clearErrors("title") 
    clearErrors("expireDate") 
    setSelectedDate(null)
  }

  const handleSave = useCallback(() => {
    handleSubmit(handleCreateProject)();
  }, [handleSubmit, handleCreateProject]);

  // Save button
  useNavigationOptions({headerRight: ()=> <SaveButton onPress={handleSave}/>});
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
        <KeyboardAwareScrollView>
          <TouchableWithoutFeedback onPress={()=> Keyboard.dismiss()}>
            <View style={styles.createProjectPage}>
              <View style={styles.container}>
                <View style={[styles.createProjectPage.main]}>
                  <View style={styles.createProjectPage.main.form}>
                    <View style={styles.createProjectPage.main.form.inputContainer}>
                      <Controller
                        control={control}
                        render={({ field }) => (
                          <>
                              <TextInput
                                placeholder="Add Title"
                                value={field.value}
                                onChangeText={field.onChange}
                                style={[styles.createProjectPage.main.form.inputContainer.input,styles.createProjectPage.main.form.inputContainer.inputTitle ]}
                                multiline={true}
                                numberOfLines={2}
                              />
                              {errors.title && 
                                <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.title.message}</Text>
                              }
                          </>
                          
                        )}
                        name="title"
                      />
                    </View>
                    <Text>Select a Date</Text>
                    <View style={styles.createProjectPage.main.form.dateInputContainer}>
                      <DatePicker
                        options={{
                          backgroundColor: 'trasparent',
                          textHeaderColor: '#324A2A',
                          textDefaultColor: '#3A612D',
                          selectedTextColor: '#fff',
                          mainColor: '#F4722B',
                          textSecondaryColor: '#324A2A',
                          borderColor: 'none',
                          textFontSize: 15,
                          textHeaderFontSize: 15,
                        }}
                        selected={selectedDate ?? ''}
                        current={today}
                        mode="calendar"
                        minuteInterval={30}
                        style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                        onDateChange={date => handleDateSelected(date)}
                        projectsDate={[]}
                        todosDate={[]}
                      />
                      {errors.expireDate && 
                        <Text style={{color:'red',marginTop: 10}}>{errors.expireDate.message}</Text>
                      }
                    </View>
                  </View>
                </View>
              </View>
              {newProjectCreated.projectId && 
                <AddCollaboratorsModal 
                  isVisible={collaboratorModal} 
                  onClose={()=>{toggleAddCollabModal(),askCollaborator()}} 
                  projectId={newProjectCreated?.projectId} 
                />
              }
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
      </SafeAreaView>
  );
};

export default CreateProject;