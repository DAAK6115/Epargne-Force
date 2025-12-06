import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  loadTransactionsForUser,
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

export default function SharedActivityScreen({
  navigation,
  route,
}: {
  navigation: any;
  route: any;
}) {
  const { userId, userName } = route.params || {};
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadTransactionsForUser(userId);
      setTransactions(data);
      setLoading(false);
    })();
  }, [userId]);

  const totalEpargne = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "epargne")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalDepense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "depense")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Activité de {userName}</Text>
        </View>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <Text style={styles.backText} onPress={() => navigation.goBack()}>
          ◀
        </Text>
        <Text style={styles.title}>Activité de {userName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Résumé global</Text>
        <Text style={styles.summaryLine}>
          Épargne totale :{" "}
          <Text style={styles.amountPositive}>
            +{totalEpargne.toLocaleString()} FCFA
          </Text>
        </Text>
        <Text style={styles.summaryLine}>
          Dépenses totales :{" "}
          <Text style={styles.amountNegative}>
            -{totalDepense.toLocaleString()} FCFA
          </Text>
        </Text>
      </View>

      <FlatList
        data={[...transactions].sort(
          (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aucune activité pour l’instant.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.meta}>
                {item.type === "epargne" ? "Épargne" : "Dépense"} · {item.date}
                {item.type === "epargne" && item.destination
                  ? " · " + getDestinationLabel(item.destination)
                  : ""}
              </Text>
            </View>
            <Text
              style={[
                styles.amount,
                item.type === "epargne"
                  ? styles.amountPositive
                  : styles.amountNegative,
              ]}
            >
              {item.type === "epargne" ? "+" : "-"}
              {item.amount.toLocaleString()} FCFA
            </Text>
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
  summaryBox: {
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 12,
  },
  summaryTitle: {
    color: "#e5e7eb",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  summaryLine: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountPositive: {
    color: "#4ade80",
  },
  amountNegative: {
    color: "#f87171",
  },
  emptyText: {
    marginTop: 24,
    textAlign: "center",
    color: "#6b7280",
    fontSize: 13,
  },
});
