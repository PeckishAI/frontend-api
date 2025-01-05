
import { Button } from "@/components/ui/button";
import { authService } from '@/services/authService';
import { useNavigate } from 'wouter';

export const AppleButton = () => {
  const navigate = useNavigate();

  const handleAppleLogin = async (response: any) => {
    try {
      const result = await authService.appleLogIn(response.authorization.id_token);
      localStorage.setItem('token', result.access_token);
      navigate('/');
    } catch (error) {
      console.error('Apple login failed:', error);
    }
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleAppleLogin}>
      Sign in with Apple
    </Button>
  );
}
