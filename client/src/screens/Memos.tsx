import React, { useRef, useState} from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../styles';
import { Feather } from '@expo/vector-icons';
import MemoMoreIconModal from '../components/modals/memo/MemoMoreIconModal'
import { useSelector } from "react-redux";
import { RootState } from '../../app/store';
import { Memo } from '../utils/interfaces/types';
import PlusButton from '../components/buttons/PlusButton';


const Memos = () => {

  const navigation = useNavigation<any>();

  const memos : any = useSelector((state: RootState) => state.memos.memos);
  // to open the relative memo modal 
  const memoRef = useRef('')
  const [modalVisibility, setModalVisibility] = useState(false);
  const openModal = (itemId: string) => {
    memoRef.current = itemId;
    setModalVisibility(true);
  };

  const closeModal = () => {
    memoRef.current = ''
    setModalVisibility(false);
  };
  // END to open the relative memo modal 

  const actions = {
    openModal: openModal
  };

  const renderItem = ({item, actions}: {item: Memo, actions: any}) => (
      <View style={styles.viewMemosPage.main.memosList.memoItem} key={item.id}>
        <TouchableOpacity onPress={() => navigation.navigate('Memo', { memoId : item.id })}>
          <View style={styles.viewMemosPage.main.memosList.memoItem.content.header}>
            <Text numberOfLines={2}>{item.title}</Text>
            <TouchableOpacity style={styles.viewMemosPage.main.memosList.memoItem.content.header.moreIcon} 
              onPress={() => actions.openModal(item.id)}
            >
              <Feather name={'more-horizontal'} size={25} />
            </TouchableOpacity>
          </View>
          <View style={styles.viewMemosPage.main.memosList.memoItem.content.body}>
            <Text numberOfLines={3} ellipsizeMode="tail">{item.content}</Text> 
          </View>
        </TouchableOpacity>
      </View>
  );

  return (
    <SafeAreaView style={{flex:1}}>
        <View style={styles.viewMemosPage}>
            <View style={styles.container}> 
              <ScrollView style={styles.viewMemosPage.main}>
                  <View style={styles.viewMemosPage.main.memosList}>
                    {memos.map((item: Memo) => {
                      return (
                        renderItem({item, actions})
                      );
                    })}
                  </View>
              </ScrollView>
            </View>
            <PlusButton onPress={()=>navigation.navigate('Create Memo')}/>
        </View>
        <MemoMoreIconModal
          isVisible={modalVisibility}
          onClose={closeModal}
          memoId={memoRef.current}
        />
    </SafeAreaView>
  );
};

export default Memos;
