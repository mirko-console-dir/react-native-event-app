import React, { useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList } from 'react-native';
import styles from '../../../styles';

import DatePicker from 'react-native-modern-datepicker';
import { Todo } from '../../../utils/interfaces/types';
import TaskItem from '../../todo/TodoItem'

import useFilteredProjectsTodosByDate from '../../../hooks/useFilterProjectsTaksByDate'
import useExtractExpDatesForCalendar from '../../../hooks/useExtractExpDatesForCalendar'

type StackProps = {
  today: string; 
};

const ViewTodayTasks = ({today}: StackProps) => {
  const {selectedTasksByDate} = useFilteredProjectsTodosByDate(today)
  const {todosDate} = useExtractExpDatesForCalendar()

  // END to open the relative project modal 

  const renderTaskItem = useCallback(({ item }: { item: Todo }) => {
    return  ( 
        <TaskItem projectId={item.project} todoId={item.id} calendarView={true} todayTaskCalendarView={true}/>
    )
  },[])

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
