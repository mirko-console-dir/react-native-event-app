import React, { useEffect } from 'react';
import { StyleSheet, View,Text, ActivityIndicator } from 'react-native';

const SplashScreen = () => {

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({});
