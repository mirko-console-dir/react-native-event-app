import {useMemo, useState} from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Project } from '../utils/interfaces/types';

const useFilterStatusEvents = () => {
    const projects : any = useSelector((state: RootState) => state.projects.projects);
    const [projectsInProgress, setProjectsInProgress] = useState<Array<Project>>([]);
    const [projectsUpComing, setProjectsUpComing] = useState<Array<Project>>([]);
    const [projectsCompleted, setProjectsCompleted] = useState<Array<Project>>([]);
  
    const [projectsDate, setProjectsDate] = useState<any>([]);
    useMemo(() => {
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

    return {projectsInProgress, projectsUpComing, projectsCompleted, projectsDate}
}

export default useFilterStatusEvents