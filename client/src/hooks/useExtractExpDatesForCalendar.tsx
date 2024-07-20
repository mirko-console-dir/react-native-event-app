import {useMemo, useState} from 'react'
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { Project, Todo } from '../utils/interfaces/types';

const useExtractExpDatesForCalendar = () => {
    const projects : any = useSelector((state: RootState) => state.projects.projects);

    const [projectsDate, setProjectsDate] = useState<string[]>([]);
    const [todosDate, setTodosDate] = useState<string[]>([]);

    useMemo(() => {
        // Extract expiration dates and update projectsDate and todos state
        const expirationDatesProjects = projects.map((project: Project) => project.expireDate);
        setProjectsDate(expirationDatesProjects);
    
        const expirationDatesTodos = projects.flatMap((project: Project) =>
          project.todos?.map((todo: Todo) => todo.expireDate)
        );
        setTodosDate(expirationDatesTodos);
        
      }, [projects]);

    return {projectsDate, todosDate} 
}

export default useExtractExpDatesForCalendar