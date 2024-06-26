import { useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { useDispatch } from 'react-redux';
import { setUser } from '../reduxReducers/userSlice';

import { useMutation, useApolloClient } from '@apollo/client';
import { LOGIN_USER } from '../../apollo';
import * as SecureStore from 'expo-secure-store';

interface LoginUserHook {
  (): [(email: string, password: string) => void, { error?: any, data?: any, loading?: any }];
}

const useLoginUser: LoginUserHook = () => {
  const [loginUserMutation, { error, data, loading }] = useMutation(LOGIN_USER);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const client = useApolloClient();

  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred', error.message);
    }
  }, [error]);

  const loginUser = async (email: string, password: string) => {
    try {
      const { data } = await loginUserMutation({
        variables: { email: email.toLowerCase(), password }
      });

      if (data.loginUser.accessToken && data.loginUser.refreshToken) {
        await SecureStore.setItemAsync('userAccessToken', data.loginUser.accessToken);
        await SecureStore.setItemAsync('userRefreshToken', data.loginUser.refreshToken);

        await AsyncStorage.removeItem('user');
        await AsyncStorage.setItem('user', JSON.stringify(data.loginUser.user));

        dispatch(setUser(data.loginUser.user));

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
    } catch (error:any) {
      Alert.alert('An error occurred', error.message);
    }
  };

  return [loginUser, { error, data, loading }];
};

export default useLoginUser;
