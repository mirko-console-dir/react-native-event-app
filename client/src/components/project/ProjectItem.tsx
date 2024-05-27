import React, {useState} from 'react';
import { View, Text, ImageBackground, TouchableOpacity,Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles';
import { Asset } from 'expo-asset';
import { Feather } from '@expo/vector-icons';
import ProjectItemMoreIconModal from '../modals/project/ProjectItemMoreIconModal'
import CollaboratorAvatar from '../avatars/CollaboratorAvatar'
import { Project, Todo } from '../../utils/interfaces/types';

const ProjectItemBox = ({project}: {project: Project}) => { 
    const screenWidth = Dimensions.get('window').width;
    const projectItemWidth = screenWidth * 0.75; 

    const calculateCompleteStatus = (project: Project) => {
        let checkedTodo = 0
        const totalTodos = project.todos.length
        if(totalTodos){
          project.todos.forEach((todo: Todo, index: number) => {
            if (todo.checkedStatus){
              checkedTodo = checkedTodo + 1
            }
          })
          const status = checkedTodo * 100 / totalTodos
          return Math.round(status)
        }
        return checkedTodo
      }
    // to open the relative project modal 
    const [modalVisibility, setModalVisibility] = useState<{ [key: string]: boolean }>({});

    const openModal = (projectId: string) => {
        setModalVisibility((prev) => ({ ...prev, [projectId]: true }));
    };

    const closeModal = (projectId: string) => {
        setModalVisibility((prev) => ({ ...prev, [projectId]: false }));
    };
    // END to open the relative project modal 
    const navigation = useNavigation<any>();
    
    return (
        <View style={{width: projectItemWidth}}>
            <View style={styles.projectItem}>
                <TouchableOpacity onPress={() => navigation.navigate('Event', { projectId: project.id })}>
                    <ImageBackground
                    source={{
                        uri: Asset.fromModule(require("../../../assets/backgrounds/backgroundProjectsItem.png")).uri,
                    }}
                    >
                        <View style={styles.projectItem.container}>
                            <View style={styles.projectItem.content}>
                                <View style={styles.projectItem.content.header}>
                                    <View style={styles.projectItem.content.header.title}>
                                        <Text style={styles.h1} numberOfLines={1}>
                                            {project.title}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                    style={styles.projectItem.content.header.moreIcon} 
                                    onPress={() => openModal(project.id)}
                                    >
                                    <Feather name={'more-horizontal'} size={25} />
                                    </TouchableOpacity>
                                </View>
                                <View  style={styles.projectItem.content.main} >
                                    <View style={styles.projectItem.content.main.collaboratorsSection}>

                                    {project.collaborators?.length ?
                                        ( <Text style={styles.h3}>Collaborators</Text>)
                                        : (<Text style={styles.h3}>No Collaborators</Text>)} 
                                    
                                    <View style={styles.projectItem.content.main.collaboratorsSection.container}>
                                        {project.collaborators?.length ? 
                                            project.collaborators.map((collaborator: any) =>
                                                <CollaboratorAvatar 
                                                key={collaborator.id} 
                                                collaborator={collaborator} 
                                                style={{width: 30, height: 30, borderRadius: 50}}
                                                />
                                            )
                                        : null} 
                                    </View>
                                    </View>
                                </View>
                                <View style={styles.projectItem.content.footer}>
                                    <View >
                                        <Text style={styles.projectItem.content.footer.statusBarNumber}>Complete {calculateCompleteStatus(project)}%</Text>
                                        <View style={styles.projectItem.content.footer.projectStatusBar}>
                                        <View style={[styles.projectItem.content.footer.completeStatusColor, {width: `${calculateCompleteStatus(project)}%`}]}></View>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
            <ProjectItemMoreIconModal
                isVisible={modalVisibility[project.id] || false}
                onClose={() => closeModal(project.id)}
                onDelete={() => null}
                projectId={project.id}
                projectTitle={project.title}
            />
        </View>
  )
}

export default ProjectItemBox;
