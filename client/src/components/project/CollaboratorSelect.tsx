import React, { useState} from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import CollaboratorAvatar from '../avatars/CollaboratorAvatar';
import Checkbox from '../checkbox';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SelectCollabProps = {
    collaborator: {
      id: string;
      fullname: string;
      email: string;
      avatar: object;
      __typename: string;
    };
    projectCollaboratorsEmail: any[],
    onSelect: (email: string) => void;
    onDeselect: (email: string) => void;
  };

const CollaboratorSelect: React.FC<SelectCollabProps> = ({ projectCollaboratorsEmail, collaborator, onSelect, onDeselect }) => {
    const [selected, setSelected] = useState(false)
    const [selectable, setSelectable] = useState(!projectCollaboratorsEmail?.includes(collaborator.email))
    
    const toggleCollaboratorSelect = () =>{
        setSelected(!selected)
        if(!selected){
            onSelect(collaborator.email)
        } else {
            onDeselect(collaborator.email)
        }
    }
    return (
        <TouchableOpacity style={styles.container}
            onPress={() => selectable ? toggleCollaboratorSelect() : null}
        >
            <View style={styles.content}>
                { selectable &&
                    <Checkbox
                        isChecked={selected}
                        onPress={() => toggleCollaboratorSelect()}
                    /> 
                }
                { !selectable &&
                    <View style={styles.icon}>
                        <MaterialCommunityIcons name={'circle-slice-8'} size={30}/> 
                    </View>
                }
                <Text>{collaborator.email}</Text>
                <View style={styles.avatarContainer}>
                    <CollaboratorAvatar 
                        key={collaborator.id} 
                        collaborator={collaborator} 
                        style={styles.avatar}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    container: { 
        marginRight:10,
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'flex-start'
    },
    content: { flex: 1 ,flexDirection: 'row', alignItems: 'center', gap: 10 },
    icon: {paddingVertical:5,paddingHorizontal: 10},
    avatarContainer: { marginLeft: 'auto'},
    avatar: {width: 30, height: 30, borderRadius: 50}
})

export default CollaboratorSelect