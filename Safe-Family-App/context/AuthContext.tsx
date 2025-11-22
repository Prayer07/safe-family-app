import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

import { getToken } from "../utils/secureStorage";
import config from "../utils/config";

export const API_BASE_URL = config.API_URL;

// --------------------
// 1. Define User Types
// --------------------
export interface IUser {
  _id: string;
  fullname: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}

// ----------------------------------------
// 2. Define the Auth Context interface
// ----------------------------------------
interface AuthContextType {
  user: IUser | null;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  token: string | null;
  setToken: Dispatch<SetStateAction<string | null>>;
}

// Default Values (safe!)
export const Auth = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  token: null,
  setToken: () => {},
});

// ----------------------------------------
// 3. Provider Component
// ----------------------------------------
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load token on app start
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await getToken();
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

  return (
    <Auth.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </Auth.Provider>
  );
}