import React from 'react'
import {TouchableOpacity, Text} from 'react-native'

interface SaveButtonProps {
    onPress: () => void;
}

const SaveButton : React.FC<SaveButtonProps>  = ({onPress}) => {

  return (
    <TouchableOpacity style={{paddingHorizontal: 15, paddingVertical: 10}} onPress={onPress}>
        <Text>Save</Text>
    </TouchableOpacity>
  )
}

export default SaveButton