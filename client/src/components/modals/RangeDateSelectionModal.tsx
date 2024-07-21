import React, { useState, useMemo, useCallback}from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from "react-native-modal";
import DatePicker from 'react-native-modern-datepicker';
import { useToast } from '../../utils/toastContext/ToastContext';

interface RangeDateSelectionModalProps {
  isVisible: boolean;
  today: string,
  projectsDate: Array<string>,
  onClose: () => void,
  onConfirm: (date1: string, date2: string) => void,
  currentFilterType: string
}

const RangeDateSelectionModal: React.FC<RangeDateSelectionModalProps> = ({ isVisible, onClose, today, projectsDate, onConfirm, currentFilterType }) => {
  const { success, error, warning } = useToast();

    const [minSelected, setMinSelected] = useState('');
    const [maxSelected, setMaxSelected] = useState('');
    const [selectionNumber, setSelectionNumber] = useState(0);

    const handleRange = useCallback((date:any)=>{
      if(!selectionNumber){
        setMinSelected(date)
        setSelectionNumber(1)
      } else {
        setMaxSelected(date)
        setSelectionNumber(0)
      }
    },[selectionNumber])

    const handleConfirm = useCallback(() => {
      if(minSelected == '' || maxSelected == ''){
        warning('Please select Start and End date')
        return
      }
      onConfirm(minSelected,maxSelected)
      onClose()
    },[minSelected,maxSelected,onConfirm,onClose,warning])

    const handleCancel = useCallback(() => {
      setMinSelected('')
      setMaxSelected('')
    },[])

    useMemo(()=>currentFilterType == 'ALL' ? handleCancel() : null, [currentFilterType])

  return (
      <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <View style={modalStyles.modalContent}>
        <DatePicker
                options={{
                  backgroundColor: 'rgba(58, 82, 63, 0.32)',
                  textHeaderColor: '#324A2A',
                  textDefaultColor: '#3A612D',
                  selectedTextColor: '#fff',
                  mainColor: '#F4722B',
                  textSecondaryColor: '#324A2A',
                  borderColor: 'none',
                  textFontSize: 15,
                  textHeaderFontSize: 15
                }}
                mode="calendar"
                style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2}}
                current={today}
                projectsDate={projectsDate}
                todosDate={[]}
                onDateChange={handleRange}
                minimumDate={minSelected}
                maximumDate={maxSelected}
              />
              {minSelected && maxSelected && 
                <>
                 <View style={modalStyles.actions}>
                <TouchableOpacity onPress={handleCancel} style={[modalStyles.btn,modalStyles.resetButton]}>
                  <Text style={modalStyles.resetBtnText}>Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={[modalStyles.btn,modalStyles.confirmButton ]}>
                  <Text style={modalStyles.confirmBtnText} >Confirm</Text>
                </TouchableOpacity>
              </View>
                </>
              }
        </View>
      </Modal>
  );
};

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Add a semi-transparent white background
    paddingHorizontal: 10,
    paddingBottom: 15,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 50,
    marginTop: 15
  },
  btn: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    padding: 10,
    borderRadius: 20,
  },
  confirmButton: {
    color: '#0596A0', 
    borderColor: '#0596A0',
  },
  confirmBtnText: {
    fontWeight: 'bold',
    color: '#0596A0', 
  },
  resetButton: {
    color: '#CC0404', 
    borderColor: '#CC0404',
  },
  resetBtnText: {
    fontWeight: 'bold',
    color: '#CC0404',
  }
});

export default RangeDateSelectionModal;

