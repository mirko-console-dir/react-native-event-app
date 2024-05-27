import React , {useRef} from 'react';
import moment from 'moment';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useLanguageContext } from "../../utils/languages/LanguageProvider";

import CustomBottomTab from './CustomBottomTab';

import Home from '../../screens/Home';
import Profile from '../../screens/Profile';
import Memos from '../../screens/Memos';
import StatsProjects from '../../screens/StatsProjects';

import EditProfile from '../../components/user/EditProfile';
import ProfileCollaborators from '../../components/user/ProfileCollaborators';

import LanguageSelection from '../../components/selectLanguage/LanguageSelection';

import ViewTodayTasks from '../../components/todo/view/ViewTodayTasks';
import ViewCalendarProjects from '../../components/project/view/ViewCalendarProjects';

import CreateProject from '../../components/project/create/CreateProject';
import ViewProject from '../../components/project/view/ViewProject';
import EditProject from '../../components/project/edit/EditProject';

import CreateMemo from '../../components/memo/create/CreateMemo';
import EditMemo from '../../components/memo/edit/EditMemo';
import ViewMemo from '../../components/memo/view/ViewMemo'

import CreateTodo from '../../components/todo/create/CreateTodo';
import ViewTodo from '../../components/todo/view/ViewTodo';
import EditTodo from '../../components/todo/edit/EditTodo';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();


type StackProps = {
  today: string; // Declare the 'today' prop
};

const HomeStack: React.FC<StackProps & { currentScreenRef: React.MutableRefObject<string | null> }> = ({ today,currentScreenRef }) => {
  return (
  <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName='Home'>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="ProjectStack">
      {() => <ProjectStack today={today} currentScreenRef={currentScreenRef} />}
    </Stack.Screen>
    <Stack.Screen name="TodoStack">
        {() => <TodoStack today={today} currentScreenRef={currentScreenRef}/>}
    </Stack.Screen>
    <Stack.Screen name="MemoStack">
        {() => <MemoStack currentScreenRef={currentScreenRef}/>}
    </Stack.Screen>
  </Stack.Navigator>
  )
};

const MemoStack: React.FC<{ currentScreenRef: React.MutableRefObject<string | null> }> = ({ currentScreenRef }) => (

  <Stack.Navigator initialRouteName='All Memo' >
      <Stack.Screen name="All Memo" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'All Memo' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}>
         {() => <Memos/>}
      </Stack.Screen>
      <Stack.Screen name="Create Memo" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Create Memo' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}>
         {() => <CreateMemo />}
      </Stack.Screen>
      <Stack.Screen name="Edit Memo" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Edit Memo' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}>
         {() => <EditMemo />}
      </Stack.Screen>
      <Stack.Screen name="Memo" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Memo' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}>
         {() => <ViewMemo />}
      </Stack.Screen>

  </Stack.Navigator>
  );

