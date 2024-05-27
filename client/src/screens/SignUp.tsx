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
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from "react-redux";
import { RootState } from '../../app/store';
import { setUser } from '../reduxReducers/userSlice';

import { useMutation,useApolloClient } from '@apollo/client';
import { CREATE_USER } from '../../apollo'; 
import ImagePickerModal from '../components/modals/ImagePickerModal'; 

interface InputTypes {
  fullname: string
  email: string;
  password: string;
}

const SignUp = () => {
  const navigation = useNavigation<any>();

  const dispatch = useDispatch();
  const client = useApolloClient();

  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  
  const [showPassword, setShowPassword] = useState(false);

  // avatar 
  const [selectedImage, setSelectedImage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const fetchImageData = async (imageUri: any) => {
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    return {
      data: Array.from(new Uint8Array(arrayBuffer)),
      contentType: response.headers.get('content-type'),
      originalFileName: 'avatar-user',
      caption: 'Image Caption',
    };
  };

  const handleImageSelected = async (imageUri: any) => {
    setSelectedImage(imageUri);
    setModalVisible(false);
  };
  // End avatar 

  const [createUser, { error, loading }] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      if (data.createUser.accessToken && data.createUser.refreshToken) {
         //avatar image
        if(data.createUser.user.avatar?.data){
          AsyncStorage.removeItem('avatar')
          const image = btoa(
            String.fromCharCode( ...new Uint8Array(data.createUser.user.avatar.data))
          ) 
          AsyncStorage.setItem('avatar', image)
        } else {
          AsyncStorage.removeItem('avatar')
        }

        dispatch(setUser(data.createUser.user));
        /* restore client cache to run the query again */
        client.resetStore();

        // Save the tokens in SecureStore
        SecureStore.setItemAsync('userAccessToken', data.createUser.accessToken)
          .then(() => SecureStore.setItemAsync('userRefreshToken', data.createUser.refreshToken))
          .then(() => {
            Alert.alert('Success', 'Logged In Successfully.');
            navigation.navigate('Tabs', {screen: 'HomePage'})
          })
          .catch((error) => {
            // Handle errors saving the token here
            console.log(error);
            Alert.alert('An error occurred', 'Failed to save token');
          });
      }
    },
  });

/*   const onSubmit = () => {   
    createUser({
      variables: {
        input: {
          fullname,
          email,
          password,
          avatar: selectedImage || null,
        },
      },
    });
  }; */

  const onSubmit = async (formData: InputTypes) => {
    const {fullname, email, password} = formData;
    try {
      let avatarData = null;
      if (selectedImage) {
        avatarData = await fetchImageData(selectedImage);
      }

      createUser({
        variables: {
          input: {
            fullname: fullname,
            email: email.toLowerCase(),
            password: password,
            avatar: avatarData,
          },
        },
      });
    } catch (error) {
      console.error('Error processing image data:', error);
    }
  };
  if(loading){
    return (
        <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
        </View>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}>
        <View style={{ padding: 20, marginTop: 50 }}>
          <Controller
            control={control}
            render={({ field }) => (
              <>
                <TextInput
                  placeholder="User Name"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input}
                />
                {errors.fullname && 
                    <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.fullname.message}</Text>
                }
              </>
              )}
              name="fullname"
              rules={{ 
                required: 'You must enter your user name',
                validate: (value) => {
                  // Check if the trimmed value is an empty string
                  if (value.trim() === '') {
                    return 'User name cannot be empty';
                  }
                  return true;
                },
            }}
          />
          <Controller
            control={control}
            render={({ field }) => (
              <>
                <TextInput
                  placeholder="Email"
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
                    placeholder="Password"
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
                required: 'You must enter a password',
                validate: (value) => {
                  // Check if the trimmed value is an empty string
                  if (value.trim() === '') {
                    return 'Password cannot be empty';
                  }
                  return true;
                },
            }}
          />
          <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10}}>
              {/* Display the selected image */}
            {selectedImage && 
              <Image source={{ uri: selectedImage }} style={{width: 50, height: 50, borderRadius: 50 }} />
            }
            <TouchableOpacity onPress={toggleModal}>
              <Text style={{ fontSize: 20,color: 'blue' }}>{selectedImage ? 'Change Avatar': 'Add avatar'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={loading} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity 
              onPress={() => navigation.navigate('SignIn')}
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
                  Already registered? Sign In
              </Text>
          </TouchableOpacity>
          <ImagePickerModal isVisible={isModalVisible} onClose={toggleModal} onImageSelected={handleImageSelected} onImageTaken={handleImageSelected}/>
          
          {error && <Text style={styles.errorText}>Error: {error.message}</Text>}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInput: {
    color: 'black',
    fontSize: 18,
    width: '100%',
  },
  button: {
    backgroundColor: '#e33062',
    height: 50,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 20,
  },
  input:{
    color: 'black',
    fontSize: 18,
    width: '100%',
    height: 50,
    marginVertical: 15,
    borderRadius: 10,
    borderWidth: 0.3,
    padding:10
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