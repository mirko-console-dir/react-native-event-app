import React from 'react'
import {TouchableOpacity, StyleSheet} from 'react-native'
import {Feather} from '@expo/vector-icons'

interface PlusButtonProps {
    onPress: () => void;
}

const PlusButton : React.FC<PlusButtonProps>  = ({onPress}) => {

  return (
    <TouchableOpacity style={plusButtonStyle.btn} 
    onPress={onPress}
  >
    <Feather style={plusButtonStyle.icon} name={"plus"} size={30}  color='black'/>
  </TouchableOpacity>
  )
}

export default PlusButton

const plusButtonStyle = StyleSheet.create({
  btn: {
    padding: 10,
    borderRadius: 100,
    width: 55,
    height: 55,
    backgroundColor: '#D44A82',
    position: 'absolute',
    bottom: 5,
    right: 10,
  },
  icon: {
    alignSelf: 'center', marginTop: 'auto', marginBottom: 'auto'
  }
})
