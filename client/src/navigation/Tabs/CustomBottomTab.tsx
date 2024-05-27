import React, {FC, useEffect, useState} from 'react';
import {StyleSheet, View, Keyboard,LayoutAnimation } from 'react-native';
import Svg, {Path} from 'react-native-svg';
import Animated, {
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {interpolatePath} from 'react-native-redash';

import {SCREEN_WIDTH} from '../../utils/constants/Screen';
import usePath from '../../hooks/usePath';
import {getPathXCenter} from '../../utils/Path';
import TabItem from './TabItem';
import AnimatedCircle from './AnimatedCircle';
import {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import { CommonActions,CurrentRenderContext,useFocusEffect } from '@react-navigation/native';

const AnimatedPath = Animated.createAnimatedComponent(Path);
export const CustomBottomTab: FC<BottomTabBarProps & { currentScreenRef: React.MutableRefObject<string | null> }> = ({
  state,
  descriptors,
  navigation,
  currentScreenRef
}) => {
    
  const {containerPath, curvedPaths, tHeight} = usePath();
  const circleXCoordinate = useSharedValue(0);
  const progress = useSharedValue(1);
  const handleMoveCircle = (currentPath: string) => {
    circleXCoordinate.value = getPathXCenter(currentPath);
  };

  const selectIcon = (routeName: string) => {
    switch (routeName) {
        case 'Home':
            return 'home';
        case 'Status Projects':
            return 'bar-chart-2';
        case 'ProfilePage':
            return 'user';
        default:
            return 'home';
    }
  };
  const animatedProps = useAnimatedProps(() => {
    const currentPath = interpolatePath(
      progress.value,
      Array.from({length: curvedPaths.length}, (_, index) => index + 1),
      curvedPaths,
    );

    runOnJS(handleMoveCircle)(currentPath);
    return {
      d: `${containerPath} ${currentPath}`,
    };
  });

  const handleTabPress = (index: number, tab: string) => {
    navigation.navigate(tab);
    progress.value = withTiming(index);
    // reset the stack
    /* if(tab == 'Create Project'){
      navigation.dispatch(
         CommonActions.reset({
           index: 0,
           routes: [{ name: 'Create Project' }], 
         })
       ); 
    } */
    // END reset the stack

  };

  // Activate the animation circle when there is not a press on a tab, state.index is checking the active tab
  // due to a navigation activate from a different compoenent then tab as example Home compoent for add new list 
/*   useEffect(() => {
  console.log('changed active tab');
    const currentActiveTabIndex = state.index + 1;
    progress.value = withTiming(currentActiveTabIndex);
  }, [state.index]) */
  // END Activate the animation circle when there is not a press on a tab

  // Hide tabs if keyboard is visible
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setKeyboardVisible(false);
    });
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  // END Hide tabs if keyboard is visible
  // Hide navbar for some app pages
  const [screenHideTab, setScreenHideTab] = useState(false);

  useFocusEffect(() => {
    // Access the name of the component currently rendered, currentScreenRef is passed to the component from the TABS file 
    if (currentScreenRef.current == 'All Memo' || currentScreenRef.current == 'Create Memo' || currentScreenRef.current == 'Edit Memo' || currentScreenRef.current == 'Memo' || currentScreenRef.current == 'View Calendar Projects' || currentScreenRef.current == 'Today Tasks' || currentScreenRef.current == 'Task' || currentScreenRef.current == 'Create Event' || currentScreenRef.current == 'Event' || currentScreenRef.current == 'Create Task'|| currentScreenRef.current == 'Edit Task' || currentScreenRef.current == 'Edit Event' || currentScreenRef.current == 'Edit Profile' || currentScreenRef.current == 'Profile Collaborators' || currentScreenRef.current == 'Language'){
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setScreenHideTab(true);
    } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setScreenHideTab(false);
    }
  });
  // END Hide navbar for some app pages

  return (
  <View style={isKeyboardVisible || screenHideTab ? styles.hiddenTabBarContainer : styles.tabBarContainer}>
      <Svg width={SCREEN_WIDTH} height={tHeight} style={styles.shadowMd}>
        <AnimatedPath fill={'white'} animatedProps={animatedProps} />
      </Svg>
      <AnimatedCircle circleX={circleXCoordinate} />
      <View
        style={[
          styles.tabItemsContainer,
          {
            height: tHeight,
          },
        ]}>
        {state.routes.map((route, index) => {
          const {options} = descriptors[route.key];
          const label = options.tabBarLabel ? options.tabBarLabel : route.name;
          return (
            <TabItem
              key={index.toString()}
              label={label as string}
              icon={selectIcon(route.name)}
              activeIndex={state.index + 1}
              index={index}
              onTabPress={() => handleTabPress(index + 1, route.name)}
            />
          );
        })}
      </View>
    </View>
  );
};
export default CustomBottomTab;
const styles = StyleSheet.create({
  hiddenTabBarContainer: {
    position: 'absolute',
    bottom: -300,
  },
  container: {
    flex: 1,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    zIndex: 2
  },
  tabItemsContainer: {
    position: 'absolute',
    flexDirection: 'row',
    width: '100%',
  },
  shadowMd: {
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: {width: 0, height: 3},
  },
});