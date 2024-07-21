import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { useDispatch } from 'react-redux';
import { setUser } from '../reduxReducers/userSlice';

import { useMutation, useApolloClient } from '@apollo/client';
import { CREATE_USER } from '../../apollo';
import * as SecureStore from 'expo-secure-store';

interface LoginUserHook {
  (): [(fullname:string, email:string, password:string, avatarData:any) => void, { error?: any, data?: any, loading?: boolean }];
}

const useSignUpUser: LoginUserHook = () => {
  const client = useApolloClient();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [createUserMutation, { error, data,loading }] = useMutation(CREATE_USER);

  const createUser = async (fullname:string, email:string, password:string, avatarData:any) => {
    try {
      const { data } = await createUserMutation({
        variables: {
            input: {
              fullname: fullname,
              email: email,
              password: password,
              avatar: avatarData,
            },
        }
      });
      if(data.createUser?.errors.length > 0) {
        Alert.alert('Sorry\n', data.createUser.errors[0]);
      }
      if (data.createUser?.accessToken != null && data.createUser?.refreshToken != null) {
        // Save the tokens in SecureStore
        await SecureStore.setItemAsync('userAccessToken', data.createUser.accessToken);
        await SecureStore.setItemAsync('userRefreshToken', data.createUser.refreshToken);

        // Clear and set user in AsyncStorage
        await AsyncStorage.removeItem('user');
        await AsyncStorage.setItem('user', JSON.stringify(data.createUser.user));

        // Dispatch user to Redux store
        dispatch(setUser(data.createUser.user));

        // Reset the Apollo Client store
        await client.clearStore();
        await client.resetStore();


        Alert.alert('Success', 'Logged In Successfully.');
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Tabs' }],
          })
        );
      } 
    } catch (err:any) {
      Alert.alert('An error occurred', err);
    } 
  };

  return [createUser, { error, data, loading }];
};

export default useSignUpUser;
