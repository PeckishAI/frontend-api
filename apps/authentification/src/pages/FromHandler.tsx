import { useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { useFromStore } from '../utils/FromContext';

export const FromHandler = () => {
  const [searchParams] = useSearchParams();
  const { setFrom } = useFromStore();

  useEffect(() => {
    const from = searchParams.get('from');
    if (from) {
      setFrom(from);
      console.log('FROM', searchParams.get('from'));
    }
  }, [searchParams, setFrom]);

  return <Outlet />;
};
