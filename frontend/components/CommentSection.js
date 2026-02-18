import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from '../lib/axios';
import { useState } from 'react';
import { useUser } from '../hooks/useUser';

export default function CommentSection({ animeSlug }) {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [comment, setComment] = useState('');

  const { data: comments = [] } = useQuery(['comments', animeSlug], () =>
    axios.get(`/comments/${animeSlug}`).then(res => res.data)
  );

  const mutation = useMutation(
    (text) => axios.post('/comments/add', { animeSlug, text }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', animeSlug]);
        setComment('');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert('Login untuk berkomentar');
      return;
    }
    mutation.mutate(comment);
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold">Komentar</h2>
      <form onSubmit={handleSubmit} className="mt-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 rounded"
          rows="3"
          placeholder="Tulis komentar..."
          required
        />
        <button type="submit" className="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
          Kirim
        </button>
      </form>
      <div className="mt-6 space-y-4">
        {comments.map((c) => (
          <div key={c._id} className="border-b pb-2">
            <p className="font-semibold">{c.username}</p>
            <p>{c.text}</p>
            <p className="text-sm text-gray-500">{new Date(c.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}