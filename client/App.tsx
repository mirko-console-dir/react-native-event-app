import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux'
import { store } from './app/store'

import { StatusBar } from 'expo-status-bar';

import { ApolloProvider } from '@apollo/client';
import client from './apollo/apollo-client';

import Navigation from './src/navigation';
import { LanguageProvider } from './src/utils/languages/LanguageProvider';
import SubscriptionProvider from './src/utils/subscriptions/SubscriptionProvider'

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <LanguageProvider>
          <SubscriptionProvider>
            <NavigationContainer>
              <Navigation />
              <StatusBar style="auto" />
            </NavigationContainer>
          </SubscriptionProvider>
        </LanguageProvider>
      </Provider>
    </ApolloProvider>
  );
} 