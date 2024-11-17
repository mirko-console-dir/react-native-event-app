import React, {useEffect,useState, useRef, useCallback} from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, ScrollView,Animated,StyleSheet } from 'react-native';

import styles from '../styles';

import { useSelector } from "react-redux";
import { RootState } from '../../app/store';
import { Project } from '../utils/interfaces/types';

import RangeDateSelectionModal from '../components/modals/RangeDateSelectionModal';
import ProjectItemBox from '../components/project/ProjectItem';
import useFilterStatusEvents from '../hooks/useFilterStatusEvents';

type StackProps = {
  today: string; 
};

const StatsProjects = ({today}: StackProps) => {
  
  const projects : any = useSelector((state: RootState) => state.projects.projects);
  const {projectsInProgress, projectsUpComing, projectsCompleted, projectsDate} = useFilterStatusEvents();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [projectsInProgressRange, setProjectsInProgressRange] = useState<Array<Project>>([]);
  const [projectsUpComingRange, setProjectsUpComingRange] = useState<Array<Project>>([]);
  const [projectsCompletedRange, setProjectsCompletedRange] = useState<Array<Project>>([]);

  const renderProjectItem = ({item}: {item: Project}) => { 
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


  const animateTower = useCallback((animatedValue: any, projectCount: any) => {
    const maxPercentageHeight = 75; 
    const maxProjectCount = Math.max(
      filterType === 'ALL' ? projectsInProgress.length ?? 0 : projectsInProgressRange.length ?? 0,
      filterType === 'ALL' ? projectsUpComing.length ?? 0 : projectsUpComingRange.length ?? 0,
      filterType === 'ALL' ? projectsCompleted.length ?? 0 : projectsCompletedRange.length ?? 0
    );

    Animated.timing(animatedValue, {
      toValue: projectCount !== 0 ? (projectCount / maxProjectCount) * maxPercentageHeight : 0, 
      duration: 900, 
      useNativeDriver: false,
    }).start();
  }, [filterType]);


  // range selection

  const [isModalRangeVisible, setModalRangeVisible] = useState(false);

  const toggleModal = () => {
        setModalRangeVisible(prev=>!prev);
  }

  const handleConfirmRange = useCallback((dateStart: string, dateEnd: string) => {
     // Filter projects that are in progress/pending
    const inProgressProjectsRange = projects.filter((project: Project) => project.status === "In Progress" && (project.expireDate >= dateStart && project.expireDate <= dateEnd ));
    const upComingProjectsRange = projects.filter((project: Project) => project.status === "Pending" && (project.expireDate >= dateStart && project.expireDate <= dateEnd ));
    const projectsCompletedRange = projects.filter((project: Project) => project.status === "Completed" && (project.expireDate >= dateStart && project.expireDate <= dateEnd ));
   
    setProjectsInProgressRange(inProgressProjectsRange);
    setProjectsUpComingRange(upComingProjectsRange);
    setProjectsCompletedRange(projectsCompletedRange);

    setFilterType('RANGE')
  }, [projects]);
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
                  <Text style={styles.h2}>Pending</Text>
                </View>
                <View style={styles.statsProjectsPage.header.statsGraph.container.status}>
                  <Animated.View style={[styles.statsProjectsPage.header.statsGraph.tower, styles.statsProjectsPage.header.statsGraph.towerCompleted, { height: heightCompleted }]}></Animated.View>
                  <Text style={styles.h2}>Completed</Text>
                </View>
              </View>
            </View>
            <View style={styles.statsProjectsPage.header.btnsFilter}>
              <View style={styles.statsProjectsPage.header.btnsFilter.container}>
                <TouchableOpacity style={[styles.statsProjectsPage.header.btnsFilter.container.btn, filterType == 'ALL' ? styleComponent.btnFocus: null]} 
                  onPress={() => setFilterType('ALL')}>
                  <Text style={[styles.h2, styles.textCenter, filterType == 'ALL' ? styleComponent.textFocus: null]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statsProjectsPage.header.btnsFilter.container.btn, filterType != 'ALL' ? styleComponent.btnFocus: null]}
                  onPress={() => toggleModal()}>
                  <Text style={[styles.h2, styles.textCenter, filterType != 'ALL' ? styleComponent.textFocus: null]}>Select Range</Text>
                </TouchableOpacity>
                <RangeDateSelectionModal 
                  isVisible={isModalRangeVisible} 
                  onClose={toggleModal} 
                  today={today} 
                  currentFilterType={filterType}
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
                  <Text style={styles.h2}>Pending ({filterType == 'ALL' ? projectsUpComing?.length : projectsUpComingRange?.length})</Text>
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
                  {projectsInProgress?.length > 0 && projectsUpComing?.length > 0 && projectsCompleted?.length > 0 && 
                    (<View style={[styles.extraSpaceForScrollView]}></View>)
                  }
              </ScrollView>
            </View>
        </View>
    </SafeAreaView>
  );
};

const styleComponent = StyleSheet.create({
  btnFocus: {
    backgroundColor: '#db7093',
  },
  textFocus: {
    color: '#f5f5f5'
  }
})
export default StatsProjects;
