import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Project, Todo } from '../utils/interfaces/types';

const useExtractExpDatesForCalendar = () => {
  const projects: any = useSelector((state: RootState) => state.projects.projects);

  const projectsDate = useMemo(() => {
    return projects.map((project: Project) => project.expireDate);
  }, [projects]);

  const todosDate = useMemo(() => {
    return projects.flatMap((project: Project) =>
      project.todos?.map((todo: Todo) => todo.expireDate) ?? []
    );
  }, [projects]);

  return { projectsDate, todosDate };
};

export default useExtractExpDatesForCalendar;
