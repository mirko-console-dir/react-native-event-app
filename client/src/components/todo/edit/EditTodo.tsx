import React, { useCallback, useState } from 'react';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView, Text, TextInput, TouchableOpacity, Image,Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, View, Platform,ActivityIndicator,Alert } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import styles from '../../../styles';
import { Feather } from '@expo/vector-icons';

import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { editTaskInProject,deleteImageFromTask } from '../../../reduxReducers/projectSlice';
import { RootState } from '../../../../app/store';
import { Todo } from '../../../utils/interfaces/types';

import { useQuery, useMutation } from '@apollo/client';
import { GET_TODO_IMAGES } from '../../../../apollo/queries/todo/todoQueries';
import { EDIT_TODO } from '../../../../apollo/mutations/todo/todoMutations'; 
import { DELETE_IMAGE_TODO } from '../../../../apollo/mutations/todo/todoMutations'; 

import ImagePickerModal from '../../modals/ImagePickerModal';
import ImagesCarouselModal from '../../modals/todo/ImagesCarouselModal';
import SaveButton from '../../buttons/SaveButton'
import useNavigationOptions from '../../../hooks/useNavigationOptions';
import { useToast } from '../../../utils/toastContext/ToastContext';

type StackProps = {
  today: string; 
};

interface InputTypes {
  editedContent: string;
  expireDate: string;
  newImages: ImageForm[]
}
interface ImageForm {
  path: string;
}


