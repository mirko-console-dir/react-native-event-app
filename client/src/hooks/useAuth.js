import React, { useEffect,useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as SecureStore from 'expo-secure-store';

import { useApolloClient } from '@apollo/client';

import {jwtDecode} from 'jwt-decode';
import { decode as base64Decode, encode as base64Encode } from 'base-64';

import { useDispatch } from 'react-redux';
import { setUser } from '../reduxReducers/userSlice';

import refreshToken from '../../apollo/refreshToken';

// Polyfill for atob and btoa
if (!global.btoa) {
  global.btoa = base64Encode;
}
if (!global.atob) {
  global.atob = base64Decode;
}

const useAuth = () => {
  const dispatch = useDispatch() 
  const client = useApolloClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthCheckComplete, setIsAuthCheckComplete] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Get your token from SecureStore
        const token = await SecureStore.getItemAsync('userAccessToken');

        if (token) {
          let decodedToken;
          try {
            decodedToken = jwtDecode(token);
          } catch (error) {
            console.error('Error decoding token:', error);
          }

          const expirationDate = new Date(decodedToken.exp * 1000);

          // Check if the token is still valid
          if (expirationDate > new Date()) {
            setIsLoggedIn(true);
          } else {
            // Token is expired, attempt to refresh it
            const newToken = await refreshToken(token);

            if (newToken) {
              setIsLoggedIn(true);
            }
          }

          /* get user from async storage and dispatch to the redux store */
          const user = await AsyncStorage.getItem('user');

          const userLoggedIn = JSON.parse(user)

          dispatch(setUser(userLoggedIn)); 
          /* restore client cache to run the query again */
          client.resetStore();

        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsAuthCheckComplete(true);

      }
    };
    // Run the authentication check only once when the component mounts
    checkAuthStatus();
  }, []);


  return { isLoggedIn, isAuthCheckComplete };
};

export default useAuth;

