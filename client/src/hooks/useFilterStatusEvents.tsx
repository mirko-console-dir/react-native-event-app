import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Project } from '../utils/interfaces/types';

const useFilterStatusEvents = () => {
  const projects: any = useSelector((state: RootState) => state.projects.projects);
  
  const projectsInProgress = useMemo(() => {
    return projects.filter((project: Project) => project.status === 'In Progress');
  }, [projects]);

  const projectsUpComing = useMemo(() => {
    return projects.filter((project: Project) => project.status === 'Pending');
  }, [projects]);

  const projectsCompleted = useMemo(() => {
    return projects.filter((project: Project) => project.status === 'Completed');
  }, [projects]);

  const projectsDate = useMemo(() => {
    return projects.map((project: Project) => project.expireDate);
  }, [projects]);

  return { projectsInProgress, projectsUpComing, projectsCompleted, projectsDate };
};

export default useFilterStatusEvents;