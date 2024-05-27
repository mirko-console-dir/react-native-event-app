import React from 'react'
import {TouchableOpacity, StyleSheet, Text} from 'react-native'
import {Feather} from '@expo/vector-icons'

interface EditProfileButtonProps {
    onPress: () => void;
}

const EditProfileButton : React.FC<EditProfileButtonProps>  = ({onPress}) => {

  return (
    <TouchableOpacity style={editProfileButtonStyle.btn} 
    onPress={onPress}
  >
    <Text style={editProfileButtonStyle.text}>Edit Profile</Text>
  </TouchableOpacity>
  )
}

export default EditProfileButton

const editProfileButtonStyle = StyleSheet.create({
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 100,
    backgroundColor: '#D44A82',
    maxWidth: 150
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center'
  }
})
