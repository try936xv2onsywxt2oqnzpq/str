import Link from 'next/link';
import { useUser } from '../hooks/useUser';
import axios from '../lib/axios';
import { useRouter } from 'next/router';

export default function Navbar() {
  const { user, refetch } = useUser();
  const router = useRouter();

  const logout = async () => {
    await axios.post('/auth/logout');
    refetch();
    router.push('/');
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-bold text-xl">AnimeIndo</Link>
        <div className="space-x-4">
          <Link href="/">Home</Link>
          <Link href="/movie">Movie</Link>
          <Link href="/anime-list">Anime List</Link>
          {user ? (
            <>
              <Link href="/bookmarks">Bookmarks</Link>
              <span>Halo, {user.username}</span>
              <button onClick={logout} className="bg-red-500 px-2 py-1 rounded">Logout</button>
            </>
          ) : (
            <Link href="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}