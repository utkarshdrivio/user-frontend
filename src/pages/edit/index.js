import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import UserForm from "../../components/Form.jsx";

export default function EditUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const fetchUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        setUser(userData);
      } else {
        console.error('User not found:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleBack = () => {
    router.push('/');
  };

  if (!user) return <div>Loading...</div>;

  return <UserForm user={user} onBack={handleBack} />;
}