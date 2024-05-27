import useGetProjects from '../../hooks/useGetProjects';
import useGetMemos from '../../hooks/useGetMemos';

import { useDispatch } from 'react-redux';
import { setProjects } from '../../reduxReducers/projectSlice';
import { setMemos } from '../../reduxReducers/memoSlice';

const setUpStoreRedux = () => {
    const dispatch = useDispatch();
    const {projects} = useGetProjects();
    const {memos} = useGetMemos()
    
    dispatch(setMemos(memos))
    dispatch(setProjects(projects))
}

export default setUpStoreRedux