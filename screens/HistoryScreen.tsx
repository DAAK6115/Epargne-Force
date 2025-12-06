import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTransactions,
  Transaction,
  TransactionType,
  SavingDestination,
} from "../context/TransactionsContext";

type TypeFilter = "all" | TransactionType;

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

type Section = {
  title: string; // date
  data: Transaction[];
};

export default function HistoryScreen({ navigation }: { navigation: any }) {
  const { transactions } = useTransactions();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;
      return true;
    });
  }, [transactions, typeFilter]);

  const sections: Section[] = useMemo(() => {
    const map = new Map<string, Transaction[]>();

    filtered.forEach((t) => {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    });

    const dates = Array.from(map.keys()).sort((a, b) =>
      b.localeCompare(a)
    );

    return dates.map((date) => ({
      title: date,
      data: (map.get(date) ?? []).sort((a, b) =>
        b.id.localeCompare(a.id)
      ),
    }));
  }, [filtered]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historique complet</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.filterTitle}>Filtrer par type</Text>
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[
            styles.chip,
            typeFilter === "all" && styles.chipActive,
          ]}
          onPress={() => setTypeFilter("all")}
        >
          <Text
            style={[
              styles.chipText,
              typeFilter === "all" && styles.chipTextActive,
            ]}
          >
            Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            typeFilter === "epargne" && styles.chipActive,
          ]}
          onPress={() => setTypeFilter("epargne")}
        >
          <Text
            style={[
              styles.chipText,
              typeFilter === "epargne" && styles.chipTextActive,
            ]}
          >
            Épargnes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.chip,
            typeFilter === "depense" && styles.chipActive,
          ]}
          onPress={() => setTypeFilter("depense")}
        >
          <Text
            style={[
              styles.chipText,
              typeFilter === "depense" && styles.chipTextActive,
            ]}
          >
            Dépenses
          </Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aucune transaction pour ces filtres.
          </Text>
        }
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.meta}>
                {item.type === "epargne" ? "Épargne" : "Dépense"}
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
  filterTitle: {
    marginTop: 8,
    marginBottom: 4,
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "500",
  },
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    alignItems: "center",
  },
  chipActive: {
    backgroundColor: "#111827",
    borderColor: "#22c55e",
  },
  chipText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
    marginTop: 8,
  },
  sectionHeader: {
    backgroundColor: "#020617",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 12,
    marginBottom: 4,
  },
  sectionHeaderText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "500",
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
