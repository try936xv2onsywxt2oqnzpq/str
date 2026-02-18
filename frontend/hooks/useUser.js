import { useQuery } from 'react-query';
import axios from '../lib/axios';

export const useUser = () => {
  const { data, refetch, isLoading } = useQuery(
    'user',
    () => axios.get('/auth/profile').then(res => res.data).catch(() => null),
    { retry: false, staleTime: 5 * 60 * 1000 }
  );
  return { user: data, refetch, isLoading };
};