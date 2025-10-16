import { useRouter } from 'next/router';
import HomePage from "../components/HomePage";

export default function Home() {
  const router = useRouter();

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
