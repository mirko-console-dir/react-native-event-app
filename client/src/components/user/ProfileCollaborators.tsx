import React, { useState} from 'react'
import {
    SafeAreaView,
    View,
    FlatList,
} from 'react-native';

import { useSelector } from "react-redux";
import { RootState } from '../../../app/store';

import { UserLoggedIn } from '../../utils/interfaces/types';

import styles from '../../styles';
import { Collaborator } from '../../utils/interfaces/types';

import PlusButton from '../buttons/PlusButton';
import CollaboratorDetails from '../user/CollaboratorDetails'
import AddCollaboratorModal from '../modals/user/AddCollaboratorModal';

const ProfileCollaborators = () => {
    // Add Collaborator Modal
    const [isCollaboratorModalVisible, setCollaboratorModalVisible] = useState(false);
    const toggleCollaboratorModal = () => {
        setCollaboratorModalVisible(prev=>!prev)
    }
    // END Add Collaborator Modal
    const user: UserLoggedIn | any = useSelector((state: RootState) => {
      return state.user.user
    });

    const renderCollaborator = ({item}:{item: Collaborator}) => {
        return (
            <CollaboratorDetails collaborator={item}/>
        )
    }
    return (
        <SafeAreaView style={{flex:1}}>
            <View style={styles.profileCollaboratorsPage}>
                <View style={styles.profileCollaboratorsPage.container}>
                    <FlatList
                        data={user?.collaborators || []}
                        keyExtractor={(coll: any) => coll.id}
                        renderItem={renderCollaborator}
                        style={{marginTop: 10,  maxHeight: 270 }}
                    />
                </View>
                <PlusButton onPress={toggleCollaboratorModal}/>
                <AddCollaboratorModal 
                    isVisible={isCollaboratorModalVisible} 
                    onClose={toggleCollaboratorModal} 
                />
            </View>
        </SafeAreaView>
    )
}


export default ProfileCollaborators