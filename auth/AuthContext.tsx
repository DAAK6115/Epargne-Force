import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  pseudo: string;
};

type StoredUser = AuthUser & {
  password: string;
  allowedViewers?: string[]; // IDs des comptes autorisés à voir ses activités
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
  viewableUsers: AuthUser[]; // comptes qui PARTAGENT avec moi sur CE téléphone
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_CURRENT = "@ef_current_user_v1";
const STORAGE_USERS = "@ef_users_v1";

function generateId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2);
}

function toPublicUser(u: StoredUser): AuthUser {
  const { password, allowedViewers, ...rest } = u;
  return rest;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const rawCurrent = await AsyncStorage.getItem(STORAGE_CURRENT);
        if (rawCurrent) {
          setUser(JSON.parse(rawCurrent) as AuthUser);
        }

        const rawUsers = await AsyncStorage.getItem(STORAGE_USERS);
        if (rawUsers) {
          const parsed = JSON.parse(rawUsers);
          if (Array.isArray(parsed)) {
            setStoredUsers(parsed as StoredUser[]);
          }
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
      return;
    }
    await AsyncStorage.setItem(STORAGE_CURRENT, JSON.stringify(u));
    setUser(u);
  }

  async function saveUsers(users: StoredUser[]) {
    setStoredUsers(users);
    await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  async function signup(
    name: string,
    email: string,
    pseudo: string,
    password: string
  ) {
    const normEmail = email.trim().toLowerCase();
    const normPseudo = pseudo.trim().toLowerCase();
    const safeName = name.trim() || pseudo.trim(); // si nom vide, on prend le pseudo

    if (!normEmail || !normPseudo || !password || !safeName) {
      throw new Error("Tous les champs sont obligatoires.");
    }

    const users = [...storedUsers];

    if (users.find((u) => u.email === normEmail)) {
      throw new Error("Un compte existe déjà avec cet email.");
    }
    if (users.find((u) => u.pseudo === normPseudo)) {
      throw new Error("Ce pseudo est déjà utilisé.");
    }

    const newUser: StoredUser = {
      id: generateId(),
      name: safeName,
      email: normEmail,
      pseudo: normPseudo,
      password,
      allowedViewers: [],
    };

    const nextUsers = [...users, newUser];
    await saveUsers(nextUsers);
    await saveCurrentUser(toPublicUser(newUser));
  }

  async function login(identifier: string, password: string) {
    const norm = identifier.trim().toLowerCase();
    const users = [...storedUsers];

    const found = users.find(
      (u) => u.email === norm || u.pseudo === norm
    );
    if (!found || found.password !== password) {
      throw new Error("Email/pseudo ou mot de passe incorrect.");
    }

    await saveCurrentUser(toPublicUser(found));
  }

  async function logout() {
    await saveCurrentUser(null);
  }

  const myShareCode = useMemo(
  () => (user ? `EF-${user.pseudo}` : null),
  [user]
);


  const viewableUsers = useMemo(() => {
    if (!user) return [];
    return storedUsers
      .filter((u) => (u.allowedViewers ?? []).includes(user.id))
      .map(toPublicUser);
  }, [storedUsers, user]);

  async function acceptShareCode(code: string) {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("Entre un code.");
  }

  // On accepte soit "EF-pseudo", soit juste "pseudo"
  let pseudoPart = trimmed;
  if (pseudoPart.toUpperCase().startsWith("EF-")) {
    pseudoPart = pseudoPart.slice(3);
  }
  const normPseudo = pseudoPart.trim().toLowerCase();
  if (!normPseudo) {
    throw new Error("Code invalide.");
  }

  if (!user) {
    throw new Error("Tu dois être connecté.");
  }

  const users = [...storedUsers];
  const target = users.find(
    (u) => u.pseudo.toLowerCase() === normPseudo
  );
  if (!target) {
    throw new Error("Ce compte n'existe pas sur cet appareil.");
  }

  // Partage dans les DEUX sens :
  // - le compte cible autorise moi
  // - moi j'autorise le compte cible
  const updated = users.map((u) => {
    if (u.id === target.id) {
      const set = new Set(u.allowedViewers ?? []);
      set.add(user.id);
      return { ...u, allowedViewers: Array.from(set) };
    }
    if (u.id === user.id) {
      const set = new Set(u.allowedViewers ?? []);
      set.add(target.id);
      return { ...u, allowedViewers: Array.from(set) };
    }
    return u;
  });

  await saveUsers(updated);
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

