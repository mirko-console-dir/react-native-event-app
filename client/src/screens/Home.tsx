import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ImageBackground,Image } from 'react-native';
import { useNavigation,CommonActions } from '@react-navigation/native';

import styles from '../styles';
import { Asset } from 'expo-asset';

import setUpStoreRedux from '../utils/setUpStoreRedux/setUpProjectsMemos';

const Home = () => {
  const navigation = useNavigation<any>();

  setUpStoreRedux()

  return (
    <SafeAreaView style={styles.droidSafeArea}>
      <View style={styles.home}>
        <View style={styles.container}>
          <View style={[styles.home.header, styles.flexRowAllCenter]}>
            <Text style={styles.h1}>HOME</Text>
          </View>
          <View style={{}}>
            <View style={styles.home.banner}>
              <ImageBackground
                source={{
                  uri: Asset.fromModule(require("../../assets/backgrounds/backgroundProjectsItem.png")).uri,
                }}
              > 
                <View style={styles.home.banner.content}>
                  <Text style={styles.h1}>Let's Complete</Text>
                  <Text style={styles.h1}>Your Goal</Text>
                  <Text style={styles.h1}>Now!</Text>
                  <TouchableOpacity style={[styles.home.banner.button]} onPress={() => navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ 
                      name: 'Create Event',
                    }], // Specify the route name you want to reset to
                  })
                )}>
                    <Text style={styles.home.banner.button.text}>Get Started</Text>
                  </TouchableOpacity>
                </View>

              </ImageBackground>
            </View>
                <Image
                  style={styles.home.banner.image}
                  source={{
                    uri: Asset.fromModule(require("../../assets/mascot.png")).uri,
                  }}
                />
          </View>
          <View style={styles.home.main}>
            <View style={styles.home.main.mainTop}>
              <TouchableOpacity style={[styles.home.main.mainTop.boxContentShorter,styles.flexRowAllCenter]} 
                onPress={() => navigation.navigate('ProjectStack', { screen: 'Calendar' })}>
                  <View  style={styles.home.main.mainTop.boxContentShorter.content}>
                    <Text style={{textAlign: 'center'}}>
                      View  {'\n'}Calendar
                      <Image
                        style={styles.home.main.mainTop.boxContentShorter.content.image}
                        source={{
                          uri: Asset.fromModule(require("../../assets/calendar.png")).uri,
                        }}
                      />
                    </Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.home.main.mainTop.boxContentHigher, styles.flexRowAllCenter]} 
                onPress={() => navigation.navigate('TodoStack', { screen: 'Today Tasks' })}>
                  <View  style={styles.home.main.mainTop.boxContentHigher.content}>
                    <Image
                      style={styles.home.main.mainTop.boxContentHigher.content.image}
                      source={{
                        uri: Asset.fromModule(require("../../assets/calendarGirl.png")).uri,
                      }}
                    />
                    <Text style={{marginHorizontal: 20, textAlign: 'center'}}>View Today Tasks</Text>
                  </View>
              </TouchableOpacity>
            </View>
            <View style={styles.home.main.mainBottom}>
              <TouchableOpacity style={[styles.home.main.mainBottom.boxContentHigher, styles.flexRowAllCenter]} 
                onPress={() => navigation.navigate('ProjectStack', { screen: 'Create Event' })}>
                  <View  style={styles.home.main.mainBottom.boxContentHigher.content}>
                    <Image
                      style={styles.home.main.mainBottom.boxContentHigher.content.image}
                      source={{
                        uri: Asset.fromModule(require("../../assets/notes.png")).uri,
                      }}
                    />
                    <Text style={{marginHorizontal: 30, textAlign: 'center'}}>Add New{'\n'}Event</Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.home.main.mainBottom.boxContentShorter,styles.flexRowAllCenter]} 
                onPress={() => navigation.navigate('MemoStack', { screen: 'All Memo' })}>
                  <View  style={styles.home.main.mainBottom.boxContentShorter.content}>
                    <Text style={{textAlign: 'center'}}>
                      Memo
                      <Image
                        style={styles.home.main.mainBottom.boxContentShorter.content.image}
                        source={{
                          uri: Asset.fromModule(require("../../assets/stats.png")).uri,
                        }}
                      />
                    </Text>
                    
                  </View>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Home;
