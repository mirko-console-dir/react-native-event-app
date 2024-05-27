import React, {useEffect,useState} from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from 'react-native';
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
  const [modalVisibility, setModalVisibility] = useState<{ [key: string]: boolean }>({});

  const openModal = (memoId: string) => {
    setModalVisibility((prev) => ({ ...prev, [memoId]: true }));
  };

  const closeModal = (memoId: string) => {
    setModalVisibility((prev) => ({ ...prev, [memoId]: false }));
  };
  // END to open the relative memo modal 

  const renderItem = ({item}: {item: Memo}) => (
      <View style={styles.viewMemosPage.main.memosList.memoItem} key={item.id}>
        <MemoMoreIconModal
          isVisible={modalVisibility[item.id] || false}
          onClose={() => closeModal(item.id)}
          memoId={item.id}
        />
        <TouchableOpacity onPress={() => navigation.navigate('Memo', { memoId : item.id })}>
          <View style={styles.viewMemosPage.main.memosList.memoItem.content.header}>
            <Text numberOfLines={2}>{item.title.length > 15 ? `${item.title.substring(0, 12)}...` : item.title}</Text>
            <TouchableOpacity style={styles.viewMemosPage.main.memosList.memoItem.content.header.moreIcon} 
              onPress={() => openModal(item.id)}
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
                        renderItem({item})
                      );
                    })}
                  </View>
              </ScrollView>
            </View>
            <PlusButton onPress={()=>navigation.navigate('Create Memo')}/>
        </View>
    </SafeAreaView>
  );
};

export default Memos;
