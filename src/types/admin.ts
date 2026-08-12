// Admin types
export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'editor';
  created_at: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalSponsors: number;
  totalResultados: number;
  newsSubscribers: number;
  recentPosts: number;
  recentResultados: number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface AdminContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}
