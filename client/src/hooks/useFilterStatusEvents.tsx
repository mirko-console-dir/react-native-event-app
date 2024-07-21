import { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Project } from '../utils/interfaces/types';

const useFilterStatusEvents = () => {
  const projects: any = useSelector((state: RootState) => state.projects.projects);
  
  const filterInProgress = useCallback(() => {
    return projects.filter((project: Project) => project.status === 'In Progress');
  }, [projects]);

  const filterUpComing = useCallback(() => {
    return projects.filter((project: Project) => project.status === 'Pending');
  }, [projects]);

  const filterCompleted = useCallback(() => {
    return projects.filter((project: Project) => project.status === 'Completed');
  }, [projects]);

  const getExpirationDates = useCallback(() => {
    return projects.map((project: Project) => project.expireDate);
  }, [projects]);

  const projectsInProgress = useMemo(filterInProgress, [filterInProgress]);
  const projectsUpComing = useMemo(filterUpComing, [filterUpComing]);
  const projectsCompleted = useMemo(filterCompleted, [filterCompleted]);
  const projectsDate = useMemo(getExpirationDates, [getExpirationDates]);

  return { projectsInProgress, projectsUpComing, projectsCompleted, projectsDate };
};

export default useFilterStatusEvents;