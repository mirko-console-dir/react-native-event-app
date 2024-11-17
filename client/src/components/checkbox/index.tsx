import { TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

interface CheckBoxProps {
  isChecked: boolean;
  onPress: () => void;
}

const Checkbox = (props: CheckBoxProps) => {
  
  const { onPress } = props;

  const name = props.isChecked ? 'checkbox-marked-circle-outline' : 'checkbox-blank-circle-outline';
  
  return (
    <TouchableOpacity onPress={onPress} style={{flexDirection: 'column',justifyContent: 'center', paddingVertical:5, paddingHorizontal: 10}}>
      <MaterialCommunityIcons name={name} size={30} color="black"/>
    </TouchableOpacity>
  )
}

export default React.memo(Checkbox)