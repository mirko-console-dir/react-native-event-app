import React, {useState } from 'react';
import { View, Text, Dimensions, ImageBackground, TouchableOpacity, PanResponder, Animated, LayoutAnimation, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {editCheckedStatusTask, deleteTaskFromProject} from '../../reduxReducers/projectSlice'
import { useSelector,useDispatch } from "react-redux";
import { RootState } from '../../../app/store';
import { Todo,Project } from '../../utils/interfaces/types';
import { Asset } from 'expo-asset';
import { CHECKED_TODO, DELETE_TODO } from '../../../apollo/mutations/todo/todoMutations';
import { useMutation } from '@apollo/client';

import styles from '../../styles';
import Checkbox from '../checkbox';
import Chevron from '../todo/chevron';
import { useToast } from '../../utils/toastContext/ToastContext';

const TaskItem = ({ todoId, projectId, calendarView, todayTaskCalendarView} : { todoId: string, projectId: string; calendarView: boolean, todayTaskCalendarView: boolean}) => {
    const navigation = useNavigation<any>();
    const { success, error, warning } = useToast();


    const [showFooter, setShowFooter] = useState(false);

    // Scroll DX item animations
    const screenWidth = Dimensions.get('window').width;
    const witdhForPanScroll = -(screenWidth / 2.5)
    
    const [showActionButtons, setShowActionButtons] = useState(false);

    const pan = React.useRef(new Animated.ValueXY()).current;
  
    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if(showFooter && gestureState.dx < 0){
          setShowFooter(!showFooter)
        }
        // Check if the gesture is horizontal
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: Animated.event([
        null,
        { dx: pan.x } // Update pan.x with the gesture
      ], { useNativeDriver: false }),
      onPanResponderRelease: (evt, gestureState) => {
        // If the swipe is to the left
        if (gestureState.dx < witdhForPanScroll) {
         
          setShowActionButtons(true)
          Animated.spring(pan, { toValue: { x: +witdhForPanScroll, y: 0 }, useNativeDriver: false }).start();
        } else {
          // Reset the position if not swiped enough
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    });
    // END Scroll DX item animations

    const project: Project | any = useSelector((state: RootState) => {
      return state.projects.projects.find((project) => project.id === projectId);
    });

    const projectInfo = {projectId: project.id, projectTitle: project.title, projectExpDate: project.expireDate}

    const todo: Todo | any = useSelector((state: RootState) => {
      const project = state.projects.projects.find((project) => project.id === projectId);
      return project?.todos.find((todo) => todo.id === todoId);
    });

    const [checkedStatusTodoMutation] = useMutation(CHECKED_TODO);
    const dispatch = useDispatch()
    const toggleTodoCheckbox = async () => {

      dispatch(editCheckedStatusTask({projectId: projectId, taskId: todoId}))

      try {
        const checkedTodo = await checkedStatusTodoMutation({
          variables: {
            todoId: todoId,
            input: {
              checkedStatus: !todo.checkedStatus,
            },
          },
        });
        if(checkedTodo) {
          /* console.log('====================================');
          console.log(checkedTodo);
          console.log('====================================');     */
        }
      } catch (error) {
        console.error('Error updating todo checked status:', error);
      }
    };

    const toggleFooter = () =>{
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      if(showActionButtons){
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
      setShowFooter(!showFooter)
    }
    // Go to Task
    const goToTask = () => {
      if(showFooter){
        setShowFooter(!showFooter)
      }
      navigation.navigate('TodoStack', {
        screen: 'Task',
        params: { todoId: todoId, projectId: projectId },
      });  
    }
    // Edit Task
    const editTodo = () => {
      if(showActionButtons){
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
      navigation.navigate('TodoStack', {
        screen: 'Edit Task',
        params: { todoId: todoId, projectInfo: projectInfo},
      });
    };
    // Delete Task
    const [deleteTodoMutation] = useMutation(DELETE_TODO);

    const askConfirmDelete = () => {
      if(showActionButtons){
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
      }
      Alert.alert('Delete Task?', '', [
        {text: 'Cancel', onPress: () => {}},
        {text: 'OK', onPress: () => deleteTodo()}
      ]);
    };
  
    const deleteTodo = async () => {
      try {
        const { data } = await deleteTodoMutation({
          variables: {
            todoId: todoId,
          },
        });
        dispatch(deleteTaskFromProject({ projectId: projectId, taskId: todoId }));
        success('Task Deleted')
      } catch (err) {
        error('Error deleting Task');
      }
    };
  
    return (
      <Animated.View
        style={[
          {
            transform: [{ translateX: pan.x }],
          },
        ]}
        {...panResponder.panHandlers}
      >
            <TouchableOpacity style={styles.todoItem} onPress={goToTask}>
              <ImageBackground
                  source={{
                  uri: Asset.fromModule(require("../../../assets/backgrounds/backgroundProjectsItem.png")).uri,
                  }}
              >
                <View style={styles.todoItem.container}>
                  <View style={styles.todoItem.main}>
                      <Checkbox
                          isChecked={todo.checkedStatus}
                          onPress={() => toggleTodoCheckbox()}
                      /> 
                      
                      <View style={[styles.todoItem.main.content]}>
                        <Text style={styles.h1} numberOfLines={1} >{todo.content}</Text>
                      </View>
                  
                      <Chevron 
                          show={showFooter}
                          onPress={()=>toggleFooter()}
                      />
                  </View> 
                  {showFooter &&
                  <>
                        <View style={styles.todoItem.footer}>
                                <Text>{todo.images?.length ? `${todo.images.length} Attachments` : 'No Attachments'}</Text>
                                <Text>{todo.comments?.length ? `${todo.comments.length} Comments` : 'No Comments'}</Text>
                        </View>
                        <View style={styles.todoItem.eventDetails}>
                          {calendarView &&
                           <>
                             <View style={styles.todoItem.eventDetails.content}>
                                   <Text numberOfLines={1} >Event: {project.title} </Text>
                                   <Text numberOfLines={1} >Date: {project.expireDate}</Text>
                             </View>
                           </>
                          } 
                        </View>
                  </>
                  }
                </View>
              </ImageBackground>
            </TouchableOpacity>
              <View style={[styles.todoItem.actionButtons, {left: (screenWidth - 10) }]}>
                <TouchableOpacity 
                 onPress={() => {
                  // Handle delete logic here
                  editTodo();
                  }}
                >
                  <View style={[styles.todoItem.actionButtons.btn, { backgroundColor: '#35A2F1', width: screenWidth / 5}]}>
                    <Text style={{ color: 'white',fontWeight: 'bold'}}>Edit</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                 style={styles.todoItem.actionButtons.btn}
                  onPress={() => {
                    askConfirmDelete()
                  }}
                >
                  <View style={[styles.todoItem.actionButtons.btn, { backgroundColor: '#F13557', width: screenWidth / 5}]}>
                    <Text style={{ color: 'white', fontWeight: 'bold'}}>Delete</Text>
                  </View>
                </TouchableOpacity>
              </View>
    </Animated.View>
  )
}

export default TaskItem;
