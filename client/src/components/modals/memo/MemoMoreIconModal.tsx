import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Modal from "react-native-modal";
import styles from '../../../styles';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { DELETE_MEMO } from '../../../../apollo/mutations/memo/memoMutations';
import { useDispatch } from 'react-redux';
import { deleteStoredMemo } from '../../../reduxReducers/memoSlice';
import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';
import { Memo } from '../../../utils/interfaces/types';
import { useToast } from '../../../utils/toastContext/ToastContext';

interface MemoMoreIconModalProps {
  isVisible: boolean;
  onClose: () => void;
  memoId: string; 
}

const MemoMoreIconModal: React.FC<MemoMoreIconModalProps> = ({ isVisible, onClose, memoId }) => {
  const dispatch = useDispatch()
  const navigation = useNavigation<any>();
  const { success, error, warning } = useToast();

  const memo: Memo | any = useSelector((state: RootState) => {
    return state.memos.memos.find((memo) => memo.id === memoId);
  });
  
  const [deleteMemoMutation] = useMutation(DELETE_MEMO);
  const deleteMemo = async (memoId:string) => {
    try {
      const { data } = await deleteMemoMutation({
        variables: {
          memoId: memoId,
        },
      });

      dispatch(deleteStoredMemo(memoId))
      success('Success')
    } catch (err) {
      error('Error Deleting Memo');
    } finally {
      onClose()
    }
  }

  const askConfirmDelete = (memoId: string, memoTitle: string) =>
    Alert.alert('Delete Memo?', `${memoTitle} will be delete`, [
      {text: 'Cancel', onPress: () => {}},
      {text: 'OK', onPress: () => deleteMemo(memoId)}
    ]);

  const editMemo = (memoId:string) => {
    onClose()
    navigation.navigate('Edit Memo', {memoId: memoId}) 
  }
  
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={modalStyles.centeredView}>
              <View style={modalStyles.modalView}>
                {memo && (
                  <View>
                    <Text style={[styles.h2, styles.textCenter]}>{memo.title}</Text>
                    <View style={modalStyles.actions}>
                      <TouchableOpacity onPress={() => {askConfirmDelete(memo.id, memo.title)}} style={[modalStyles.btn, modalStyles.deleteBtn]} >
                        <Text style={styles.textCenter}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => {editMemo(memo.id)}} style={[modalStyles.btn, modalStyles.editBtn]}>
                        <Text style={styles.textCenter}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
          </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  actions: {
    marginTop: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 50,
  },
  btn: {
    width: 100,
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  editBtn: {
    borderColor: 'green',
    color: 'green'
  },
  deleteBtn: {
      borderColor: 'red',
      color: 'red'
  },
  icon: {
    marginVertical: 10,
  },
  modalView: {
    width: 300,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default MemoMoreIconModal;