const ProjectStack: React.FC<StackProps & { currentScreenRef: React.MutableRefObject<string | null> }> = ({ today, currentScreenRef }) => { 
  
  return (<Stack.Navigator initialRouteName='Create Event' >
      <Stack.Screen name="Create Event" options={{headerTitleAlign: 'center'}}
       listeners={{
        focus: () => {
          currentScreenRef.current = 'Create Event' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
      >
        {() => <CreateProject today={today}/>}
      </Stack.Screen>
    <Stack.Group screenOptions={{headerShown: false}}>
      <Stack.Screen name="TodoStack">
        {() => <TodoStack today={today} currentScreenRef={currentScreenRef}/>}
      </Stack.Screen>
    </Stack.Group>
    <Stack.Screen name="Calendar" options={{headerTitleAlign: 'center'}}
       listeners={{
        focus: () => {
          currentScreenRef.current = 'View Calendar Projects' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
    >
        {() => <ViewCalendarProjects today={today} />}
    </Stack.Screen>
    <Stack.Screen name="Event" options={{headerTitleAlign: 'center'}}
       listeners={{
        focus: () => {
          currentScreenRef.current = 'Event' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
    >
        {() => <ViewProject today={today}/>}
    </Stack.Screen>
    <Stack.Screen name="Edit Event" options={{headerTitleAlign: 'center'}}
       listeners={{
        focus: () => {
          currentScreenRef.current = 'Edit Event' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
    >
        {() => <EditProject today={today}/>}
    </Stack.Screen>
  </Stack.Navigator>)
};

const TodoStack: React.FC<StackProps & { currentScreenRef: React.MutableRefObject<string | null> }> = ({ today,currentScreenRef }) => (
  <Stack.Navigator initialRouteName='Create Task'>
    <Stack.Group>
      <Stack.Screen name="Create Task" options={{headerTitleAlign: 'center'}}
       listeners={{
        focus: () => {
          currentScreenRef.current = 'Create Task' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
      >
          {() => <CreateTodo today={today} />}
      </Stack.Screen>
    </Stack.Group>
    <Stack.Screen name="Today Tasks" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Today Tasks' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
    >
        {() => <ViewTodayTasks today={today} />}
    </Stack.Screen>
    <Stack.Screen name="Task" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Task' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
    >
        {() => <ViewTodo today={today}/>}
    </Stack.Screen>
    <Stack.Screen name="Edit Task" options={{headerTitleAlign: 'center'}}
       listeners={{
        focus: () => {
          currentScreenRef.current = 'Edit Task' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}
      >
          {() => <EditTodo today={today} />}
      </Stack.Screen>
  </Stack.Navigator>
);

const ProfileStack: React.FC<{ currentScreenRef: React.MutableRefObject<string | null>, translate: (key: string) => string; }> = ({ currentScreenRef, translate }) => (

    <Stack.Navigator initialRouteName='Profile'>
      <Stack.Screen name="Profile" 
        options={{headerTitleAlign: 'center', headerTitle: translate('profile.pageName')}}
        listeners={{
          focus: () => {
            currentScreenRef.current = 'Profile' 
          },
          blur: () => {
            currentScreenRef.current = null;
          },
        }}
      >
         {() => <Profile />}
      </Stack.Screen>
      <Stack.Screen name="Edit Profile" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Edit Profile' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}>
         {() => <EditProfile />}
      </Stack.Screen>
      <Stack.Screen name="Collaborators" options={{headerTitleAlign: 'center'}}
      listeners={{
        focus: () => {
          currentScreenRef.current = 'Profile Collaborators' 
        },
        blur: () => {
          currentScreenRef.current = null;
        },
      }}>
         {() => <ProfileCollaborators />}
      </Stack.Screen>
      <Stack.Screen name="Language" 
        options={{headerTitleAlign: 'center', headerTitle: translate('profile.profileSelectLang.pageName')}}
        listeners={{
          focus: () => {
            currentScreenRef.current = 'Language' 
          },
          blur: () => {
            currentScreenRef.current = null;
          },
        }}
      >
         {() => <LanguageSelection />}
      </Stack.Screen>
      
    </Stack.Navigator>
  );

const Tabs = () => {
  const today = moment().format('YYYY/MM/DD'); 
  const currentScreenRef = useRef<string | null>(null);
  const { translate } = useLanguageContext();

  return (
    <Tab.Navigator tabBar={ props => <CustomBottomTab {...props} currentScreenRef={currentScreenRef}/> }
      screenOptions={{
        headerShown: false
      }}
    >
        <Tab.Group>
          <Tab.Screen
            name={'HomePage'}
            options={{
              tabBarLabel: 'Home',
            }}
          >
            {() => <HomeStack today={today} currentScreenRef={currentScreenRef}/>}
          </Tab.Screen>
          <Tab.Screen
            name={'Status Projects'}
            options={{
              tabBarLabel: 'Stats',
            }}
          >
            {() => <StatsProjects today={today}/>}
          </Tab.Screen>
          <Tab.Screen
            name={'ProfilePage'}
            options={{
              tabBarLabel: 'Profile',
            }}
          >
            {() => <ProfileStack currentScreenRef={currentScreenRef} translate={translate}/>}
          </Tab.Screen>
        </Tab.Group> 
    </Tab.Navigator>
  );
};

export default Tabs;
