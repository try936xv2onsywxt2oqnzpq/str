import { useBookmarks } from '../hooks/useBookmarks';
import Link from 'next/link';
import { useUser } from '../hooks/useUser';
import { useRouter } from 'next/router';

export default function Bookmarks() {
  const { user } = useUser();
  const router = useRouter();
  const { bookmarks } = useBookmarks();

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bookmarks</h1>
      {bookmarks?.length === 0 ? (
        <p>Belum ada bookmark.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bookmarks?.map((anime, i) => (
            <Link key={i} href={`/anime/${encodeURIComponent(anime.url)}`}>
              <div className="border rounded overflow-hidden cursor-pointer hover:shadow-lg">
                <img src={anime.image} alt={anime.title} className="w-full h-48 object-cover" />
                <div className="p-2">
                  <p className="font-semibold truncate">{anime.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}