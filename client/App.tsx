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
import { ToastProvider,useToast } from './src/utils/toastContext/ToastContext';
import Toast from './src/components/toast/Toast';

const AppContent: React.FC = () => {
  const { toast } = useToast();
  return (
    <>
      <NavigationContainer>
        <Navigation />
        <StatusBar style="auto" />
        <Toast toast={toast} />
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <LanguageProvider>
          <SubscriptionProvider>
            <ToastProvider>
              <AppContent />
            </ToastProvider>
          </SubscriptionProvider>
        </LanguageProvider>
      </Provider>
    </ApolloProvider>
  );
}