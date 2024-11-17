import { cacheSlot } from '@apollo/client/cache';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import {jwtDecode} from 'jwt-decode';

import { decode as base64Decode, encode as base64Encode } from 'base-64';
import { BASE_URL as ENV_BASE_URL } from '@env';

// Polyfill for atob and btoa
if (!global.btoa) {
  global.btoa = base64Encode;
}
if (!global.atob) {
  global.atob = base64Decode;
}
const refreshToken = async () => {
    try {
        const token = await SecureStore.getItemAsync('userRefreshToken');
        let decodedToken = jwtDecode(token);
        const expirationDate = new Date(decodedToken.exp * 1000);
        
        console.log('Refresh token retrieved:', expirationDate); // Debugging line

        const response = await axios.post(`${ENV_BASE_URL}:4000/refreshtoken`, {}, {
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
        if (response.data && response.data.accessToken) {
            await SecureStore.setItemAsync('userAccessToken', response.data.accessToken);
            return response.data.accessToken;
        } else {
            throw new Error('No access token found in the response');
        }
    } catch (error) {
        console.error('Failed to refresh token or token expired:', error.message);
        return false
    }
};

export default refreshToken;
