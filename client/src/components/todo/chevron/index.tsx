import { TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

interface ChevronProps {
  show: boolean;
  onPress: () => void;
}

const Chevron = (props: ChevronProps) => {
  
  const { onPress } = props;

  const name = props.show ? 'chevron-up' : 'chevron-down';
  
  return (
    <TouchableOpacity onPress={onPress} style={{flexDirection: 'column',justifyContent: 'center', paddingVertical:15, paddingHorizontal: 10}}>
      <MaterialCommunityIcons name={name} size={30} color="black"/>
    </TouchableOpacity>
  )
}

export default React.memo(Chevron)