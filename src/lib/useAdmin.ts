'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AdminUser } from '@/types/admin';

const ADMIN_TOKEN_KEY = 'saf_admin_token';
const ADMIN_USER_KEY = 'saf_admin_user';

export function useAdmin() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar se há token salvo ao carregar
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const savedUser = localStorage.getItem(ADMIN_USER_KEY);

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setLoading(true);

        // Validação simples (em produção, usar Supabase Auth)
        if (
          email === 'admin@saftalisma.com.br' &&
          password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
        ) {
          const adminUser: AdminUser = {
            id: '1',
            email,
            role: 'admin',
            created_at: new Date().toISOString(),
          };

          // Simular token JWT
          const token = btoa(JSON.stringify(adminUser));

          localStorage.setItem(ADMIN_TOKEN_KEY, token);
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));

          setUser(adminUser);
          router.push('/admin/dashboard');

          return;
        }

        throw new Error('Email ou senha inválidos');
      } catch (error: any) {
        console.error('Login error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
      setUser(null);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const isAdmin = !!user && user.role === 'admin';

  return {
    user,
    loading,
    login,
    logout,
    isAdmin,
  };
}
