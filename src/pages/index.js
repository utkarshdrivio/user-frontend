import { useRouter } from 'next/router';
import { useEffect } from 'react';
import HomePage from "../components/HomePage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch('/create');
    router.prefetch('/edit');
  }, [router]);

  const handleCreateUser = () => {
    router.push('/create');
  };

  const handleEditUser = (user) => {
    router.push(`/edit?id=${user.id}`);
  };

  return (
    <HomePage 
      onCreateUser={handleCreateUser}
      onEditUser={handleEditUser}
    />
  );
}
