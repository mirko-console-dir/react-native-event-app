// Toast.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToastState } from '../../utils/toastContext/ToastContext';
import Animated,{ BounceInUp, FadeOutUp, FadeOutDown } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

interface ToastProps {
  toast: ToastState;
}
type FeatherIconNames = 'check-circle' | 'x-circle' | 'alert-circle';

const Toast: React.FC<ToastProps> = ({ toast }) => {
  let delayValue = 500;
  let featherIcon: FeatherIconNames = 'check-circle';
  let fadeOutDirection = FadeOutUp.delay(delayValue);

  switch(toast.type){
    case 'error':
      delayValue = 1000;
      featherIcon = 'x-circle';
      fadeOutDirection = FadeOutDown.delay(delayValue);
      break;
    case 'warning':
      delayValue = 1000;
      featherIcon = 'alert-circle';
      break;
    default:
      featherIcon = 'check-circle';
  }
 
  if (!toast.visible) return null;

  return (
    <Animated.View style={[
      styles.toastContainer,
      styles[toast.type]]} entering={BounceInUp} exiting={fadeOutDirection}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Feather name={featherIcon} size={30} color='white' style={{top:1}}/>
          <Text style={styles.toastText}>{toast.message}</Text>
        </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  success: {
    backgroundColor: '#3cb371',
  },
  error: {
    backgroundColor: '#ff6347',
  },
  warning: {
    backgroundColor: '#ffa500',
  },
});

export default Toast;
