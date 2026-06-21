import { useState } from 'react';

export interface UserAddress {
  fullName?: string;
  phone?: string;
  houseFlatBuilding?: string;
  streetArea?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  landmark?: string;
}

export interface StoreUser {
  _id: string;
  name: string;
  ip: string;
  address?: UserAddress;
  phone?: string;
}

function readLocalStorage<T>(key: string): T | null {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

export function useStoreUser() {
  // Lazy initializer — reads synchronously so state is correct on first render
  const [user, setUser] = useState<StoreUser | null>(() => readLocalStorage<StoreUser>('storeUser'));

  const saveUser = (newUser: StoreUser) => {
    localStorage.setItem('storeUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const clearUser = () => {
    localStorage.removeItem('storeUser');
    setUser(null);
  };

  return { user, saveUser, clearUser };
}

export function useAdminToken() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('adminToken'));

  const saveToken = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const clearToken = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  return { token, saveToken, clearToken };
}
