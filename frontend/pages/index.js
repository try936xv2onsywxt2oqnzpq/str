import { useQuery } from 'react-query';
import axios from '../lib/axios';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const { data, isLoading } = useQuery('home', () =>
    axios.get('/home').then(res => res.data)
  );

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Terbaru</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.latest?.map((anime, i) => (
          <Link key={i} href={`/anime/${encodeURIComponent(anime.link)}`}>
            <div className="border rounded overflow-hidden cursor-pointer hover:shadow-lg transition">
              <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover" />
              <div className="p-2">
                <p className="font-semibold truncate">{anime.title}</p>
                <p className="text-sm text-gray-600">{anime.eps}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h1 className="text-2xl font-bold mt-8 mb-4">Popular</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data?.popular?.map((anime, i) => (
          <Link key={i} href={`/anime/${encodeURIComponent(anime.link)}`}>
            <div className="border rounded overflow-hidden cursor-pointer hover:shadow-lg transition">
              <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover" />
              <div className="p-2">
                <p className="font-semibold truncate">{anime.title}</p>
                <p className="text-sm text-gray-600">{anime.genres}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}