import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../auth/AuthContext";

export type TransactionType = "depense" | "epargne";

export type SavingDestination =
  | "compte_commun"
  | "wave"
  | "orange_money"
  | "mtn_money"
  | "autre";

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  label: string;
  date: string; // "YYYY-MM-DD"
  destination?: SavingDestination; // pour les épargnes
};

const STORAGE_PREFIX = "@ef_transactions_v2_";

export function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type TransactionsContextType = {
  transactions: Transaction[];
  addTransaction: (data: {
    type: TransactionType;
    amount: number;
    label: string;
    date: string;
    destination?: SavingDestination;
  }) => void;
  updateTransaction: (
    id: string,
    changes: Partial<Omit<Transaction, "id">>
  ) => void;
  deleteTransaction: (id: string) => void;
  clearAll: () => void;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(
  undefined
);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Chargement quand l'utilisateur change (login / logout)
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoaded(true);
      return;
    }

    const key = STORAGE_PREFIX + user.id;

    (async () => {
      setLoaded(false);
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as Transaction[];
          setTransactions(Array.isArray(parsed) ? parsed : []);
        } else {
          setTransactions([]);
        }
      } catch (e) {
        console.log("Erreur chargement transactions", e);
        setTransactions([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, [user?.id]);

  // Sauvegarde automatique pour l'utilisateur courant
  useEffect(() => {
    if (!user || !loaded) return;
    const key = STORAGE_PREFIX + user.id;
    AsyncStorage.setItem(key, JSON.stringify(transactions)).catch((e) =>
      console.log("Erreur sauvegarde transactions", e)
    );
  }, [transactions, loaded, user]);

  function addTransaction(data: {
    type: TransactionType;
    amount: number;
    label: string;
    date: string;
    destination?: SavingDestination;
  }) {
    if (!user) {
      console.log("addTransaction sans utilisateur connecté");
      return;
    }
    const tx: Transaction = {
      id: String(Date.now()),
      ...data,
    };
    setTransactions((prev) => [tx, ...prev]);
  }

  function updateTransaction(
    id: string,
    changes: Partial<Omit<Transaction, "id">>
  ) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...changes } : t))
    );
  }

  function deleteTransaction(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  function clearAll() {
    setTransactions([]);
    if (user) {
      const key = STORAGE_PREFIX + user.id;
      AsyncStorage.removeItem(key).catch((e) =>
        console.log("Erreur clearAll transactions", e)
      );
    }
  }

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, updateTransaction, deleteTransaction, clearAll }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error(
      "useTransactions doit être utilisé à l’intérieur de TransactionsProvider"
    );
  }
  return ctx;
}

export async function loadTransactionsForUser(
  userId: string
): Promise<Transaction[]> {
  const key = STORAGE_PREFIX + userId;
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as Transaction[];
  } catch (e) {
    console.log("Erreur chargement transactions autre utilisateur", e);
    return [];
  }
}
