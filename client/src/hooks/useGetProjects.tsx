import { useQuery } from '@apollo/client';
import { GET_PROJECTS } from '../../apollo';

const useGetProjects = () => {
    const { loading, error, data } = useQuery(GET_PROJECTS);

    let projects = []
    if(data?.getProjects){
        projects = data.getProjects
    }
    return {projects}
}

export default useGetProjects
