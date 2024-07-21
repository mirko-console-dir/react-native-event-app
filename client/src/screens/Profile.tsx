import React, { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, View, Text, TouchableOpacity,Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles';
import {Feather} from '@expo/vector-icons'
import { useSelector } from "react-redux";
import { RootState } from '../../app/store';
import { UserLoggedIn } from '../utils/interfaces/types';

import ProfileAvatar from '../components/avatars/ProfileAvatar';
import EditProfileBtn from '../components/buttons/EditProfileButton';

import * as SecureStore from 'expo-secure-store';
import { useLanguageContext } from "../utils/languages/LanguageProvider";
import { useApolloClient } from '@apollo/client';
import { useToast } from '../utils/toastContext/ToastContext';

const Profile = () => {
  const { success, error } = useToast();

  const client = useApolloClient();
  const navigation = useNavigation<any>();
  const height = Dimensions.get('window').height
  const headerHeight = height / 4
  
  const user: UserLoggedIn | any = useSelector((state: RootState) => {
    return state.user.user
  });

 
  const askConfirmSignOut = useCallback(() =>
    Alert.alert('Log Out?', '', [
      {text: 'Cancel', onPress: () => {}},
      {text: 'OK', onPress: () => handleSignOut()}
    ]), []);

  const handleSignOut =  useCallback(async() => {
    try {
      // Remove userAccessToken from SecureStore
      await AsyncStorage.removeItem('user')
      /* restore client cache to run the query again */
      await client.clearStore();
      await client.resetStore();
      success('Log out')
      navigation.navigate('SignIn'); 
    } catch (err) {
      error('Error while signing out');
    }
  }, [AsyncStorage, client,success, error]);
 
  return (
    <SafeAreaView style={{flex:1}}>     
      <View style={styles.profilePage}>
        <View style={styles.profilePage.container}>
          <View style={[styles.profilePage.header, {height: headerHeight}]}>
            <View style={styles.profilePage.header.avatarArea}>
              <ProfileAvatar user={user}/>
            </View>
            <View style={styles.profilePage.header.name}>
              <Text style={[styles.h1, styles.textCenter, styles.profilePage.header.name.text]}>{user.fullname}</Text>
              <Text style={[styles.h3, styles.textCenter,  styles.profilePage.header.name.text]}>{user.email}</Text>
            </View>    
          </View>
           <View style={styles.profilePage.header.editProfileBtn}>
            <EditProfileBtn onPress={()=>navigation.navigate('Edit Profile')}/>
          </View>    
          <View style={styles.profilePage.main}>
            <TouchableOpacity onPress={()=>navigation.navigate('Collaborators')} style={styles.profilePage.main.listBtn}>
              <View style={{flexDirection: 'row', gap: 10}}>
                <Feather name={"users"} size={20}  color='black'/>
                <Text>Collaborators</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>navigation.navigate('Language')} style={styles.profilePage.main.listBtn}>
              <View style={{flexDirection: 'row', gap: 10}}>
                <Feather name={"globe"} size={20}  color='black'/>
                <Text>Language</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>console.log('message for support')} style={styles.profilePage.main.listBtn}>
              <View style={{flexDirection: 'row', gap: 10}}>
                <Feather name={"message-square"} size={20}  color='black'/>
                <Text style={{textTransform: 'capitalize'}}>Tell us What can we do better</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={askConfirmSignOut} style={styles.profilePage.main.listBtn}>
              <View style={{flexDirection: 'row', gap: 10}}>
                <Feather name={"log-out"} size={20}  color='black'/>
                <Text>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
