'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/useAuthStore';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { user, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router, setUser, setLoading]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
