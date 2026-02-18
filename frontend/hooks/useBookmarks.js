import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../lib/axios';

export const useBookmarks = () => {
  const queryClient = useQueryClient();
  const { data: bookmarks = [] } = useQuery(
    'bookmarks',
    () => axios.get('/bookmarks').then(res => res.data).catch(() => []),
    { staleTime: 2 * 60 * 1000 }
  );

  const addMutation = useMutation(
    (anime) => axios.post('/bookmarks/add', anime),
    { onSuccess: () => queryClient.invalidateQueries('bookmarks') }
  );

  const removeMutation = useMutation(
    (animeUrl) => axios.post('/bookmarks/remove', { animeUrl }),
    { onSuccess: () => queryClient.invalidateQueries('bookmarks') }
  );

  return {
    bookmarks,
    addBookmark: (anime) => addMutation.mutate(anime),
    removeBookmark: (animeUrl) => removeMutation.mutate(animeUrl),
  };
};