import React from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { deleteCollaboratorFromUser } from '../../reduxReducers/userSlice';

import {Feather} from '@expo/vector-icons';
import styles from '../../styles';

import { useMutation } from '@apollo/client';
import { DELETE_COLLABORATOR } from '../../../apollo/mutations/user/userMutations';

import CollaboratorAvatar from '../avatars/CollaboratorAvatar';
import { useToast } from '../../utils/toastContext/ToastContext';

type CollabProps = {
    collaborator: {
      id: string;
      fullname: string;
      email: string;
      avatar: object;
    };
};

const CollaboratorDetails: React.FC<CollabProps> = ({ collaborator }) => {
    const { success, error, warning } = useToast();

    const dispatch = useDispatch()
    const [deleteCollaboratorUser] = useMutation(DELETE_COLLABORATOR);
    const deleteCollaborator = async (collaboratorId: string) => {
        try{
          await deleteCollaboratorUser({
            variables: {
              collaboratorId: collaboratorId
            }
          })
          dispatch(deleteCollaboratorFromUser({collaboratorId: collaboratorId}))
          success('Collaborator Deleted')
        }catch(err){
          error('Error deleting Collaborator');
        }
    }

    const askConfirmDelete = (collaboratorId: string, nameCollaborator: string) =>
      Alert.alert('Delete Collaborator?', `${nameCollaborator} will not be able to see the project and relative tasks`, [
        {text: 'Cancel', onPress: () => {}},
        {text: 'OK', onPress: () => deleteCollaborator(collaboratorId)}
      ])

    return (
        <View style={{ flex: 1 ,flexDirection: 'row', alignItems: 'center', gap: 20, padding:10 }}>
            <TouchableOpacity onPress={() => askConfirmDelete(collaborator.id, collaborator.fullname)}>
                <Feather name={'trash-2'} size={20} color={'red'}/>
            </TouchableOpacity>
            <View style={{ flex: 1 ,flexDirection: 'column', alignItems: 'flex-start', gap: 5 }}>
                <Text style={styles.h2}>{collaborator.fullname}</Text>
                <Text style={styles.h3}>{collaborator.email}</Text>
            </View>
            <CollaboratorAvatar 
                collaborator={collaborator} 
                style={{width: 40, height: 40, borderRadius: 50}}
            />
        </View>
    )
}

export default CollaboratorDetails