const EditTodo = ({today}: StackProps) => {
  const { success, error, warning } = useToast();

  const route = useRoute();
  const dispatch = useDispatch();

  const { todoId, projectInfo } = route.params as { todoId: string; projectInfo: any};
  const projectId = projectInfo.projectId
  const projectTitle = projectInfo.projectTitle
  const projectExpDate = projectInfo.projectExpDate

  const todo: Todo | any = useSelector((state: RootState) => {
    const project = state.projects.projects.find((project) => project.id === projectId);
    return project?.todos.find((todo) => todo.id === todoId);
  });

  const { control, handleSubmit, reset, formState: { errors }, setValue, getValues, setError, clearErrors } = useForm<InputTypes>({
    defaultValues: {
      editedContent: todo.content,
      expireDate: todo.expireDate,
      newImages: []
    }
  });    
  const [loadingImage,setLoadingImage] = useState<Boolean>(false)
  
 
  const handleDateSelected = (date: string) => {
    setValue('expireDate', date);
    Keyboard.dismiss();
  }

  const { data: { getTodoImages = [] } = {}, loading } = useQuery(GET_TODO_IMAGES, {
    variables: { todoId: todoId },
  });

  const [allImages, setAllImages] = useState<any>(getTodoImages)
  // Handle data to send image
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
  //END  Handle data to send image
  
  // Upload images
  const [isModalImagePickerVisible, setModalImgPickVisible] = useState(false);
  const toggleImagePickerModal = () => {
    if(allImages.length > 1) {
      Alert.alert('You can upload max 2 images for task')
    } else {
      setModalImgPickVisible(prev=>!prev);
    }
  }

  const handleImageSelected = (imageUri: any) => {
    setAllImages((prevImages:any) => [...prevImages, {uri: imageUri}]);
    // set form data images
    const existingImages = getValues("newImages")	
    if(existingImages) setValue('newImages', [...existingImages,imageUri])
    else setValue('newImages',[imageUri])
    // END set form data images
  }



  const removeImage = (index: number) => {
    const updatedImages = allImages.filter((_: any, i: number) => i !== index);
    setAllImages(updatedImages)
    // set form data images
    const existingImages = getValues("newImages");	
    existingImages.splice(index, 1);
    setValue('newImages', [...existingImages])
    // END set form data images
  }
  // END Upload images

  // Carousel Modal for attached images
  const [carouselModalVisible, setCarouselModalVisible] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const openCarouselModal = (index: number) => {
    setCarouselIndex(index);
    setCarouselModalVisible(true);
  }

  const closeCarouselModal = () => {
    setCarouselModalVisible(false);
  }
  // END Carousel Modal for attached images
  // Delete image 
  const [deleteTaskImage] = useMutation(DELETE_IMAGE_TODO)
  const deleteImage = async (todoId: string, imageId: string, imageName: string, index:number) => {
    try {
      const deletedImage = await deleteTaskImage({
        variables: {
          todoId: todoId,
          imageId: imageId,
          imageName: imageName
        },
      });
      removeImage(index)
      dispatch(deleteImageFromTask({projectId: projectId, taskId: todoId, imageName: imageName}))
      success('Image removed')
    }catch(err){
      error('Cannot Remove Image')
    }
  }
  const askConfirmDelete = (todoId: string, imageId: string, imageName: string, index: number) =>
    Alert.alert('Delete Image?', '', [
      {text: 'Cancel', onPress: () => {}},
      {text: 'OK', onPress: () => deleteImage(todoId, imageId, imageName, index)}
    ])


  // END Delete image 
  const [editTodo] = useMutation(EDIT_TODO);

  const handleSubmitEditTodo = useCallback(async (formData: InputTypes) => {
    const {editedContent, expireDate, newImages} = formData;

    if(todo.content == editedContent || todo.expireDate == expireDate || newImages.length < 1) return warning('Nothing to change')

    let imageDataArray : any[] = []
    if(newImages.length){
      setLoadingImage(true)
      const fetchImagePromises = newImages.map(fetchImageData);
      imageDataArray = await Promise.all(fetchImagePromises);
    } 

      try {
        const editedTodo = await editTodo({
          variables: {
            todoId: todo.id,
            input: {
              content: editedContent,
              expireDate: expireDate,
              images: imageDataArray
            },
          },
        });
  
        // Handle the response, e.g., show a success message or navigate to another screen
        console.log('====================================');
        console.log('Todo edited:', editedTodo.data);
        console.log('====================================');
        
        const updatedTodo = {
          id: todo.id,
          content: editedContent.trim(),
          expireDate: expireDate,
          comments: todo.comments,
          checkedStatus: todo.checkedStatus,
          images: allImages,
          project: todo.project
        }
  
        dispatch(editTaskInProject({projectId: projectId, task: updatedTodo}))
        clearErrors("editedContent") 
        clearErrors("expireDate") 
        success('Success')
      } catch (err) {
        error('Something wrong')
      } finally {
        setLoadingImage(false)
      }
  }, [todo, allImages, dispatch, editTodo, success, warning, error, clearErrors, projectId]);
  
  // Save button
  const SaveButtonTask = useCallback(() => (
    <SaveButton onPress={handleSubmit(handleSubmitEditTodo)}/>
  ),[handleSubmit,handleSubmitEditTodo])
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
    <SafeAreaView style={{flex:1}}>
            <ImagePickerModal isVisible={isModalImagePickerVisible} 
              onClose={toggleImagePickerModal} 
              onImageSelected={handleImageSelected}
              onImageTaken={handleImageSelected}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()} >
                <View style={styles.editTodoPage}>
                  <View style={styles.container}>
                  <Text style={[styles.textCenter, styles.h3, { marginTop: 15, marginBottom: 25}]}>Edit your task for event {projectTitle}</Text>
                    <View style={styles.editTodoPage.main}>
                      <View style={styles.editTodoPage.main.form}>
                        <View style={styles.editTodoPage.main.form.inputContainer}>
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
                              name="editedContent"
                              rules={{ 
                                required: 'You must enter a content',
                                validate: (value) => {
                                  // Check if the trimmed value is an empty string
                                  if (value.trim() === '') {
                                    return 'Content cannot be empty';
                                  }
                                  return true;
                                },
                              }}
                            />
                            {allImages.length < 2 && 
                              <View style={[styles.editTodoPage.main.form.inputContainer.addImageContainer, styles.flexRowAllCenter]}>
                                  <TouchableOpacity onPress={toggleImagePickerModal}>
                                    <Feather style={styles.editTodoPage.main.form.inputContainer.addImageContainer.iconAddImage} name={'image'} size={25} />
                                  </TouchableOpacity>
                              </View> 
                            }
                        </View>
                        {errors.editedContent && 
                            <Text style={{color:'red', marginBottom: 10, marginTop: -10}}>{errors.editedContent.message}</Text>
                        }
                        <View style={{marginBottom: 15}}>
                          <TouchableOpacity onPress={() => openCarouselModal(0)}>
                            <Text style={styles.h3}>Attached Images ({allImages.length})</Text>
                          </TouchableOpacity>
                          { allImages.length > 0 &&
                            <ImagesCarouselModal
                              isVisible={carouselModalVisible}
                              images={allImages}
                              selectedIndex={carouselIndex}
                              onClose={closeCarouselModal}
                            /> 
                          }
                              <View style={styles.editTodoPage.main.form.imagesContainer}>
                                {allImages?.map((image:any, index:any) => (
                                    <React.Fragment key={index}>
                                      <TouchableOpacity onPress={() => openCarouselModal(index)}>
                                        <Image
                                            style={styles.viewTaskPage.main.details.images.tinyLogo}
                                            source={{
                                                uri: image.url ? image.url : image.uri,
                                            }}
                                        />
                                        {image.uri ? 
                                          <TouchableOpacity style={styles.editTodoPage.main.form.imagesContainer.removeBtn} onPress={() => removeImage(index)}>
                                              <Feather name={'x-circle'} size={25} color={'red'}/>
                                          </TouchableOpacity>
                                        : 
                                          <TouchableOpacity style={[styles.editTodoPage.main.form.imagesContainer.removeBtn, {padding: 5}]} onPress={() => askConfirmDelete(todo.id, image.id, image.imageName, index)}>
                                              <Feather name={'trash-2'} size={17} color={'red'}/>
                                          </TouchableOpacity>
                                        }
                                      </TouchableOpacity>
                                    </React.Fragment>
                                ))} 
                              </View>
                        </View> 
                        <Text>Edit the date</Text>
                        <View style={styles.editTodoPage.main.form.dateInputContainer}>
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
                            selected={todo.expireDate}
                            mode="calendar"
                            minuteInterval={30}
                            style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                            onSelectedChange={date => handleDateSelected(date)}
                            projectsDate={[projectExpDate]}
                            todosDate={[todo.expireDate]}
                          />
                          <View style={styles.editTodoPage.main.form.dateInputContainer.legend}>
                            <Text style={styles.editTodoPage.main.form.dateInputContainer.legend.labelProject}>Event Date</Text>
                            <Text style={styles.editTodoPage.main.form.dateInputContainer.legend.dotProject}>.</Text>
                            <Text style={styles.editTodoPage.main.form.dateInputContainer.legend.labelTask}>Task Date</Text>
                            <Text style={styles.editTodoPage.main.form.dateInputContainer.legend.dotTask}>.</Text>
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

export default EditTodo;