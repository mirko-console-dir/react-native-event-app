import React from 'react'
import {TouchableOpacity, Text} from 'react-native'

interface SaveButtonProps {
    onPress: () => void;
}

const SaveButton : React.FC<SaveButtonProps>  = ({onPress}) => {
  console.log('SaveButton rendered')
  return (
    <TouchableOpacity style={{paddingHorizontal: 15, paddingVertical: 10}} onPress={onPress}>
        <Text>Save</Text>
    </TouchableOpacity>
  )
}

export default React.memo(SaveButton)