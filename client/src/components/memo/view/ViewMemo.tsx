import React from 'react';
import { useRoute } from '@react-navigation/native';
import {
  SafeAreaView,
  View,
  Text,
} from 'react-native';
import styles from '../../../styles';

import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';
import { Memo } from '../../../utils/interfaces/types';

const ViewMemo = () => {
  const route = useRoute();
  const { memoId } = route.params as any;
  
  const memo: Memo | any = useSelector((state: RootState) => {
    return state.memos.memos.find((memo) => memo.id === memoId);
  });

  return (
    <SafeAreaView style={{flex:1}}>
          <View style={styles.createMemoPage}>
            <View style={styles.container}>
              <View style={[styles.createMemoPage.main, styles.flexRowAllCenter]}>
                <View style={styles.createMemoPage.main.form}>
                  <View style={styles.createMemoPage.main.form.inputContainer}>
                    <Text
                      style={[styles.createMemoPage.main.form.inputContainer.input, styles.createMemoPage.main.form.inputContainer.inputTitle]}
                    >{memo?.title}</Text>
                  </View>
                  <View style={styles.createMemoPage.main.form.inputContainer}>
                    <Text
                      style={[styles.createMemoPage.main.form.inputContainer.input, styles.createMemoPage.main.form.inputContainer.inputBigContent]}
                    >{memo?.content}</Text>
                  </View>
                </View> 
              </View>
            </View>
          </View>
  </SafeAreaView>
  );
};

export default ViewMemo;
