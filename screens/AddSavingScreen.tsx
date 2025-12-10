import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTransactions,
  getTodayString,
  SavingDestination,
  Transaction,
} from "../context/TransactionsContext";
import { useAuth } from "../auth/AuthContext";
import { addTransaction as addRemoteTransaction } from "../src/api/firebaseApi";


const DESTINATIONS: { key: SavingDestination; label: string }[] = [
  { key: "compte_commun", label: "Compte commun" },
  { key: "wave", label: "Wave" },
  { key: "orange_money", label: "Orange Money" },
  { key: "mtn_money", label: "MTN Money" },
  { key: "autre", label: "Autre" },
];

export default function AddSavingScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { addTransaction, updateTransaction, transactions } = useTransactions();
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [destination, setDestination] =
    useState<SavingDestination>("compte_commun");
  const [submitting, setSubmitting] = useState(false);

  const editingId: string | undefined = route?.params?.transactionId;
  const existingTx = editingId
    ? (transactions.find(
        (t) => t.id === editingId && t.type === "epargne"
      ) as Transaction | undefined)
    : undefined;

  useEffect(() => {
    if (existingTx) {
      setAmount(String(existingTx.amount));
      setLabel(existingTx.label);
      if (existingTx.destination) {
        setDestination(existingTx.destination);
      }
    }
  }, [existingTx]);

async function handleSave() {
  const parsed = parseInt(amount.replace(/\s/g, ""), 10);
  if (!parsed || parsed <= 0) {
    Alert.alert("Montant invalide", "Entre un montant valide en FCFA.");
    return;
  }
  if (!label.trim()) {
    Alert.alert(
      "Libellé obligatoire",
      "Décris rapidement cette épargne (ex : salaire, bonus…)."
    );
    return;
  }

  try {
    setSubmitting(true);

    if (editingId && existingTx) {
      // 🔹 Edition : uniquement local pour l’instant
      updateTransaction(editingId, {
        amount: parsed,
        label: label.trim(),
        destination,
      });
    } else {
      // 🔹 Création locale
      addTransaction({
        type: "epargne",
        amount: parsed,
        label: label.trim(),
        date: getTodayString(),
        destination,
      });

      // 🔹 Création distante (Firestore) pour le partage
      if (user) {
        await addRemoteTransaction({
          ownerPseudo: user.pseudo,
          type: "epargne",
          amount: parsed,
          label: label.trim(),
          date: getTodayString(),
        });
      }
    }

    navigation.goBack();
  } finally {
    setSubmitting(false);
  }
}


  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {editingId ? "Modifier l’épargne" : "Nouvelle épargne"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Où va l’argent ?</Text>
      <View style={styles.destinationsWrap}>
        {DESTINATIONS.map((d) => (
          <TouchableOpacity
            key={d.key}
            style={[
              styles.destChip,
              destination === d.key && styles.destChipActive,
            ]}
            onPress={() => setDestination(d.key)}
          >
            <Text
              style={[
                styles.destChipText,
                destination === d.key && styles.destChipTextActive,
              ]}
            >
              {d.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Montant (FCFA)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex : 20 000"
        placeholderTextColor="#6b7280"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Description de l’épargne</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Ex : Épargne salaire, prime, cadeau…"
        placeholderTextColor="#6b7280"
        value={label}
        onChangeText={setLabel}
        multiline
      />

      <TouchableOpacity
        style={[styles.saveButton, submitting && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={submitting}
      >
        <Text style={styles.saveText}>
          {submitting ? "Enregistrement..." : "Enregistrer l’épargne"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backText: {
    color: "#e5e7eb",
    fontSize: 18,
  },
  title: {
    color: "#e5e7eb",
    fontSize: 18,
    fontWeight: "600",
  },
  label: {
    marginTop: 12,
    marginBottom: 4,
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  destinationsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  destChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
  },
  destChipActive: {
    backgroundColor: "#111827",
    borderColor: "#22c55e",
  },
  destChipText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  destChipTextActive: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  input: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#f9fafb",
    fontSize: 14,
    backgroundColor: "#020617",
  },
  inputMultiline: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: "#22c55e",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },
});
