import React, {useEffect,useState} from 'react';
import { SafeAreaView, View, Text, FlatList,TouchableOpacity } from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import { useNavigation,CommonActions } from '@react-navigation/native';

import styles from '../../../styles';
import ProjectItemBox from '../ProjectItem';
import TaskItem from '../../todo/TodoItem'
import {Feather} from '@expo/vector-icons'

import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';
import { Project, Todo } from '../../../utils/interfaces/types';
import PlusButton from '../../buttons/PlusButton';

type StackProps = {
  today: string; 
};

const ViewCalendarProjects = ({today}: StackProps) => {
  const navigation = useNavigation()
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedProjectsByDate, setSelectedProjectsByDate] = useState<Array<Project>>([]);
  const [selectedTasksByDate, setSelectedTasksByDate] = useState<Array<Todo>>([]);
  
  const [projectsDate, setProjectsDate] = useState<any>([]);
  const [todosDate, setTodosDate] = useState<any>([]);

  const projects : any = useSelector((state: RootState) => state.projects.projects);

  useEffect(() => {
    // Filter projects for selected date
    const filteredProjectByDateSelected = projects.filter((project: Project) => {
      return project.expireDate === selectedDate
    }); 
  
    setSelectedProjectsByDate(filteredProjectByDateSelected);
    
    const filteredTasksByDateSelected = projects.flatMap((project: Project) =>
      project.todos?.filter((todo: Todo) => {return todo.expireDate == selectedDate})
    );

    setSelectedTasksByDate(filteredTasksByDateSelected);

  },[selectedDate, projects]);

  useEffect(() => {

    // Extract expiration dates and update projectsDate and todos state
    const expirationDatesProjects = projects.map((project: Project) => project.expireDate);
    setProjectsDate(expirationDatesProjects);

    const expirationDatesTodos = projects.flatMap((project: Project) =>
      project.todos?.map((todo: Todo) => todo.expireDate)
    );
    setTodosDate(expirationDatesTodos);
    
  }, [projects]);

  const renderProjectItem =  ({item}: {item: Project}) => { 
    return <ProjectItemBox project={item} />;
  }

  const renderTaskItem = ({ item }: { item: Todo }) => {
    return  ( 
        <TaskItem projectId={item.project} todoId={item.id} calendarView={true} todayTaskCalendarView={false}/>
    )
  }
    // Create button
    const CreateEventButton = () => (
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
    )
    useEffect(()=>{
      navigation.setOptions({
        headerRight: CreateEventButton,
      })
    }, [navigation])
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
