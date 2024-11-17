import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const useNavigationOptions = (options: any) => {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions(options);
  }, [navigation, options]);
};

export default useNavigationOptions;