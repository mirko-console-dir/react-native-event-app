import React, {useState} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Modal from "react-native-modal";
import styles from '../../../styles';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@apollo/client';
import { DELETE_MEMO } from '../../../../apollo/mutations/memo/memoMutations';
import AskConfirmationModal from '../AskConfirmationModal';
import { useDispatch } from 'react-redux';
import { deleteStoredMemo } from '../../../reduxReducers/memoSlice';
import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';
import { Memo } from '../../../utils/interfaces/types';

interface MemoMoreIconModalProps {
  isVisible: boolean;
  onClose: () => void;
  memoId: string; 
}

const MemoMoreIconModal: React.FC<MemoMoreIconModalProps> = ({ isVisible, onClose, memoId }) => {
  const navigation = useNavigation<any>();
  const memo: Memo | any = useSelector((state: RootState) => {
    return state.memos.memos.find((memo) => memo.id === memoId);
  });
  const [deleteMemoMutation] = useMutation(DELETE_MEMO);
  const dispatch = useDispatch()

  const [isModalConfirmDeleteVisible, setModalConfirmDeleteVisible] = useState(false);
  const askConfirmDelete = () =>{
    setModalConfirmDeleteVisible(true)
  }
  const deleteMemo = async (memoId:string) => {
      try {
        const { data } = await deleteMemoMutation({
          variables: {
            memoId: memoId,
          },
        });
  
        if (data.deleteMemo) {
          console.log('Memo deleted successfully');
          /* await deleteProjectFromProjectsStorage(projectId); */
          dispatch(deleteStoredMemo(memoId))
          onClose()

        } else {
          console.log('Failed to delete memo');
          // Handle the failure, e.g., show an error message
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        // Handle the error, e.g., show an error message
        onClose()
      }
  }

  const editMemo = (memoId:string) => {
    onClose()
    navigation.navigate('Edit Memo', {memoId: memoId}) 
  }
  
  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <AskConfirmationModal
          isVisible={isModalConfirmDeleteVisible}
          message={'Delete memo'}
          onConfirm={() => deleteMemo(memoId)}
          onCancel={() => setModalConfirmDeleteVisible(false)}
        />
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={modalStyles.centeredView}>
              <View style={modalStyles.modalView}>
                {memo && (
                  <View>
                    <Text style={[styles.h2, styles.textCenter]}>{memo.title}</Text>
                    <View style={modalStyles.actions}>
                      <TouchableOpacity onPress={() => {askConfirmDelete()}} style={[modalStyles.btn, modalStyles.deleteBtn]} >
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
