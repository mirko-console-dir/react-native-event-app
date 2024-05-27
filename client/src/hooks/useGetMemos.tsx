import { useQuery } from '@apollo/client';
import { GET_ALL_MEMO } from '../../apollo';

const useGetMemos = () => {
    const { loading, error, data } = useQuery(GET_ALL_MEMO);
    let memos = []
    if(data?.getMemos){
        memos = data.getMemos
    }
    return {memos}
}

export default useGetMemos