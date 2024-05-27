import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet,LayoutAnimation,Alert } from 'react-native';
import Modal from "react-native-modal";
import { useDispatch } from 'react-redux';
import { addCollaboratorUser } from '../../../reduxReducers/userSlice';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { ADD_COLLABORATOR_USER } from '../../../../apollo/mutations/user/userMutations';

interface AddCollaboratorModalProps {
  isVisible: boolean;
  onClose: () => void;
}
interface InputTypes {
  collaboratorEmail: string;
}
const AddCollaboratorModal: React.FC<AddCollaboratorModalProps> = ({ isVisible, onClose }) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  
  const [addCollaboratorToUser] = useMutation(ADD_COLLABORATOR_USER);
  const dispatch = useDispatch()
  const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  

  /* Add collaborator manually */
  const handleAddCollaborator = async (formData: InputTypes) => {
    const {collaboratorEmail} = formData

    try {
      const result = await addCollaboratorToUser({
        variables: {
          collaboratorEmail: collaboratorEmail.toLowerCase().trim(),
        },
      });
      // Handle the response data as needed
      //toggleConfirmActionModal()
      const collaborator = result.data.addCollaboratorToUser
      if(collaborator) {
        dispatch(addCollaboratorUser({collaborators: [collaborator]}))
      }
      reset()
      onClose()
    } catch (error) {
      console.error('this is the error',error);
      // Handle the error (e.g., show an error message)
    }
  };
  /* END Add collaborator manually */
  const close = () => {
    reset()
    onClose()
  }
  return (
      <Modal isVisible={isVisible} onBackdropPress={close}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>Insert the collaborator's email</Text>
          <Controller
            control={control}
            render={({ field }) => (
              <>
                <TextInput
                  placeholder="Email Collaborator"
                  value={field.value}
                  onChangeText={field.onChange}
                  style={styles.input }
                  multiline={true}
                  numberOfLines={2}
                />
                {errors.collaboratorEmail && 
                    <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.collaboratorEmail.message}</Text>
                  }
              </>
            )}
            name="collaboratorEmail"
            rules={{ 
              required: "You must enter collaborator's email",
              validate: (value) => {
                // Check if the trimmed value is an empty string
                if (value.trim() === '') {
                  return 'Email cannot be empty';
                }
                return true;
              },
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: "Enter a valid email format",
              },
            }}
          />
          <TouchableOpacity style={{ borderWidth: 0.3, paddingHorizontal: 25,paddingVertical: 10, borderRadius: 20, alignSelf: 'center' }} 
            onPress={handleSubmit(handleAddCollaborator)}
          >
            <Text>Add</Text>
          </TouchableOpacity>

        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffff', // Add a semi-transparent white background
    padding: 22,
    borderRadius: 4,
    minHeight: 250,
  },
  modalHeader: {
    fontSize: 20,
  },
  input: {
    fontSize: 20,
    height: 50,
    width: '100%',
    textAlign: 'center'
  },
});

export default AddCollaboratorModal;

