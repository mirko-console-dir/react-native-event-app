import React, {useEffect, useState} from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import useAuth from '../hooks/useAuth';

import SplashScreen from '../screens/SplashScreen';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import Tabs from './Tabs';

const Stack = createStackNavigator();

const Navigation = () => {

    const {isLoggedIn,isAuthCheckComplete} = useAuth()
    
    if (!isAuthCheckComplete) {
        return <SplashScreen />;
    } 

    return (
        <Stack.Navigator initialRouteName={isLoggedIn ?'Tabs':'SignIn'}>
            <Stack.Group screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Tabs" component={Tabs} />
                <Stack.Screen name="SignUp" component={SignUp} />
                <Stack.Screen name="SignIn" component={SignIn} />    
            </Stack.Group>
        </Stack.Navigator>
    );
};

export default Navigation;
