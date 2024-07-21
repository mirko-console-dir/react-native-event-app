import React, {useCallback, useState} from 'react';
import { SafeAreaView, View, Text, FlatList,TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import { useNavigation,CommonActions } from '@react-navigation/native';

import styles from '../../../styles';
import ProjectItemBox from '../ProjectItem';
import TaskItem from '../../todo/TodoItem'
import {Feather} from '@expo/vector-icons'

import { Project, Todo } from '../../../utils/interfaces/types';
import useNavigationOptions from '../../../hooks/useNavigationOptions';
import useFilteredProjectsTodosByDate from '../../../hooks/useFilterProjectsTaksByDate';
import useExtractExpDatesForCalendar from '../../../hooks/useExtractExpDatesForCalendar';


type StackProps = {
  today: string; 
};

const ViewCalendarProjects = ({today}: StackProps) => {
  const navigation = useNavigation()
  const [selectedDate, setSelectedDate] = useState(today);
  
  const { selectedProjectsByDate, selectedTasksByDate } = useFilteredProjectsTodosByDate(selectedDate);
  const { projectsDate, todosDate } = useExtractExpDatesForCalendar();

  const renderProjectItem =  useCallback(({item}: {item: Project}) => { 
    return <ProjectItemBox project={item} />;
  },[])

  const renderTaskItem = useCallback(({ item }: { item: Todo }) => {
    return  ( 
        <TaskItem projectId={item.project} todoId={item.id} calendarView={true} todayTaskCalendarView={false}/>
    )
  },[])
    // Create button
    const CreateEventButton = useCallback(() => (
      <TouchableOpacity style={{flexDirection: 'column', justifyContent: 'center', marginRight: 15}} 
      onPress={() => navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ 
            name: 'Create Event',
          }], 
        })
      )}
    >
      <Feather style={{alignSelf: 'center'}} name={"plus"} size={25}  color='black'/>
    </TouchableOpacity>
    ),[navigation])
    useNavigationOptions({headerRight: CreateEventButton});
    // END Create button
  return (
    <SafeAreaView style={{flex:1}}>
        <View style={styles.calendarProjectsPage}>
          <View style={styles.container}> 
            <View style={styles.calendarProjectsPage.header}>
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
                    current={today}
                    selected={selectedDate}
                    mode="calendar"
                    minuteInterval={30}
                    style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5,paddingLeft: 5 }}
                    onSelectedChange={date => setSelectedDate(date)}
                    projectsDate={projectsDate}
                    todosDate={todosDate}
                  /> 
                <View style={styles.calendarProjectsPage.header.legend}>
                  <Text style={styles.h3}>
                    Deadline:
                  </Text>
                  <Text style={[styles.calendarProjectsPage.header.legend.labelProject]}>
                    Events
                  </Text>
                    <Text style={styles.calendarProjectsPage.header.legend.dotProject}>.</Text>
                  <Text style={[styles.calendarProjectsPage.header.legend.labelTask]}>
                    Tasks
                  </Text>
                    <Text style={styles.calendarProjectsPage.header.legend.dotTask}>.</Text>
                </View>
            </View>
          </View>
          
            <View style={styles.calendarProjectsPage.main}>
                <View style={styles.calendarProjectsPage.main.titleSection}>
                  <Text style={styles.h2}>Events Deadline ({selectedProjectsByDate?.length})</Text>
                </View>
                  <FlatList
                    style={styles.projectsList}
                    horizontal={true}
                    data={selectedProjectsByDate}
                    keyExtractor={(project) => project.id}
                    renderItem={renderProjectItem}
                  />
            </View>
              <View style={styles.calendarProjectsPage.main.titleSection}>
                <Text style={styles.h2}>Tasks Deadline ({selectedTasksByDate?.length})</Text>
              </View>
              <FlatList
                style={styles.todoItemList}
                data={selectedTasksByDate}
                keyExtractor={(todo: Todo) => todo.id} 
                renderItem={renderTaskItem}
              />
        </View>
      </SafeAreaView>
  );
};

export default ViewCalendarProjects;
