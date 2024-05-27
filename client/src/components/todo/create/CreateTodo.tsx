import React, { useEffect,useState } from 'react';
import {
  SafeAreaView,
  View,
  TextInput,
  Image,
  Text,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableOpacity,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import DatePicker from 'react-native-modern-datepicker';

import { useForm, Controller } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { addTaskToProject } from '../../../reduxReducers/projectSlice';
import styles from '../../../styles';
import { Feather } from '@expo/vector-icons';

import { useMutation } from '@apollo/client';
import { CREATE_TODO } from '../../../../apollo/mutations/todo/todoMutations';

import ImagePickerModal from '../../modals/ImagePickerModal'; 
import ImagesCarouselModal from '../../modals/todo/ImagesCarouselModal';
import ConfirmCompletedActionModal from '../../modals/ConfirmCompletedActionModal';
import SaveButton from '../../buttons/SaveButton'

type StackProps = {
  today: string; 
};

interface InputTypes {
  content: string;
  expireDate: string;
}

const CreateTodo = ({today}: StackProps) => {
    const navigation = useNavigation<any>();
    const route = useRoute();

    // Date for calendar  
    const { projectId, projectExpireDate, projectTitle }: any = route.params;
    // ENDDate for calendar  

    const { control, handleSubmit, reset, formState: { errors }, setValue, setError,clearErrors } = useForm<InputTypes>();  

    const [selectedDate, setSelectedDate] = useState(projectExpireDate);

    // Upload images
    const [selectedImages, setSelectedImages] = useState<any>([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const handleImageSelected = (imageUri: any) => {
      setSelectedImages([...selectedImages, imageUri]);
      setModalVisible(false);
    };
    const toggleModal = () => {
      if(selectedImages.length > 1) {
        console.warn('You can upload max 2 images for task')
      } else {
        if(Platform.OS === 'android') {
          setModalVisible(!isModalVisible);
        } else {
          setModalVisible(!isModalVisible);
        }
      }
    };
    const removeImage = (index: number) => {
      const updatedImages = selectedImages.filter((_: any, i: number) => i !== index);
      setSelectedImages(updatedImages)
    }
    // END Upload images

    // Handle data form to send 
    async function fetchImageData(imageUri: any) {
      // Process the uploaded images
      const response : any = await fetch(imageUri);
      const originalFileName = response._bodyBlob._data.name;
      const mimeType = response.headers.get('content-type');
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
    
      return {
        data: Array.from(uint8Array),
        contentType: mimeType,
        originalFileName: originalFileName,
        caption: 'Image Caption' // You may replace this with your logic to get the caption
      };
    }
    /* CONFIRM ACTION MODAL */
    const [confirmActionModalVisible, setConfirmActionModalVisible] = useState(false)
    const toggleConfirmActionModal = () => {
      setConfirmActionModalVisible(!confirmActionModalVisible)
    }
    /*END  CONFIRM ACTION MODAL */
    const [createTodo, { data, error, loading }] = useMutation(CREATE_TODO);
    const dispatch = useDispatch()
    const handleCreateTodo = async (formData : InputTypes) => {
      const {content, expireDate} = formData;
      if (!content.trim() || !expireDate) {
        if(!content.trim()){
          setError("content", {
            message: "You must enter a content",
          })
        }
        if(!expireDate){
          setError("expireDate", {
            message: "You must select a date",
          })
        }
        return;
      } 
  
      let imageDataArray = []
      if(selectedImages){
        const fetchImagePromises = selectedImages.map(fetchImageData);
        imageDataArray = await Promise.all(fetchImagePromises);
      }
      try {
        const result = await createTodo({
          variables: {
            input: {
              content: content.trim(),
              expireDate: expireDate,
              projectId: projectId,
              images: imageDataArray
            },
          },
        })
      
        const newTodo = result.data.createTodo
        dispatch(addTaskToProject({projectId: projectId, task: newTodo}))
        setSelectedDate('')
        setSelectedImages([])
        clearErrors("content") 
        clearErrors("expireDate") 
        setValue('content', '')

      } catch (error) {
        console.error('Error creating todo client:', error);
      } 
    }
    // END Handle data form to send 

    // Close keybord avoid conflict with data picker onChange
    const closeKeybord = () => {
      Keyboard.dismiss()
    }
    useEffect(()=>{
      setValue('expireDate', selectedDate);
      if(errors.expireDate){
        clearErrors("expireDate") 
      }
      closeKeybord()
    }, [selectedDate])
    // END Close keybord avoid conflict with data picker onChange

    /* const windowHeight = useWindowDimensions().height;
    const [mainSectionHeight, setMainSectionHeight] = useState(windowHeight * 0.8); */
    
    // Carousel Modal for attached images
    const [carouselModalVisible, setCarouselModalVisible] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
  
    const openCarouselModal = (index: number) => {
      setCarouselIndex(index);
      setCarouselModalVisible(true);
    };
  
    const closeCarouselModal = () => {
      setCarouselModalVisible(false);
    };
    // END Carousel Modal for attached images
    // Save button
    const SaveButtonTask = () => (
      <SaveButton onPress={handleSubmit(handleCreateTodo)}/>
    )
    useEffect(()=>{
      navigation.setOptions({
        headerRight: SaveButtonTask,
      })
    }, [navigation])
    // END Save button
    if(loading){
      return (
          <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
          </View>
        )
    }
    return (
        <SafeAreaView style={{flex: 1}}>
          <ConfirmCompletedActionModal isVisible={confirmActionModalVisible} onClose={toggleConfirmActionModal}/>
           <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
            <TouchableWithoutFeedback onPress={closeKeybord} >
              <View style={styles.createTodoPage}>
                <View style={styles.container}>
                  <Text style={[styles.textCenter, styles.h3, { marginTop: 15, marginBottom: 25}]}>Add Task for Event:{'\n'}{projectTitle}</Text>
                  <View style={styles.createTodoPage.main}>
                    <View style={styles.createTodoPage.main.form}>
                      <View style={styles.createTodoPage.main.form.inputContainer}>
                      <Controller
                        control={control}
                        render={({ field }) => (
                          <>
                              <TextInput
                                placeholder="Task Content"
                                value={field.value}
                                onChangeText={field.onChange}
                                style={[styles.createTodoPage.main.form.inputContainer.input, styles.createTodoPage.main.form.inputContainer.inputContent, styles.createTodoPage.main.form.inputContainer.inputContent]}
                                multiline={true}
                                numberOfLines={3}
                              />
                          </>
                          
                        )}
                        name="content"
                      />
                          {/* Add images */}
                          <View style={[styles.createTodoPage.main.form.inputContainer.addImageContainer, styles.flexRowAllCenter]}>
                            <TouchableOpacity onPress={toggleModal}>
                              <Feather style={styles.createTodoPage.main.form.inputContainer.addImageContainer.iconAddImage} name={'image'} size={25} />
                            </TouchableOpacity>

                            {/* Image picker modal */}
                            <ImagePickerModal isVisible={isModalVisible} onClose={toggleModal} onImageSelected={handleImageSelected} onImageTaken={handleImageSelected}/>
                          </View>
                          {/* END Add Images */}
                      </View>
                      {errors.content && 
                        <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.content.message}</Text>
                      }

                      <View style={{marginBottom: 15}}>
                        <TouchableOpacity onPress={() => openCarouselModal(0)}>
                          <Text style={styles.h3}>Attached Images ({selectedImages.length})</Text>
                        </TouchableOpacity>
                        { selectedImages.length > 0 && 
                          <ImagesCarouselModal
                            isVisible={carouselModalVisible}
                            images={selectedImages}
                            selectedIndex={carouselIndex}
                            onClose={closeCarouselModal}
                          /> 
                        }
                        <View style={styles.createTodoPage.main.form.imagesContainer}>
                            {selectedImages.map((image: any, index: number) => (
                              <React.Fragment key={index}>
                                <TouchableOpacity onPress={() => openCarouselModal(index)}>
                                  <Image 
                                    source={{ uri: image }} 
                                    style={{ width: 60, height: 60, marginBottom: 10 }} 
                                  />
                                  <TouchableOpacity style={styles.createTodoPage.main.form.imagesContainer.removeBtn} onPress={() => removeImage(index)}>
                                    <Feather name={'x-circle'} size={25} color={'red'}/>
                                  </TouchableOpacity>
                                </TouchableOpacity>
                              </React.Fragment>
                            ))}
                        </View>
                      </View>
                      <Text>Select a date</Text>
                      <View style={styles.createTodoPage.main.form.dateInputContainer}>
                        <DatePicker
                          options={{
                            backgroundColor: 'trasparent',
                            textHeaderColor: '#324A2A',
                            textDefaultColor: '#3A612D',
                            selectedTextColor: '#fff',
                            mainColor: '#F4722B',
                            textSecondaryColor: '#324A2A',
                            borderColor: 'none',
                            textFontSize: 15,
                            textHeaderFontSize: 15,
                          }}
                          current={today}
                          selected={selectedDate}
                          mode="calendar"
                          minuteInterval={30}
                          style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                          onSelectedChange={date => setSelectedDate(date)}
                          projectsDate={[projectExpireDate]}
                          todosDate={[]}
                        />
                        <View style={styles.createTodoPage.main.form.dateInputContainer.legend}>
                          <Text style={styles.createTodoPage.main.form.dateInputContainer.legend.labelProject}>Project Date</Text>
                          <Text style={styles.createTodoPage.main.form.dateInputContainer.legend.dotProject}>.</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateTodo;
