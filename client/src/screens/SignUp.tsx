import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from 'react-native';
import {  useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useForm, Controller } from 'react-hook-form';
import ImagePickerModal from '../components/modals/ImagePickerModal'; 
import useSignUpUser from '../hooks/useSignUpUser';

interface InputTypes {
  fullname: string
  email: string;
  password: string;
}

const SignUp = () => {
  const navigation = useNavigation<any>();
  const inputRef = useRef<TextInput>(null)
  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  
  const [showPassword, setShowPassword] = useState(false);

  // avatar 
  const [selectedImage, setSelectedImage] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(prev=>!prev);
  }

  const fetchImageData = async (imageUri: any) => {
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    return {
      data: Array.from(new Uint8Array(arrayBuffer)),
      contentType: response.headers.get('content-type'),
      originalFileName: 'avatar-user',
      caption: 'Image Caption',
    };
  }

  const handleImageSelected = async (imageUri: any) => {
    setSelectedImage(imageUri);
  }
  // End avatar 
  const [createUser, {error, loading}] = useSignUpUser();

  const onSubmit = async (formData: InputTypes) => {
    const {fullname, email, password} = formData;
    try {
      let avatarData = null;
      if (selectedImage) {
        avatarData = await fetchImageData(selectedImage);
      }

      createUser(fullname,email.toLowerCase(),password,avatarData);

    } catch (error) {
      console.error('Error create user image data:', error);
    }
  }
  useFocusEffect(()=>{
    inputRef.current?.focus()
  })

  if(loading){
    return (
        <View style={styles.loadingContainer}>
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
                  ref={inputRef}
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
          <View style={styles.avatarContainer}>
              {/* Display the selected image */}
            {selectedImage && 
              <Image source={{ uri: selectedImage }} style={styles.avatarImage} />
            }
            <TouchableOpacity onPress={toggleModal}>
              <Text style={styles.avatarTextBtn}>{selectedImage ? 'Change Avatar': 'Add avatar'}</Text>
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
          <ImagePickerModal 
            isVisible={isModalVisible} 
            onClose={toggleModal} 
            onImageSelected={handleImageSelected} 
            onImageTaken={handleImageSelected}
          />
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
  loadingContainer: {flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'},
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
  avatarContainer: {display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10},
  avatarImage: {width: 50, height: 50, borderRadius: 50 },
  avatarTextBtn: { fontSize: 20,color: 'blue' }
});