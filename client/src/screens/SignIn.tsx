import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';

import useLoginUser from '../hooks/useLoginUser';
import { Ionicons } from '@expo/vector-icons';

interface InputTypes {
  email: string;
  password: string;
}

const SignIn = () => {
  const navigation = useNavigation<any>();
  const [loginUser, {error,data, loading}] = useLoginUser();

  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const onSubmit = useCallback((formData: InputTypes) => {
    const {email, password} = formData
    loginUser(email, password);
  },[loginUser]);

  if(loading){
    return (
        <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} /> 
        </View>
    )
  }

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
                    onPress={() => togglePasswordVisibility()}
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
          <View 
            style={{marginTop: 20,flexDirection: 'row',alignItems: 'center', justifyContent: 'flex-end'}}
          >
            <Text style={{color: '#35A2F1'}}>Forgot password?</Text>
          </View>
          <TouchableOpacity 
              onPress={() => navigation.navigate('SignUp')}
              style={{
                  height: 50,
                  borderRadius: 5,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 5
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