import React, {useCallback, useState} from 'react'
import {
    SafeAreaView,
    View,
    TextInput,
    Image,
    Text, Dimensions, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';

import { useSelector, useDispatch } from "react-redux";
import { RootState } from '../../../app/store';
import { updateUser } from '../../reduxReducers/userSlice';

import { UserLoggedIn } from '../../utils/interfaces/types';

import { useMutation } from '@apollo/client';
import { EDIT_USER } from '../../../apollo'; 

import styles from '../../styles';
import {Ionicons,Feather} from '@expo/vector-icons'

import ProfileAvatar from '../avatars/ProfileAvatar';
import ImagePickerModal from '../../components/modals/ImagePickerModal'; 
import SaveButton from '../buttons/SaveButton'
import useNavigationOptions from '../../hooks/useNavigationOptions';
import { useToast } from '../../utils/toastContext/ToastContext';

interface InputTypes {
    fullname: string
    email: string;
    password: string;
}

const EditProfile = () => {
  const { success, error : errorToast, warning } = useToast();
    const navigation = useNavigation<any>();
    const dispatch = useDispatch()
    const height = Dimensions.get('window').height
    const headerHeight = height / 4

    const user: UserLoggedIn | any = useSelector((state: RootState) => {
      return state.user.user
    });

    const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>({defaultValues: {
        fullname: user.fullname,
        email: user.email,
        password: user?.password
    }});  
    const [showPassword, setShowPassword] = useState(false);

    // avatar 
    const [selectedImage, setSelectedImage] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

    const toggleModal = useCallback(() => {
        setModalVisible(prev=>!prev);
    },[]);

    const fetchImageData = useCallback(async (imageUri: any) => {
        const response = await fetch(imageUri);
        const arrayBuffer = await response.arrayBuffer();
        return {
            data: Array.from(new Uint8Array(arrayBuffer)),
            contentType: response.headers.get('content-type'),
            originalFileName: 'avatar-user',
            caption: 'Image Caption',
        };
    },[]);

    const handleImageSelected = useCallback(async (imageUri: any) => {
        setSelectedImage(imageUri);
    },[]);
    // End avatar 
    const [editUser, { error, loading, data }] = useMutation(EDIT_USER)
    const handleEditUser = useCallback(async (formData: InputTypes) => {
        const {fullname, email, password} = formData;
        let avatarData = null;
        if (selectedImage) {
          avatarData = await fetchImageData(selectedImage);
        }
        try{
            const result = await editUser({
                variables: {
                  input: {
                    fullname: fullname.trim(),
                    email: email.trim(),
                    password: password && password.trim(),
                    avatar: avatarData,
                  },
                }
              })
            if(result.data.editUser){
                dispatch(updateUser(result.data.editUser))
            }
            reset()
            setSelectedImage('')
            navigation.goBack()
            success('User edited')
        }catch(err){
            errorToast('Something wrong')
        }
    },[fetchImageData, reset, navigation, editUser, dispatch, updateUser, success, error])

    // Save button
    const SaveButtonUser = useCallback(() => (
        <SaveButton onPress={handleSubmit(handleEditUser)}/>
    ),[handleSubmit,handleEditUser])
    useNavigationOptions({headerRight: SaveButtonUser});
    // END Save button
    if(loading){
        return (
            <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
            </View>
        )
    }
    return (
        <SafeAreaView style={{flex:1}}>
            <KeyboardAwareScrollView>
                <View style={styles.editProfilePage}>
                    <View style={styles.editProfilePage.container}>
                        <View style={[styles.editProfilePage.header, {height: headerHeight}]}>
                            <View style={styles.editProfilePage.header.avatarArea}>
                                {!selectedImage && 
                                    <ProfileAvatar user={user}/>
                                }
                                {selectedImage && 
                                    <Image source={{ uri: selectedImage }} style={{width: 85, height: 85, borderRadius: 50 }} />
                                }
                                <TouchableOpacity onPress={toggleModal} style={styles.editProfilePage.header.avatarArea.editAvatarBtn}>
                                    {user.avatar != '' ? 
                                    <Feather name={"edit-2"} size={16}  color='black'/>
                                    :
                                    <Feather name={"plus"} size={16}  color='black'/>
                                    }
                                </TouchableOpacity>
                                <ImagePickerModal isVisible={isModalVisible} onClose={toggleModal} onImageSelected={handleImageSelected} onImageTaken={handleImageSelected}/>
                            </View>
                        </View>
                        <View style={[styles.editProfilePage.main]}>
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
                                </>
                                )}
                                name="password"
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    )
}

export default EditProfile