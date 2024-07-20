import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
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

import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';
import { useToast } from '../../../utils/toastContext/ToastContext';

type StackProps = {
  today: string; 
};

interface InputTypes {
  content: string;
  expireDate: string;
  newImages: ImageForm[]
}
interface ImageForm {
  path: string;
}

const CreateTodo = ({today}: StackProps) => {
    const { success, error, warning } = useToast();

    const navigation = useNavigation<any>();
    const route = useRoute();

    // Date for calendar  
    const { projectId, projectExpireDate, projectTitle }: any = route.params;
    // ENDDate for calendar  

    const { control, handleSubmit, reset, formState: { errors }, setValue, getValues, setError, clearErrors } = useForm<InputTypes>({
      defaultValues: {
        content: '',
        expireDate: '',
        newImages: []
      }
    });    
    
    const [selectedDate, setSelectedDate] = useState(projectExpireDate);
    const [BtnListCompleteVisible, setBtnListCompleteVisible] = useState(false);
    
    // Upload images
    const [loadingImage,setLoadingImage] = useState<Boolean>(false)
    const [selectedImages, setSelectedImages] = useState<any>([]);
    const [isModalVisible, setModalVisible] = useState(false);

    const handleImageSelected = async (imageUri: any) => {
      setSelectedImages([...selectedImages, {uri: imageUri}]);
      setModalVisible(false);
      // set form data images
      const existingImages = getValues("newImages")	
      if(existingImages) setValue('newImages', [...existingImages,imageUri])
      else setValue('newImages',[imageUri])
      // END set form data images
    };

    const toggleModal = () => {
      if(selectedImages.length > 1) {
        return warning('Upload max 2 images for task')
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
      // set form data images
      const existingImages = getValues("newImages");	
      existingImages.splice(index, 1);
      setValue('newImages', [...existingImages])
      // END set form data images
    }
    // END Upload images

    // Handle data form to send 
    const fetchImageData = async (imageUri: any) => {
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

    const [createTodo, { data, loading }] = useMutation(CREATE_TODO);
    const dispatch = useDispatch()

    const handleCreateTodo = async (formData : InputTypes) => {
      const {content, expireDate, newImages} = formData;
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

      let imageDataArray : any[] = []
      if(newImages.length){
        setLoadingImage(true)
        const fetchImagePromises = newImages.map(fetchImageData);
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
        reset();
        setBtnListCompleteVisible(true);
        success('Success')
      } catch (err) {
        error('Something Wrong');
      } finally {
        setLoadingImage(false)
      }
    }
    // END Handle data form to send 

    // Close keybord avoid conflict with data picker onChange
    const closeKeybord = () => {
      Keyboard.dismiss()
    }
    const handleDateSelected = (date: string) => {
      date ?? setSelectedDate(date);
      
      setValue('expireDate', date);
      if(errors.expireDate){
        clearErrors("expireDate") 
      }
      Keyboard.dismiss();
    }
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
    useNavigationOptions({headerRight: SaveButtonTask});
  
    // END Save button
    if(loading || loadingImage){
      return (
          <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
              <ActivityIndicator size="large" style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }} />
          </View>
        )
    }
    return (
        <SafeAreaView style={{flex: 1}}>
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
                                    source={{ uri: image.uri }} 
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
                          selected={selectedDate ?? null}
                          mode="calendar"
                          minuteInterval={30}
                          style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                          onSelectedChange={date => handleDateSelected(date)}
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
                {BtnListCompleteVisible && 
                  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity style={styles.confirmButton} onPress={() => navigation.goBack()}>
                      <Text style={styles.confirmButton.text}>List Completed</Text>
                    </TouchableOpacity>
                  </View>
                }
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default CreateTodo;
