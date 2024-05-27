import React, {useEffect,useState, useRef} from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, ScrollView,Animated,Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import styles from '../styles';

import { useSelector } from "react-redux";
import { RootState } from '../../app/store';
import { Project } from '../utils/interfaces/types';

import RangeDateSelectionModal from '../components/modals/RangeDateSelectionModal';
import ProjectItemBox from '../components/project/ProjectItem';

type StackProps = {
  today: string; 
};

const StatsProjects = ({today}: StackProps) => {
  const navigation = useNavigation<any>();
  
  const projects : any = useSelector((state: RootState) => state.projects.projects);

  const [projectsInProgress, setProjectsInProgress] = useState<Array<Project>>([]);
  const [projectsUpComing, setProjectsUpComing] = useState<Array<Project>>([]);
  const [projectsCompleted, setProjectsCompleted] = useState<Array<Project>>([]);

  const [projectsDate, setProjectsDate] = useState<any>([]);
  const [todosDate, setTodosDate] = useState<any>([]);

  const [filterType, setFilterType] = useState<string>('ALL');
  const [projectsInProgressRange, setProjectsInProgressRange] = useState<Array<Project>>([]);
  const [projectsUpComingRange, setProjectsUpComingRange] = useState<Array<Project>>([]);
  const [projectsCompletedRange, setProjectsCompletedRange] = useState<Array<Project>>([]);


  useEffect(() => {
    // Filter projects that are in progress/pending
    const inProgressProjects = projects.filter((project: Project) => project.status === "In Progress");
    const upComingProjects = projects.filter((project: Project) => project.status === "Pending");
    const projectsCompleted = projects.filter((project: Project) => project.status === "Completed");
  
    setProjectsInProgress(inProgressProjects);
    setProjectsUpComing(upComingProjects);
    setProjectsCompleted(projectsCompleted);
    // Extract expiration dates and update projectsDate and todos state
    const expirationDatesProjects = projects.map((project: Project) => project.expireDate);
    setProjectsDate(expirationDatesProjects);
    
  }, [projects]);



  const renderProjectItem =  ({item}: {item: Project}) => { 
    return <ProjectItemBox project={item} />;
  }

  // Status Graph
  const heightInProgress = useRef(new Animated.Value(0)).current;
  const heightUpcoming = useRef(new Animated.Value(0)).current;
  const heightCompleted = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateTower(heightInProgress, filterType == 'ALL'? projectsInProgress.length : projectsInProgressRange.length );
    animateTower(heightUpcoming,  filterType == 'ALL'? projectsUpComing.length : projectsUpComingRange.length );
    animateTower(heightCompleted,  filterType == 'ALL'? projectsCompleted.length : projectsCompletedRange.length );

  }, [projectsInProgress.length, projectsUpComing.length, projectsCompleted.length, projectsInProgressRange.length, projectsUpComingRange.length, projectsCompletedRange.length, filterType]);


  const animateTower = (animatedValue:any, projectCount:any) => {
    const maxPercentageHeight = 75; 
    const maxProjectCount = Math.max(
      filterType == 'ALL'? projectsInProgress.length ?? 0 : projectsInProgressRange.length ?? 0,
      filterType == 'ALL'? projectsUpComing.length ?? 0 : projectsUpComingRange.length ?? 0,
      filterType == 'ALL'? projectsCompleted.length ?? 0 : projectsCompletedRange.length ?? 0
    );

      Animated.timing(animatedValue, {
        toValue: projectCount != 0 ? (projectCount / maxProjectCount) * maxPercentageHeight : 0, 
        duration: 900, 
        useNativeDriver: false,
      }).start();
  };

  // range selection

  const [isModalRangeVisible, setModalRangeVisible] = useState(false);

  const toggleModal = () => {
      if(Platform.OS === 'android') {
        setModalRangeVisible(!isModalRangeVisible);
      } else {
        setModalRangeVisible(!isModalRangeVisible);
      }
  };

  const handleConfirmRange = (dateStart: string, dateEnd: string) => {
     // Filter projects that are in progress/pending
    const inProgressProjectsRange = projects.filter((project: Project) => project.status === "In Progress" && (project.expireDate >= dateStart && project.expireDate <= dateEnd ));
    const upComingProjectsRange = projects.filter((project: Project) => project.status === "Pending" && (project.expireDate >= dateStart && project.expireDate <= dateEnd ));
    const projectsCompletedRange = projects.filter((project: Project) => project.status === "Completed" && (project.expireDate >= dateStart && project.expireDate <= dateEnd ));
   
    setProjectsInProgressRange(inProgressProjectsRange);
    setProjectsUpComingRange(upComingProjectsRange);
    setProjectsCompletedRange(projectsCompletedRange);

    setFilterType('RANGE')
  }
  // END range selection


  return (
    <SafeAreaView style={styles.droidSafeArea}>
        <View style={styles.statsProjectsPage}>
          <View style={styles.container}> 
            <View style={styles.statsProjectsPage.header.statsGraph}>
              <View style={styles.statsProjectsPage.header.statsGraph.container}>
                <View style={styles.statsProjectsPage.header.statsGraph.container.status}>
                  <Animated.View style={[styles.statsProjectsPage.header.statsGraph.tower, styles.statsProjectsPage.header.statsGraph.towerProgress, { height : heightInProgress }]}></Animated.View>
                  <Text style={styles.h2}>In Progress</Text>
                </View>
                <View style={styles.statsProjectsPage.header.statsGraph.container.status}>
                 <Animated.View style={[styles.statsProjectsPage.header.statsGraph.tower, styles.statsProjectsPage.header.statsGraph.towerUpcoming, { height: heightUpcoming }]}></Animated.View>
                  <Text style={styles.h2}>Upcoming</Text>
                </View>
                <View style={styles.statsProjectsPage.header.statsGraph.container.status}>
                  <Animated.View style={[styles.statsProjectsPage.header.statsGraph.tower, styles.statsProjectsPage.header.statsGraph.towerCompleted, { height: heightCompleted }]}></Animated.View>
                  <Text style={styles.h2}>Completed</Text>
                </View>
              </View>
            </View>
            <View style={styles.statsProjectsPage.header.btnsFilter}>
              <View style={styles.statsProjectsPage.header.btnsFilter.container}>
                <TouchableOpacity style={styles.statsProjectsPage.header.btnsFilter.container.btn} onPress={() => setFilterType('ALL')}>
                  <Text style={[styles.h2, styles.textCenter]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.statsProjectsPage.header.btnsFilter.container.btn} onPress={() => toggleModal()}>
                  <Text style={[styles.h2, styles.textCenter]}>Select Range</Text>
                </TouchableOpacity>
                <RangeDateSelectionModal 
                  isVisible={isModalRangeVisible} 
                  onClose={toggleModal} 
                  today={today} 
                  projectsDate={projectsDate}
                  onConfirm={handleConfirmRange} 
                />
              </View>
            </View>
          </View>
            <View style={styles.statsProjectsPage.main}>
              <ScrollView>
                <View style={styles.statsProjectsPage.main.titleSection}>
                  <Text style={styles.h2}>In Progress ({filterType == 'ALL' ? projectsInProgress?.length : projectsInProgressRange?.length})</Text>
                </View>
                  <FlatList
                    style={styles.projectsList}
                    horizontal={true}
                    data={filterType == 'ALL' ? projectsInProgress : projectsInProgressRange}
                    keyExtractor={(project) => project.id}
                    renderItem={renderProjectItem}
                  />
                <View style={styles.statsProjectsPage.main.titleSection}>
                  <Text style={styles.h2}>Upcoming ({filterType == 'ALL' ? projectsUpComing?.length : projectsUpComingRange?.length})</Text>
                </View>
                <FlatList
                    style={styles.projectsList}
                    horizontal={true}
                    data={filterType == 'ALL' ? projectsUpComing : projectsUpComingRange }
                    keyExtractor={(project) => project.id}
                    renderItem={renderProjectItem}
                  />
                <View style={styles.statsProjectsPage.main.titleSection}>
                  <Text style={styles.h2}>Completed ({filterType == 'ALL' ? projectsCompleted?.length : projectsCompletedRange?.length})</Text>
                </View>
                <FlatList
                    style={styles.projectsList}
                    horizontal={true}
                    data={filterType == 'ALL' ? projectsCompleted : projectsCompletedRange}
                    keyExtractor={(project) => project.id}
                    renderItem={renderProjectItem}
                  />
                <View style={styles.extraSpaceForScrollView}></View>
              </ScrollView>
            </View>
        </View>
    </SafeAreaView>
  );
};

export default StatsProjects;
