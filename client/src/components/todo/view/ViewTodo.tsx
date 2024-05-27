import React, {useEffect,useMemo, useState, useLayoutEffect} from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView, View, Text, FlatList, Dimensions, Image, TouchableOpacity, Platform} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import DatePicker from 'react-native-modern-datepicker';
import {Feather} from '@expo/vector-icons';

import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';
import { Todo, Project, Comment } from '../../../utils/interfaces/types';

import { useQuery } from '@apollo/client';
import { GET_TODO_IMAGES } from '../../../../apollo/queries/todo/todoQueries';

import styles from '../../../styles'
import PlusButton from '../../buttons/PlusButton';
import CommentItem from '../CommentItem'
import AddCommentModal from '../../modals/comment/AddCommentModal';
import TodoItemMoreIconModal from '../../modals/todo/TodoItemMoreIconModal';
import ImagesCarouselModal from '../../modals/todo/ImagesCarouselModal'

/* import client from '../../../../apollo/apollo-client';
 */

  type StackProps = {
    today: string; 
  };
  
const ViewTodo = ({today}: StackProps) => {

    const height = Dimensions.get('window').height;
    const detailSection = height / 3.5
    /* for debugging
    client 
    .subscribe({
      query: COMMENT_CREATED,
    })
    .subscribe({
      next({ data: { commentCreated } }:any) {
        console.log(`New message: ${commentCreated.content}`);
      },
      error(err:any) {
        console.error("Error:", err);
      },
    }); */
    const navigation = useNavigation<any>();

    const route = useRoute();

    const { todoId, projectId } = route.params as any;

    const project: Project | any = useSelector((state: RootState) => {
      return state.projects.projects.find((project) => project.id === projectId);
    });

    const projectInfo = {projectId: projectId, projectTitle: project.title, projectExpDate: project.expireDate};

    const todo: Todo | any = useSelector((state: RootState) => {
      const project = state.projects.projects.find((project) => project.id === projectId);
      return project?.todos.find((todo) => todo.id === todoId);
    });


    // Get images
      const { data: { getTodoImages = [] } = {}, refetch } = useQuery(GET_TODO_IMAGES, {
          variables: { todoId: todoId },
      }); 
      // take the images if todo.images/prevTodoImages are different after edit in editTodo
      const prevTodoImages = useMemo(() => todo.images, []);

      useEffect(() => {
          if (todo.images !== prevTodoImages) {
              //console.log('different images');
              refetch(); 
          }
          prevTodoImages.current = todo.images; // Update prevTodoImages after the check
      }, [todo.images]);
    //End Get images
    
    // MoreIcon Modal Todo
    const [todoModalVisibility, setTodoModalVisibility] = useState(false);
    const toggleActionsModal = () => {
      setTodoModalVisibility(!todoModalVisibility);
    };

    const TodoMoreIcon = () => {
      return (
        <TouchableOpacity style={styles.viewTaskPage.header.actions.areaAction} onPress={() => toggleActionsModal()} >
          <Feather name={'more-horizontal'} size={25} />
        </TouchableOpacity>
      )
    }
    useLayoutEffect(() => {
      navigation.setOptions({
        headerRight: TodoMoreIcon,
      }); 
    },[])
    // END MoreIcon Modal Todo

    // Navigate to Edit Task
    const navigateEditTodo = (todo: Todo) => {
      navigation.navigate('TodoStack', {
        screen: 'Edit Task',
        params: { todoId: todo.id, projectInfo: projectInfo},
      });
    }
    // End Navigate to Edit Task

    // Comment List 
      // Add Comment Modal
      const [isAddCommentModalVisible, setAddCommentModalVisible] = useState(false);
      const toggleCommentModal = () => {
          if(Platform.OS === 'android') {
            setAddCommentModalVisible(!isAddCommentModalVisible);
          } else {
            setAddCommentModalVisible(!isAddCommentModalVisible);
          }
      };
      // END Add Comment Modal
    // End Comment List 

    const keyExtractorComment = (item: Comment) => item.id;
    const renderItemComment = ({ item }: { item: Comment }) => (
       <CommentItem item={item} todoId={todoId} projectId={projectInfo.projectId} />
    );

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
    
    return (
      <SafeAreaView style={{flex:1}}>
          <View style={[styles.viewTaskPage]}> 
            <View style={[styles.container]}>
              <View style={[styles.viewTaskPage.header]}>
                <View style={styles.viewTaskPage.header.dateContainer}>
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
                      disableDateChange={true}
                      mode="calendar"
                      style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                      projectsDate={[]}
                      todosDate={[todo.expireDate]}
                      current={today}
                      selected={todo.expireDate}
                    /> 
                  <View style={{width: '100%', height: '100%', zIndex: 2, position: 'absolute', top: 20, left: 0}}></View>
                </View>
              </View>
              <View style={[styles.viewTaskPage.main]}>
                <View style={[styles.viewTaskPage.main.details, {height: detailSection}]}>
                  <Text style={[styles.h2, styles.textCenter]}>Task Details:</Text>
                  <ScrollView>
                    <Text style={{fontSize: 16}}>{todo.content}</Text>  
                  </ScrollView>
              
                  <View style={styles.viewTaskPage.main.details.images}>
                      { getTodoImages.length > 0  ? 
                        <>
                          <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10}}>
                            {getTodoImages?.map((image:any, index: number) => (
                              <TouchableOpacity key={index} onPress={() => openCarouselModal(index)}>
                                <Image
                                    key={image.id}
                                    style={styles.viewTaskPage.main.details.images.tinyLogo}
                                    source={{
                                        uri: image.url,
                                    }}
                                />
                              </TouchableOpacity>
                            ))} 
                          </View>
                          <ImagesCarouselModal
                            isVisible={carouselModalVisible}
                            images={getTodoImages}
                            selectedIndex={carouselIndex}
                            onClose={closeCarouselModal}
                          /> 
                        </>
                        : <></>
                      }
                  </View>
                </View>
                <View style={[styles.viewTaskPage.main.comments]} >
                  <Text style={[styles.h2, styles.textCenter]}>{todo?.comments?.length} Comments:</Text>
                      <FlatList
                        data={todo?.comments.slice().reverse()} //Create a copy with slice() and then reverse it, for TypeError: Cannot assign to read-only property
                        keyExtractor={keyExtractorComment}
                        renderItem={renderItemComment}    
                        removeClippedSubviews={true}
                        initialNumToRender={1}
                      />
                      <TodoItemMoreIconModal
                        isVisible={todoModalVisibility}
                        onClose={() => toggleActionsModal()}
                        onEdit={() => {navigateEditTodo(todo)}}
                        todoId={todo.id}
                        todoContent={todo.content}
                        projectId={todo.project}
                      /> 
                      <AddCommentModal 
                        isVisible={isAddCommentModalVisible} 
                        onClose={toggleCommentModal} 
                        projectId={projectId} 
                        todoId={todoId} 
                      />
                </View>
              </View>
            </View>
            <PlusButton onPress={toggleCommentModal}/>
          </View>
      </SafeAreaView>
    )
}

export default ViewTodo;