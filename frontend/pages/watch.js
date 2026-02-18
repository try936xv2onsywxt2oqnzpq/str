import { useRouter } from 'next/router';
import { useQuery, useMutation } from 'react-query';
import axios from '../lib/axios';
import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';

export default function Watch() {
  const router = useRouter();
  const { url, title } = router.query;
  const episodeUrl = decodeURIComponent(url || '');
  const animeTitle = decodeURIComponent(title || '');
  const { user } = useUser();

  const [selectedServer, setSelectedServer] = useState(null);

  // Fetch stream data
  const { data, isLoading } = useQuery(['stream', episodeUrl], () =>
    axios.get('/stream', { params: { url: episodeUrl } }).then(res => res.data),
    { enabled: !!episodeUrl }
  );

  // Record history when user watches
  const historyMutation = useMutation(
    (historyData) => axios.post('/history/add', historyData)
  );

  useEffect(() => {
    if (user && data?.animeDetails) {
      historyMutation.mutate({
        animeUrl: data.navigation?.allEpisodes || episodeUrl,
        episodeUrl,
        title: animeTitle || data.animeDetails.title,
        image: data.animeDetails.imageUrl
      });
    }
  }, [user, data, episodeUrl, animeTitle]);

  // Like functionality
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const videoId = encodeURIComponent(episodeUrl); // atau pakai ID unik

  const { data: likeData } = useQuery(['likes', videoId], () =>
    axios.get(`/likes/${videoId}`).then(res => res.data),
    { enabled: !!episodeUrl }
  );

  useEffect(() => {
    if (likeData) {
      setLikeCount(likeData.count);
      if (user) {
        setLiked(likeData.likes.includes(user.id));
      }
    }
  }, [likeData, user]);

  const likeMutation = useMutation(
    () => axios.post('/likes/like', { videoId }),
    { onSuccess: () => { setLiked(true); setLikeCount(prev => prev + 1); } }
  );

  const unlikeMutation = useMutation(
    () => axios.post('/likes/unlike', { videoId }),
    { onSuccess: () => { setLiked(false); setLikeCount(prev => prev - 1); } }
  );

  const toggleLike = () => {
    if (!user) {
      alert('Login untuk like');
      return;
    }
    if (liked) {
      unlikeMutation.mutate();
    } else {
      likeMutation.mutate();
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{data?.animeDetails?.title}</h1>

      {/* Server selector */}
      {data?.videoPlayer?.servers?.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Pilih Server:</h2>
          <div className="flex gap-2 flex-wrap">
            {data.videoPlayer.servers.map((srv, i) => (
              <button
                key={i}
                onClick={() => setSelectedServer(srv.url)}
                className={`px-3 py-1 rounded ${selectedServer === srv.url ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {srv.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Video player */}
      {selectedServer && (
        <div className="aspect-w-16 aspect-h-9 mb-4">
          <iframe src={selectedServer} allowFullScreen className="w-full h-[500px]"></iframe>
        </div>
      )}

      {/* Like button */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={toggleLike} className="flex items-center gap-1 text-red-500">
          <span className="text-2xl">{liked ? '❤️' : '🤍'}</span>
          <span>{likeCount}</span>
        </button>
      </div>

      {/* Downloads */}
      {data?.downloads?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold">Download</h2>
          <div className="flex flex-wrap gap-2 mt-2">
            {data.downloads.map((dl, i) => (
              <a key={i} href={dl.url} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white px-3 py-1 rounded">
                {dl.name}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {data?.navigation?.prevEpisode && (
          <a href={`/watch?url=${encodeURIComponent(data.navigation.prevEpisode)}`} className="bg-gray-300 px-4 py-2 rounded">Prev</a>
        )}
        {data?.navigation?.allEpisodes && (
          <a href={data.navigation.allEpisodes} className="bg-gray-300 px-4 py-2 rounded">Semua Episode</a>
        )}
        {data?.navigation?.nextEpisode && (
          <a href={`/watch?url=${encodeURIComponent(data.navigation.nextEpisode)}`} className="bg-gray-300 px-4 py-2 rounded">Next</a>
        )}
      </div>
    </div>
  );
}