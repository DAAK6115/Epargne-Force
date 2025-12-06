import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTransactions,
  getTodayString,
  Transaction,
} from "../context/TransactionsContext";

export default function AddExpenseScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { addTransaction, updateTransaction, transactions } = useTransactions();
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const editingId: string | undefined = route?.params?.transactionId;
  const existingTx = editingId
    ? (transactions.find(
        (t) => t.id === editingId && t.type === "depense"
      ) as Transaction | undefined)
    : undefined;

  useEffect(() => {
    if (existingTx) {
      setAmount(String(existingTx.amount));
      setLabel(existingTx.label);
    }
  }, [existingTx]);

  async function handleSave() {
    const parsed = parseInt(amount.replace(/\s/g, ""), 10);
    if (!parsed || parsed <= 0) {
      Alert.alert("Montant invalide", "Entre un montant valide en FCFA.");
      return;
    }
    if (!label.trim()) {
      Alert.alert("Libellé obligatoire", "Décris rapidement la dépense.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId && existingTx) {
        updateTransaction(editingId, {
          amount: parsed,
          label: label.trim(),
        });
      } else {
        addTransaction({
          type: "depense",
          amount: parsed,
          label: label.trim(),
          date: getTodayString(),
        });
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
          {editingId ? "Modifier la dépense" : "Nouvelle dépense"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.label}>Montant (FCFA)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Ex : 8 000"
        placeholderTextColor="#6b7280"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Description de la dépense</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        placeholder="Ex : Courses, restaurant, essence…"
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
          {submitting ? "Enregistrement..." : "Enregistrer la dépense"}
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
    backgroundColor: "#dc2626",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },
});
