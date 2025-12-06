import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTransactions,
  Transaction,
  SavingDestination,
} from "../context/TransactionsContext";

function getDestinationLabel(dest?: SavingDestination) {
  if (!dest) return "";
  switch (dest) {
    case "compte_commun":
      return "Compte commun";
    case "wave":
      return "Wave";
    case "orange_money":
      return "Orange Money";
    case "mtn_money":
      return "MTN Money";
    case "autre":
      return "Autre";
    default:
      return "";
  }
}

export default function ManageSavingsScreen({ navigation }: { navigation: any }) {
  const { transactions, deleteTransaction } = useTransactions();

  const savings = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "epargne")
        .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)),
    [transactions]
  );

  function confirmDelete(tx: Transaction) {
    Alert.alert(
      "Supprimer",
      `Supprimer l’épargne "${tx.label}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteTransaction(tx.id),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Épargnes</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddSaving")}
        >
          <Text style={styles.addText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={savings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucune épargne enregistrée pour le moment.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.meta}>
  Épargne · {item.date}
  {item.destination
    ? " · " + getDestinationLabel(item.destination)
    : ""}
</Text>

            </View>
            <View style={styles.rightCol}>
              <Text style={styles.amount}>
                +{item.amount.toLocaleString()} FCFA
              </Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("AddSaving", {
                      transactionId: item.id,
                    })
                  }
                >
                  <Text style={styles.actionEdit}>Modifier</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text style={styles.actionDelete}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />
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
  addText: {
    color: "#22c55e",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  label: {
    color: "#f9fafb",
    fontSize: 14,
  },
  meta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  rightCol: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  amount: {
    color: "#4ade80",
    fontSize: 14,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  actionEdit: {
    color: "#60a5fa",
    fontSize: 12,
  },
  actionDelete: {
    color: "#f97316",
    fontSize: 12,
  },
});
