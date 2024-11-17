import React, { useCallback, useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';

import DatePicker from 'react-native-modern-datepicker';

import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../../../../app/store';
import { updateProject,deleteCollaboratorFromProject } from '../../../reduxReducers/projectSlice';
import { Project } from '../../../utils/interfaces/types';

import { useMutation } from '@apollo/client';
import { EDIT_PROJECT } from '../../../../apollo/mutations/project/projectMutations';
import { DELETE_COLLABORATOR_PROJECT } from '../../../../apollo/mutations/project/projectMutations';

import styles from '../../../styles';
import { Feather } from '@expo/vector-icons';
import AddCollaboratorsModal from '../../modals/project/AddCollaboratorsModal';
import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';

import CollaboratorAvatar from '../../avatars/CollaboratorAvatar'
import { useToast } from '../../../utils/toastContext/ToastContext';

type StackProps = {
  today: string; // Declare the 'today' prop
};
interface InputTypes {
  editedTitle: string;
  expireDate: string;
}
const EditProject = ({today}: StackProps) => {
  const { success, error, warning } = useToast();

  const route = useRoute();
  const { projectId } = route.params as any;
    
  const project: Project | any = useSelector((state: RootState) => {
    return state.projects.projects.find((project) => project.id === projectId);
  });
  
  const { control, handleSubmit, formState: { errors }, setValue } = useForm<InputTypes>({
    defaultValues: {
      editedTitle: project.title,
      expireDate: project.expireDate
    }
  });  

  const handleDateSelected = useCallback((date: string) => {
    setValue('expireDate', date);
    Keyboard.dismiss();
  },[setValue] )

  const [editProject] = useMutation(EDIT_PROJECT);
  const dispatch = useDispatch();

  const handleSubmitEditProject = useCallback(async (formData: any) => {
    const {editedTitle, expireDate} = formData
    if(project.title == editedTitle && project.expireDate == expireDate) return warning('Nothing to edit')

      try {
        const editedProject = await editProject({
          variables: {
            projectId: projectId,
            input: {
              title: editedTitle.trim(),
              expireDate: expireDate,
            },
          },
        });
  
        dispatch(updateProject({projectId: editedProject.data.editProject.id, title: editedProject.data.editProject.title , expireDate: editedProject.data.editProject.expireDate}));
        
        success('Success')
      } catch (err) {
        error('Something wrong')
      }
   
  }, [dispatch, editProject, error, project.title, project.expireDate, projectId, success, warning]);


  // Add Collaborator Modal
  const [isCollaboratorModalVisible, setCollaboratorModalVisible] = useState(false);
  const toggleCollaboratorModal = useCallback(() => {
        setCollaboratorModalVisible(prev=>!prev);
  },[]);
  // END Add Collaborator Modal

  const handleSave = useCallback(() => {
    handleSubmit(handleSubmitEditProject)();
  }, [handleSubmit, handleSubmitEditProject]);

  // Save button
  useNavigationOptions({headerRight: ()=> 
    <View style={styles.viewProjectPage.header.projectViewActions}>
      <TouchableOpacity onPress={toggleCollaboratorModal}>
        <Feather name={'user-plus'} size={25} />
      </TouchableOpacity>
      <SaveButton onPress={handleSave}/>
    </View>
  });
  // END Save button
  
  const [deleteCollaboratorProject] = useMutation(DELETE_COLLABORATOR_PROJECT);

  const deleteCollaborator = async (collaboratorId: string) => {
    try{
      const deletedCollaborator = await deleteCollaboratorProject({
        variables: {
          projectId: projectId, 
          collaboratorId: collaboratorId
        }
      })
      if(deletedCollaborator){
        dispatch(deleteCollaboratorFromProject({projectId:projectId,collaboratorId:collaboratorId}))
      }
      success('Collaborator deleted')
    }catch(err){
      error('Something Wrong')
    }
  }

  const askConfirmDelete = (collaboratorId: string, nameCollaborator: string) =>
    Alert.alert('Delete Collaborator?', `${nameCollaborator} will not be able to see the project and relative tasks`, [
      {text: 'Cancel', onPress: () => {}},
      {text: 'OK', onPress: () => deleteCollaborator(collaboratorId)}
  ])

  const renderCollaborator = ({item}: any) => {
    return (
      <View style={{paddingVertical: 5,flexDirection:'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <CollaboratorAvatar 
              collaborator={item} 
              style={{width: 30, height: 30, borderRadius: 50}}
            />
          <View style={{flexDirection:'column', alignItems: 'center'}}>
            <Text>{item.fullname}</Text>
            <Text>{item.email}</Text>
          </View>
          <TouchableOpacity onPress={() => askConfirmDelete(item.id, item.fullname)}>
            <Feather name={'trash-2'} size={20} color={'red'}/>
          </TouchableOpacity>
      </View>
    )
  }

  return (
      <SafeAreaView style={{flex:1}}>
            <AddCollaboratorsModal 
              isVisible={isCollaboratorModalVisible} 
              onClose={toggleCollaboratorModal} 
              projectId={projectId} 
            />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.editProjectPage}>
              <View style={styles.container}>
                <View style={[styles.editProjectPage.main]}>
                  <View style={styles.editProjectPage.main.form}>
                    <View style={styles.editProjectPage.main.form.inputContainer}>
                    <Controller
                        control={control}
                        render={({ field }) => (
                          <>
                              <TextInput
                                placeholder="Add Title"
                                value={field.value}
                                onChangeText={field.onChange}
                                style={[styles.editProjectPage.main.form.inputContainer.input,styles.editProjectPage.main.form.inputContainer.inputTitle ]}
                                multiline={true}
                                numberOfLines={2}
                              />
                              {errors.editedTitle && 
                                <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.editedTitle.message}</Text>
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
                      <FlatList
                        data={project.collaborators}
                        keyExtractor={(collaborator) => collaborator.id}
                        renderItem={renderCollaborator}
                        style={{marginBottom: 20}}
                      />
                      <Text >Select a Date</Text>
                      <View style={styles.editProjectPage.main.form.dateInputContainer}>
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
                          current={today}
                          selected={project.expireDate}
                          mode="calendar"
                          minuteInterval={30}
                          style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                          onSelectedChange={date => handleDateSelected(date)}
                          projectsDate={[project.expireDate]}
                          todosDate={[]}
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
  
  export default EditProject;
