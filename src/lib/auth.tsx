import { createContext, useContext, useState, type ReactNode } from 'react';

export type Role = 'developer' | 'community';

export type User = {
  username: string;
  name: string;
  role: Role;
  hub: string;
};

type LoginResult = { success: true } | { success: false; error: string };

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => LoginResult;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'biocore_user';

const ACCOUNTS: Record<string, { password: string; name: string; role: Role; hub: string }> = {
  dev_admin: { password: 'password123', name: 'Developer Admin', role: 'developer', hub: 'Mukono Hub Hub-01' },
  community_user: { password: 'community123', name: 'Community User', role: 'community', hub: 'Mukono Hub Hub-01' },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });

  const login = (username: string, password: string): LoginResult => {
    const account = ACCOUNTS[username.trim().toLowerCase()];
    if (!account) {
      return { success: false, error: 'Unknown username. Use dev_admin or community_user.' };
    }
    if (account.password !== password) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    const u: User = { username, name: account.name, role: account.role, hub: account.hub };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
