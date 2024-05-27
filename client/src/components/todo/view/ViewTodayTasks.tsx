import React, {useEffect,useState} from 'react';
import { SafeAreaView, View, Text, ImageBackground, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation,useFocusEffect } from '@react-navigation/native';
import styles from '../../../styles';
import { Asset } from 'expo-asset';
import { Feather } from '@expo/vector-icons';
import DatePicker from 'react-native-modern-datepicker';
import { Project, Todo } from '../../../utils/interfaces/types';
import TaskItem from '../../todo/TodoItem'

import { useSelector } from "react-redux";
import { RootState } from '../../../../app/store';

type StackProps = {
  today: string; 
};

const ViewTodayTasks = ({today}: StackProps) => {
  const navigation = useNavigation<any>();

  const [selectedTasksByDate, setSelectedTasksByDate] = useState<Array<Todo>>([]);
  const [todosDate, setTodosDate] = useState<any>([]);

  const projects : any = useSelector((state: RootState) => state.projects.projects);
  
  useEffect(() => {
    // Filter tasks for today 
    const filteredTasksByDateSelected = projects.flatMap((project: Project) =>
      project.todos?.filter((todo) => {return todo.expireDate == today})
    );
    setSelectedTasksByDate(filteredTasksByDateSelected);
    // Extract expiration dates and updated todos state
    const expirationDatesTodos = projects.flatMap((project: Project) =>
      project.todos?.map((todo) => todo.expireDate)
    );
    setTodosDate(expirationDatesTodos);

  },[projects]);


  // END to open the relative project modal 

  const renderTaskItem = ({ item }: { item: Todo }) => {
    return  ( 
        <TaskItem projectId={item.project} todoId={item.id} calendarView={true} todayTaskCalendarView={true}/>
    )
  }

  return (
    <SafeAreaView style={{flex:1}}>
        <View style={styles.viewTodayTasksPage}>
          <View style={styles.container}> 
            <View style={styles.viewTodayTasksPage.header}>
              {today != '' ? 
                <>
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
                    onSelectedChange={() => null}
                    mode="calendar"
                    minuteInterval={30}
                    style={{ borderRadius: 10, backgroundColor: 'transparent', borderWidth: 0.2, paddingTop: 7, paddingRight: 5, paddingLeft: 5 }}
                    projectsDate={[]}
                    todosDate={todosDate}
                    current={today}
                    minimumDate={today}
                    maximumDate={today}
                  />
                <View style={{width: '100%', height: '100%', zIndex: 2, position: 'absolute', top: 5, left: 0}}></View>

                <View style={styles.viewTodayTasksPage.header.legend}>
                  <Text style={styles.h3}>
                    Deadline:
                  </Text>
                  <Text style={[styles.viewTodayTasksPage.header.legend.labelTask]}>
                    Tasks
                  </Text>
                    <Text style={styles.viewTodayTasksPage.header.legend.dotTask}>.</Text>
                </View>
                </>
              : ''}
            </View>
          </View>
          
            <View style={styles.viewTodayTasksPage.main}>
              <View style={styles.viewTodayTasksPage.main.titleSection}>
                <Text style={styles.h2}>Tasks Deadline ({selectedTasksByDate?.length})</Text>
              </View>
              <FlatList
                style={styles.viewTodayTasksPage.main.todoItemList}
                data={selectedTasksByDate}
                keyExtractor={(todo: Todo) => todo.id}
                renderItem={renderTaskItem}
              />
            </View>
        </View>
    </SafeAreaView>
  );
};

export default ViewTodayTasks;
