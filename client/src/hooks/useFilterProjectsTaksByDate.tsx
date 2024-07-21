import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Project, Todo } from '../utils/interfaces/types';

const useFilteredProjectsTodosByDate = (selectedDate: string) => {
  const projects: any = useSelector((state: RootState) => state.projects.projects);

  const selectedProjectsByDate = useMemo(() => {
    return projects.filter((project: Project) => project.expireDate === selectedDate);
  }, [selectedDate, projects]);

  const selectedTasksByDate = useMemo(() => {
    return projects.flatMap((project: Project) =>
      project.todos?.filter((todo: Todo) => todo.expireDate === selectedDate) ?? []
    );
  }, [selectedDate, projects]);

  return { selectedProjectsByDate, selectedTasksByDate };
};

export default useFilteredProjectsTodosByDate;
