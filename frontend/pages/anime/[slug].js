import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import axios from '../../lib/axios';
import { useState } from 'react';
import { useUser } from '../../hooks/useUser';
import { useBookmarks } from '../../hooks/useBookmarks';
import CommentSection from '../../components/CommentSection';
import Link from 'next/link';

export default function AnimeDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const animeUrl = decodeURIComponent(slug || '');
  const { user } = useUser();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarks();

  const { data, isLoading } = useQuery(['anime', animeUrl], () =>
    axios.get('/detail', { params: { url: animeUrl } }).then(res => res.data),
    { enabled: !!animeUrl }
  );

  const isBookmarked = bookmarks?.some(b => b.url === animeUrl);

  const handleBookmark = () => {
    if (!user) {
      alert('Login dulu untuk bookmark');
      return;
    }
    if (isBookmarked) {
      removeBookmark(animeUrl);
    } else {
      addBookmark({ animeUrl, title: data?.title, image: data?.img });
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (!data) return <div className="text-center p-8">Anime tidak ditemukan</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-8">
        <img src={data.img} alt={data.title} className="w-64 h-auto rounded" />
        <div>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <p className="text-gray-600">{data.altTitle}</p>
          <div className="mt-4">
            <h2 className="font-semibold">Genres:</h2>
            <div className="flex flex-wrap gap-2">
              {data.genres.map((g, i) => (
                <span key={i} className="bg-gray-200 px-2 py-1 rounded text-sm">{g.name}</span>
              ))}
            </div>
          </div>
          <p className="mt-4">{data.description}</p>
          <div className="mt-4">
            <button
              onClick={handleBookmark}
              className={`px-4 py-2 rounded ${isBookmarked ? 'bg-red-500' : 'bg-blue-500'} text-white`}
            >
              {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-8">Daftar Episode</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
        {data.episodes.map((ep, i) => (
          <Link key={i} href={`/watch?url=${encodeURIComponent(ep.url)}&title=${encodeURIComponent(data.title)}`}>
            <div className="block bg-gray-100 p-2 rounded text-center hover:bg-gray-200 cursor-pointer">
              {ep.episode}
            </div>
          </Link>
        ))}
      </div>

      <CommentSection animeSlug={slug} />
    </div>
  );
}