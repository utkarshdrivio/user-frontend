import { useRouter } from 'next/router';
import FormData from "../../components/Form.jsx";

export default function CreateUser() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/');
  };

  return <FormData onBack={handleBack} />;
}
