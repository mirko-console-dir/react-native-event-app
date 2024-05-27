import React, {useState} from 'react'
import { View, Text, TouchableOpacity,StyleSheet,LayoutAnimation } from 'react-native';

import CollaboratorAvatar from '../avatars/CollaboratorAvatar';
import Checkbox from '../checkbox';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

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
        <TouchableOpacity style={{ marginRight:10,flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}
            onPress={() => selectable ? toggleCollaboratorSelect() : null}
        >
            <View style={{ flex: 1 ,flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                { selectable &&
                    <Checkbox
                        isChecked={selected}
                        onPress={() => toggleCollaboratorSelect()}
                    /> 
                }
                { !selectable &&
                    <View style={{paddingVertical:5,paddingHorizontal: 10}}>
                        <MaterialCommunityIcons name={'circle-slice-8'} size={30}/> 
                    </View>
                }
                <Text>{collaborator.email}</Text>
                <View style={{ marginLeft: 'auto'}}>
                    <CollaboratorAvatar 
                        key={collaborator.id} 
                        collaborator={collaborator} 
                        style={{width: 30, height: 30, borderRadius: 50}}
                    />
                </View>
            </View>
        </TouchableOpacity>
    )
}


export default CollaboratorSelect