import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signupAccount,
  loginAccount,
  getPartners,
  linkByShareCode,
} from "../src/api/firebaseApi";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  pseudo: string;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signup: (
    name: string,
    email: string,
    pseudo: string,
    password: string
  ) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  myShareCode: string | null;
  acceptShareCode: (code: string) => Promise<void>;
  viewableUsers: AuthUser[];
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// nouveau storage key pour éviter les vieux formats
const STORAGE_CURRENT = "@ef_current_user_remote_v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewableUsers, setViewableUsers] = useState<AuthUser[]>([]);

  // Charger l'utilisateur courant depuis AsyncStorage au démarrage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_CURRENT);
        if (raw) {
          const parsed = JSON.parse(raw) as AuthUser;
          setUser(parsed);
        }
      } catch (e) {
        console.log("Auth load error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveCurrentUser(u: AuthUser | null) {
    if (!u) {
      await AsyncStorage.removeItem(STORAGE_CURRENT);
      setUser(null);
      setViewableUsers([]);
      return;
    }
    await AsyncStorage.setItem(STORAGE_CURRENT, JSON.stringify(u));
    setUser(u);
  }

  // Inscription : on délègue à Firestore
  async function signup(
    name: string,
    email: string,
    pseudo: string,
    password: string
  ) {
    const created = await signupAccount({ name, email, pseudo, password });
    await saveCurrentUser(created);
  }

  // Connexion : on délègue à Firestore
  async function login(identifier: string, password: string) {
    const logged = await loginAccount({ identifier, password });
    await saveCurrentUser(logged);
  }

  async function logout() {
    await saveCurrentUser(null);
  }

  // Mon code de partage (juste dérivé du pseudo)
  const myShareCode = useMemo(
    () => (user ? `EF-${user.pseudo}` : null),
    [user]
  );

  // Charger la liste des personnes qui partagent avec moi (via Firestore)
  useEffect(() => {
    if (!user) {
      setViewableUsers([]);
      return;
    }

    (async () => {
      try {
        const partners = await getPartners(user.pseudo);
        const mapped: AuthUser[] = partners.map((p: any) => ({
          id: p.id ?? p.pseudo,
          name: p.name ?? p.pseudo,
          email: p.email ?? "",
          pseudo: p.pseudo,
        }));
        setViewableUsers(mapped);
      } catch (e) {
        console.log("Erreur chargement partenaires", e);
      }
    })();
  }, [user]);

  // Accepter un code EF-xxxx via Firestore
  async function acceptShareCode(code: string) {
    if (!user) {
      throw new Error("Tu dois être connecté.");
    }

    const trimmed = code.trim();
    if (!trimmed) {
      throw new Error("Entre un code.");
    }

    // On accepte soit "EF-pseudo", soit juste "pseudo" → la logique est déjà dans linkByShareCode
    await linkByShareCode(user.pseudo, trimmed);

    // Recharger la liste des partenaires après acceptation
    const partners = await getPartners(user.pseudo);
    const mapped: AuthUser[] = partners.map((p: any) => ({
      id: p.id ?? p.pseudo,
      name: p.name ?? p.pseudo,
      email: p.email ?? "",
      pseudo: p.pseudo,
    }));
    setViewableUsers(mapped);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        myShareCode,
        acceptShareCode,
        viewableUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return ctx;
}
