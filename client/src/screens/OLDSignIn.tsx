import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';

import { useDispatch } from 'react-redux';
import { setUser } from '../reduxReducers/userSlice';

import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import { useMutation } from '@apollo/client';
import { LOGIN_USER } from '../../apollo'; 

interface InputTypes {
  email: string;
  password: string;
}

const SignIn = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch()

  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  
  const [showPassword, setShowPassword] = useState(false);


  const [loginUser, { error }] = useMutation(LOGIN_USER, {
    onCompleted(data) {
      if (data.loginUser.accessToken && data.loginUser.refreshToken) {
        AsyncStorage.removeItem('user')
      
        console.log('====data.loginUser.user=======');
        console.log(data.loginUser.user);
        const userLoggedIn = {
          id: data.loginUser.user.id,
          fullname: data.loginUser.user.fullname,
          email: data.loginUser.user.email,
          avatar: data.loginUser.user.avatar,
          collaborators: data.loginUser.user.collaborators
        }

        dispatch(setUser(userLoggedIn))

        AsyncStorage.setItem('user', JSON.stringify(data.loginUser.user))
        // Save the tokens in SecureStore
        SecureStore.setItemAsync('userAccessToken', data.loginUser.accessToken)
          .then(() => SecureStore.setItemAsync('userRefreshToken', data.loginUser.refreshToken))
          .then(() => {
            Alert.alert('Success', 'Logged In Successfully.');
            
            navigation.navigate('Tabs', {screen: 'Home'})
          })
          .catch((error) => {
            // Handle errors saving the token here
            Alert.alert('An error occurred', 'Failed to save token', error);
          });
      }
    },
    onError(err) {
      Alert.alert('An error occurred', err.message);
    },
  });

  const onSubmit = (formData: InputTypes) => {
    const {email, password} = formData

    loginUser({ variables: { email: email.toLowerCase(), password: password } });
  };

  return (
    <SafeAreaView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}>
        <View style={{ padding: 20, marginTop: 50}}>
          <Controller
            control={control}
            render={({ field }) => (
              <>
                <TextInput
                  placeholder="Enter email"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                />

                {errors.email && 
                    <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.email.message}</Text>
                }
              </>
              )}
              name="email"
              rules={{ 
                required: 'You must enter your email',
                validate: (value) => {
                  // Check if the trimmed value is an empty string
                  if (value.trim() === '') {
                    return 'Email cannot be empty';
                  }
                  return true;
                },
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email format",
                },
            }}
          />
          <Controller
            control={control}
            render={({ field }) => (
              <>
                <View style={styles.passInputContainer}>
                  <TextInput
                    placeholder="Enter Password"
                    value={field.value}
                    onChangeText={field.onChange}
                    style={styles.input}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && 
                    <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.password.message}</Text>
                }
              </>
              )}
              name="password"
              rules={{ 
                required: 'You must enter your password',
                validate: (value) => {
                  // Check if the trimmed value is an empty string
                  if (value.trim() === '') {
                    return 'Password cannot be empty';
                  }
                  return true;
                },
            }}
          />
          <TouchableOpacity 
              onPress={handleSubmit(onSubmit)}
              style={{
                  backgroundColor: '#e33062',
                  height: 50,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 30
              }}
          >
              <Text style={{
                  color: 'black',
                  fontSize: 18,
                  fontWeight: 'bold'
                  }}    
              >
                  Sign In
              </Text>
          </TouchableOpacity>
          <TouchableOpacity 
              onPress={() => navigation.navigate('SignUp')}
              style={{
                  height: 50,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 30
              }}
          >
              <Text style={{
                  color: 'black',
                  fontSize: 18,
                  fontWeight: 'bold'
                  }}  
              >
                  New here? Sign Up
              </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      width: '100%',
      color: 'black',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    input:{
      color: 'black',
      fontSize: 18,
      width: '100%',
      height: 50,
      marginVertical: 15,
      borderRadius: 10,
      borderWidth: 0.3,
      padding:10,
    },
    passInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconContainer: {
      position: 'absolute',
      right: 10,
    },
});