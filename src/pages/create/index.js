import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const UserForm = dynamic(() => import("../../components/Form.jsx"), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function CreateUser() {
  const router = useRouter();

  const handleBack = () => {
    router.replace('/');
  };

  return <UserForm onBack={handleBack} />;
}
