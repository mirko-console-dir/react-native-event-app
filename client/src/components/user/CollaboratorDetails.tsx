import React, {useState} from 'react'
import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { deleteCollaboratorFromUser } from '../../reduxReducers/userSlice';

import {Feather} from '@expo/vector-icons';
import styles from '../../styles';

import { useMutation } from '@apollo/client';
import { DELETE_COLLABORATOR } from '../../../apollo/mutations/user/userMutations';

import AskConfirmationModal from '../modals/AskConfirmationModal';
import CollaboratorAvatar from '../avatars/CollaboratorAvatar';

type CollabProps = {
    collaborator: {
      id: string;
      fullname: string;
      email: string;
      avatar: object;
    };
};

const CollaboratorDetails: React.FC<CollabProps> = ({ collaborator }) => {
    const dispatch = useDispatch()
    const [isModalConfirmDeleteVisible, setModalConfirmDeleteVisible] = useState(false);
    const askConfirmDelete = () => {
        setModalConfirmDeleteVisible(true)
    }
    const [deleteCollaboratorUser] = useMutation(DELETE_COLLABORATOR);
    const deleteCollaborator = async (collaboratorId: string) => {
        try{
          const deletedCollaborator = await deleteCollaboratorUser({
            variables: {
              collaboratorId: collaboratorId
            }
          })
          if(deletedCollaborator){
            dispatch(deleteCollaboratorFromUser({collaboratorId: collaboratorId}))
          }
        }catch(error){
          console.log('====================================');
          console.log(error);
          console.log('====================================');
        }finally{
          setModalConfirmDeleteVisible(false)
        }
      }

    return (
        <View style={{ flex: 1 ,flexDirection: 'row', alignItems: 'center', gap: 20, padding:10 }}>
            <AskConfirmationModal
              isVisible={isModalConfirmDeleteVisible}
              message={'Delete collaborator'}
              onConfirm={() => deleteCollaborator(collaborator.id)}
              onCancel={() => setModalConfirmDeleteVisible(false)}
            />
            <TouchableOpacity onPress={() => askConfirmDelete()}>
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