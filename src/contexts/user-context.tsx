import { type User as NextUser } from "next-auth";
import { type ReactNode, createContext, useState, useContext } from "react";

export interface User extends NextUser {
  issuer: string;
  email: string;
  publicAddress: string;
}

export type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => void 0,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
