import React, { useState } from 'react';
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
  TouchableWithoutFeedback
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
import AskConfirmationModal from '../../modals/AskConfirmationModal';
import ConfirmCompletedActionModal from '../../modals/ConfirmCompletedActionModal';
import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';

import CollaboratorAvatar from '../../avatars/CollaboratorAvatar'

type StackProps = {
  today: string; // Declare the 'today' prop
};
interface InputTypes {
  editedTitle: string;
  expireDate: string;
}
const EditProject = ({today}: StackProps) => {
  const route = useRoute();

  const { projectId } = route.params as any;
    
  const project: Project | any = useSelector((state: RootState) => {
    return state.projects.projects.find((project) => project.id === projectId);
  });
  
  const navigation = useNavigation<any>();

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<InputTypes>({
    defaultValues: {
      editedTitle: project.title,
      expireDate: project.expireDate
    }
  });  

  const handleDateSelected = (date: string) => {
    setValue('expireDate', date);
    Keyboard.dismiss();
  }

  const [editProject] = useMutation(EDIT_PROJECT);
  const dispatch = useDispatch();

  const handleSubmitEditProject = async (formData: any) => {
    const {editedTitle, expireDate} = formData

    if(editedTitle != project.title || expireDate != project.expireDate) {
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
        
        navigation.goBack() 
      } catch (error) {
        console.error('Error editing project:', error);
        // Handle the error, e.g., show an error message
      }
    } else {
      console.log('====================================');
      console.log('nothing to change');
      console.log('====================================');
      navigation.goBack()
    }
  };

  // Add Collaborator Modal
  const [isCollaboratorModalVisible, setCollaboratorModalVisible] = useState(false);
  const toggleCollaboratorModal = () => {
      if(Platform.OS === 'android') {
        setCollaboratorModalVisible(!isCollaboratorModalVisible);
      } else {
        setCollaboratorModalVisible(!isCollaboratorModalVisible);
      }
  };
  // END Add Collaborator Modal

  const ProjectEditActions = () => {
    return (
      <View style={styles.viewProjectPage.header.projectViewActions}>
          <TouchableOpacity onPress={toggleCollaboratorModal}>
            <Feather name={'user-plus'} size={25} />
          </TouchableOpacity>
          <SaveButton onPress={handleSubmit(handleSubmitEditProject)}/>
      </View>
    )
  }
  useNavigationOptions({headerRight: ProjectEditActions});

  /* CONFIRM ACTION MODAL */
  const [confirmActionModalVisible, setConfirmActionModalVisible] = useState(false)
  const toggleConfirmActionModal = () => {
   setConfirmActionModalVisible(!confirmActionModalVisible)
  }
  /*END  CONFIRM ACTION MODAL */
  const [isModalConfirmDeleteVisible, setModalConfirmDeleteVisible] = useState(false);
  const askConfirmDelete = () => {
      setModalConfirmDeleteVisible(true)
  }
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
      toggleConfirmActionModal()
    }catch(error){
      console.log('====================================');
      console.log(error);
      console.log('====================================');
    }finally{
      setModalConfirmDeleteVisible(false)
    }
  }

  const renderCollaborator = ({item}: any) => {
    return (
      <View style={{paddingVertical: 5,flexDirection:'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <AskConfirmationModal
              isVisible={isModalConfirmDeleteVisible}
              message={'Delete collaborator'}
              onConfirm={() => deleteCollaborator(item.id)}
              onCancel={() => setModalConfirmDeleteVisible(false)}
            />
            <CollaboratorAvatar 
              collaborator={item} 
              style={{width: 30, height: 30, borderRadius: 50}}
            />
          <View style={{flexDirection:'column', alignItems: 'center'}}>
            <Text>{item.fullname}</Text>
            <Text>{item.email}</Text>
          </View>
          <TouchableOpacity onPress={() => askConfirmDelete()}>
            <Feather name={'trash-2'} size={20} color={'red'}/>
          </TouchableOpacity>
      </View>
    )
  }

  return (
      <SafeAreaView style={{flex:1}}>
            <ConfirmCompletedActionModal 
              isVisible={confirmActionModalVisible} 
              onClose={toggleConfirmActionModal} />
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
