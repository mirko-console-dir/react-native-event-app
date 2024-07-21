import React, {useCallback, useState} from 'react';
import { SafeAreaView, View, Text, FlatList, ImageBackground, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DatePicker from 'react-native-modern-datepicker';

import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';
import { Project, Todo } from '../../../utils/interfaces/types';

import {Feather} from '@expo/vector-icons'
import styles from '../../../styles';
import TaskItem from '../../todo/TodoItem'
import PlusButton from '../../buttons/PlusButton';
import CollaboratorAvatar from '../../avatars/CollaboratorAvatar'
import AddCollaboratorsModal from '../../modals/project/AddCollaboratorsModal';
import ProjectItemMoreIconModal from '../../modals/project/ProjectItemMoreIconModal'
import useNavigationOptions from '../../../hooks/useNavigationOptions';

  type StackProps = {
    today: string; 
  };

const ViewProject = ({today}: StackProps) => {
    const route = useRoute();
    const { projectId } = route.params as any;
    
    const project: Project | any = useSelector((state: RootState) => {
      return state.projects.projects.find((project) => project.id === projectId);
    });
    
    const navigation = useNavigation<any>();
      
    // Add Collaborator Modal
    const [isCollaboratorModalVisible, setCollaboratorModalVisible] = useState(false);
    const toggleCollaboratorModal = () => {
      setCollaboratorModalVisible(prev=>!prev)
    };
    // END Add Collaborator Modal

    // MoreIcon Modal Project
    const [modalProjectVisibility, setProjectModalVisibility] = useState<{ [key: string]: boolean }>({});
    const openProjectModal = useCallback((projectId: string) => {
      setProjectModalVisibility((prev) => ({ ...prev, [projectId]: true }));
    },[]);

    const closeProjectModal = useCallback((projectId: string) => {
      setProjectModalVisibility((prev) => ({ ...prev, [projectId]: false }));
    },[]);
    // END MoreIcon Modal Project

    const renderTaskItem = useCallback(({item, index, totalItems}: {item: Todo, index: number, totalItems: number}) => { 
      return (
        <React.Fragment>
          <TaskItem projectId={item.project} todoId={item.id} calendarView={false} todayTaskCalendarView={false}/>
          {index === totalItems - 1 && <View style={styles.extraSpaceForListItem} />}
        </React.Fragment>
        )
    },[])

    const handleCreateTask = useCallback(() => {
      navigation.navigate('TodoStack', {screen:'Create Task', params: { projectId: project.id, projectTitle: project.title, projectExpireDate: project.expireDate}})
    }, [navigation, project?.id, project?.title, project?.expireDate]);

    const ProjectViewActions = useCallback(() => {
      return (
              <View style={styles.viewProjectPage.header.projectViewActions}>
                  <TouchableOpacity onPress={toggleCollaboratorModal} 
                    style={styles.viewProjectPage.header.projectViewActions.areaAction}
                    >
                    <Feather name={'user-plus'} size={25} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openProjectModal(project.id)}
                    style={styles.viewProjectPage.header.projectViewActions.areaAction}
                  >
                    <Feather name={'more-horizontal'} size={25} />
                  </TouchableOpacity>
              </View>
      )
    }, [toggleCollaboratorModal, openProjectModal, project?.id]);
    
    useNavigationOptions({headerRight: ProjectViewActions});

    return (
        <SafeAreaView style={{flex:1}}>
          <View style={styles.viewProjectPage}>
            <View style={styles.container}>
              <Text style={[styles.h1, styles.viewProjectPage.header.title, styles.textCenter]}>{project?.title}</Text>
                {project?.collaborators?.length ? 
                    <View style={styles.viewProjectPage.header}> 
                      <View style={styles.viewProjectPage.header.collaboratorsArea}>
                            <Text style={styles.h3}>Collaborators</Text>
                            <View style={styles.viewProjectPage.header.collaboratorsArea.avatarsArea}>
                                {project?.collaborators.map((collaborator: any) =>
                                    <CollaboratorAvatar 
                                      key={collaborator.id} 
                                      collaborator={collaborator} 
                                      style={{width: 30, height: 30, borderRadius: 50}}
                                    />
                                )}
                            </View>
                      </View>
                    </View>
                  : <></>
                } 

                <View style={styles.viewProjectPage.main}>
                  {project ? (
                    <>
                      <View style={styles.viewProjectPage.main.dateContainer}>
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
                          selected={project.expireDate}
                          disableDateChange={true}
                          mode="calendar"
                          minuteInterval={30}
                          style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                          projectsDate={[project.expireDate]}
                          todosDate={[]}
                          current={today}
                        />
                        <View style={{width: '100%', height: '100%', zIndex: 2,position: 'absolute', top: 5, left: 0}}></View>
                      </View>
                    </>
                  ) : <></>}
                </View>
            </View>
            <FlatList
                data={project?.todos.slice()}
                keyExtractor={(item :Todo) => item.id}
                renderItem={({ item, index }) => renderTaskItem({ item, index, totalItems: project.todos.length })}
                style={[styles.todoItemList, {marginTop: 15}]}
            />     
            <ProjectItemMoreIconModal
              isVisible={modalProjectVisibility[project?.id] || false}
              onClose={() => closeProjectModal(project?.id)}
              onDelete={() => {closeProjectModal(project?.id); navigation.goBack()}}
              projectId={projectId}
              projectTitle={project?.title}
            />
            <AddCollaboratorsModal 
              isVisible={isCollaboratorModalVisible} 
              onClose={toggleCollaboratorModal} 
              projectId={project?.id} 
            />
            <PlusButton onPress={handleCreateTask}/>
          </View>
        </SafeAreaView>
    )
};

export default ViewProject;