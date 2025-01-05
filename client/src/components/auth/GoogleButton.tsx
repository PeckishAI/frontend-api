
import { Button } from "@/components/ui/button";
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '@/services/authService';
import { useNavigate } from 'wouter';

export const GoogleButton = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const result = await authService.googleLogIn(response.access_token);
        localStorage.setItem('token', result.access_token);
        navigate('/');
      } catch (error) {
        console.error('Google login failed:', error);
      }
    },
  });

  return (
    <Button variant="outline" className="w-full" onClick={() => login()}>
      Sign in with Google
    </Button>
  );
}
