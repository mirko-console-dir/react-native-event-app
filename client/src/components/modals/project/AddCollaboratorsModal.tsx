import React, {useEffect, useState}from 'react';
import { TouchableWithoutFeedback,View, Text, TextInput, TouchableOpacity, StyleSheet,LayoutAnimation,FlatList } from 'react-native';
import Modal from "react-native-modal";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootState } from '../../../../app/store';
import { useSelector, useDispatch } from 'react-redux';
import { addCollaboratorsToProject } from '../../../reduxReducers/projectSlice';
import { addCollaboratorUser } from '../../../reduxReducers/userSlice';

import { useForm, Controller } from 'react-hook-form';

import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import { useMutation } from '@apollo/client';
import { ADD_COLLABORATOR_TO_PROJECT } from '../../../../apollo/mutations/project/projectMutations';

import CollaboratorSelect from '../../project/CollaboratorSelect';
import { UserLoggedIn,Project } from '../../../utils/interfaces/types';
import { useToast } from '../../../utils/toastContext/ToastContext';

interface AddCollaboratorsModalProps {
  isVisible: boolean;
  onClose: () => void;
  projectId: string; // Pass the projectId to the modal
}
interface InputTypes {
  collaboratorEmail: string;
}
const AddCollaboratorsModal: React.FC<AddCollaboratorsModalProps> = ({ isVisible, onClose, projectId }) => {
  const { success, error } = useToast();

  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

  const userLoggedIn: UserLoggedIn | any = useSelector((state: RootState) => {
    return state.user.user
  });
  
  const project: Project | any = useSelector((state: RootState) => {
    return state.projects.projects.find((project) => project.id === projectId);
  }); 

  useEffect(() => {
    if(project){
      setCurrentProjectCollaboratorsEmail(project?.collaborators?.map((collaborator: any) => collaborator.email),)
    }
  }, [project])

  const [currentProjectCollaboratorsEmail, setCurrentProjectCollaboratorsEmail] = useState(project?.collaborators?.map((collaborator: any) => collaborator.email))
  
  const [addCollaboratorToProject] = useMutation(ADD_COLLABORATOR_TO_PROJECT);
  const dispatch = useDispatch()
  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  

  const [historyCollaborators, setHistoryCollaborators] = useState(false);
  const [errorCollaboratorList, setErrorCollaboratorList] = useState(false);

  /* Add collaborator manually */
  const handleAddCollaborator = async (formData: InputTypes) => {
    const {collaboratorEmail} = formData

    try {

      if(historyCollaborators && collaboratorsEmailSelected.length == 0){
        return setErrorCollaboratorList(true)
      } else {
        setErrorCollaboratorList(false)
      }
      
      const result = await addCollaboratorToProject({
        variables: {
          projectId: projectId,
          collaboratorEmails: !historyCollaborators ? [collaboratorEmail.toLowerCase().trim()]: collaboratorsEmailSelected,
        },
      });
      //toggleConfirmActionModal()
      const collaborators = result.data.addCollaboratorToProject
      if(collaborators.length) {
        dispatch(addCollaboratorsToProject({projectId: projectId, collaborators: collaborators}))
        dispatch(addCollaboratorUser({collaborators: collaborators}))
      }
      reset()
      setCollaboratorsEmailSelected([])
      setHistoryCollaborators(false)
      success('Collaborator added')
      onClose()
    } catch (err) {
      error(`Error adding Collaborator`)
    }
  };
  /* END Add collaborator manually */

  /* Add collaborators from list */
  const [collaboratorsEmailSelected, setCollaboratorsEmailSelected] = useState<string[]>([]);

  useEffect(()=>{
    if(!historyCollaborators){
      setCollaboratorsEmailSelected([])
    }
  }, [historyCollaborators])

  useEffect(()=>{
    setErrorCollaboratorList(false)
  }, [collaboratorsEmailSelected])

  const handleAddSelectedCollaborator = (email: string) => {
    setCollaboratorsEmailSelected(prevSelected => [...prevSelected, email]);
  };
  const handleRemoveSelectedCollaborator = (email: string) => {
    setCollaboratorsEmailSelected(collaboratorsEmailSelected.filter(selectedEmail => selectedEmail !== email));
  };
  const renderPrevCollaborator = ({ item }:any) => {
    return (
      <CollaboratorSelect 
        collaborator={item}
        projectCollaboratorsEmail={currentProjectCollaboratorsEmail}
        onSelect={(email: string) => handleAddSelectedCollaborator(email)}
        onDeselect={(email: string) => handleRemoveSelectedCollaborator(email)}
      />
    );
  };
  /* END Add collaborators from list */

  const close = () => {
    reset()
    setCollaboratorsEmailSelected([]);
    setHistoryCollaborators(false);
    onClose()
  }
  return (
      <Modal isVisible={isVisible} onBackdropPress={close} >
        <View style={styles.modalContent}>
          {!historyCollaborators ? 
            <React.Fragment>
              <Text style={styles.modalHeader}>Insert the collaborator's email</Text>
              <Controller
                control={control}
                render={({ field }) => (
                  <>
                    <TextInput
                      placeholder="Email Collaborator"
                      value={field.value}
                      onChangeText={field.onChange}
                      style={styles.input }
                      multiline={true}
                      numberOfLines={2}
                    />
                    {errors.collaboratorEmail && 
                        <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.collaboratorEmail.message}</Text>
                      }
                  </>
                )}
                name="collaboratorEmail"
                rules={{ 
                  required: "You must enter collaborator's email",
                  validate: (value) => {
                    // Check if the trimmed value is an empty string
                    if (value.trim() === '') {
                      return 'Email cannot be empty';
                    }
                    return true;
                  },
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Enter a valid email format",
                  },
                }}
              />
              <TouchableOpacity style={{ borderWidth: 0.3, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, alignSelf: 'center' }} 
                onPress={handleSubmit(handleAddCollaborator)}
              >
                <Text>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ borderWidth: 0.3,paddingHorizontal: 10, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto', marginTop: 20}}
                onPress={() => setHistoryCollaborators(!historyCollaborators)}
              >
                    <MaterialCommunityIcons name={"history"} size={25}  color='black'/>
                    <Text>Previous Collaborators</Text>
              </TouchableOpacity>
            </React.Fragment>
            :
            <React.Fragment>
                <FlatList
                  data={userLoggedIn?.collaborators || []}
                  keyExtractor={(coll: any) => coll.id}
                  renderItem={renderPrevCollaborator}
                  style={{ width: '100%', marginBottom: 20 }}
                />
              {!userLoggedIn?.collaborators.length &&
                <View style={{flex:1}}>
                  <Text>No Collaborators Yet</Text>
                </View>
              }
              {errorCollaboratorList && 
               <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>Select min one collaborator</Text>
              }
              {userLoggedIn?.collaborators.length && currentProjectCollaboratorsEmail?.length < userLoggedIn?.collaborators.length ?
                <TouchableOpacity style={{ borderWidth: 0.3, paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, alignSelf: 'center' }} 
                  onPress={handleSubmit(handleAddCollaborator)}
                >
                  <Text>Add selected</Text>
                </TouchableOpacity>: null
              }
              <TouchableOpacity style={{ borderWidth: 0.3,paddingHorizontal: 25, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-end', marginTop: 20, flexDirection: 'row', alignItems: 'center', gap: 5 }} 
                onPress={()=>setHistoryCollaborators(!historyCollaborators)}
              >
                <Text>Back</Text>
              </TouchableOpacity>
            </React.Fragment>
          }
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
    minHeight: 250,
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

export default AddCollaboratorsModal;

