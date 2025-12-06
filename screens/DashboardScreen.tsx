import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useTransactions,
  getTodayString,
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


type Props = {
  navigation: {
    navigate: (screen: string) => void;
  };
};

export default function DashboardScreen({ navigation }: Props) {
  const { transactions } = useTransactions();
  const today = getTodayString();
  const [year, month] = today.split("-");
  const monthKey = `${year}-${month}`;
  const yearKey = `${year}-`;

  const totalEpargne = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "epargne")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const depenseDuJour = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "depense" && t.date === today)
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, today]
  );

  const epargneDuJour = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "epargne" && t.date === today)
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, today]
  );

  // Résumé mensuel
  const epargneMois = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "epargne" && t.date.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, monthKey]
  );

  const depenseMois = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "depense" && t.date.startsWith(monthKey))
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, monthKey]
  );

  // Résumé annuel
  const epargneAnnee = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "epargne" && t.date.startsWith(yearKey))
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, yearKey]
  );

  const depenseAnnee = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "depense" && t.date.startsWith(yearKey))
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, yearKey]
  );

    // Total par destination (toutes périodes confondues)
  const savingsByDestination = useMemo(() => {
    const base: Record<SavingDestination, number> = {
      compte_commun: 0,
      wave: 0,
      orange_money: 0,
      mtn_money: 0,
      autre: 0,
    };

    transactions
      .filter((t) => t.type === "epargne" && t.destination)
      .forEach((t) => {
        const dest = t.destination as SavingDestination;
        base[dest] = (base[dest] || 0) + t.amount;
      });

    return base;
  }, [transactions]);


  // règle temporaire : "trop dépensé" si > 10 000 FCFA
  const aTropDepense = depenseDuJour > 10000;

  const messageDuJour = aTropDepense
    ? "Tu as trop dépensé aujourd’hui 😬"
    : epargneDuJour > 0
    ? "Bravo, vous avez épargné aujourd’hui 🎉"
    : "Pensez à mettre quelque chose de côté aujourd’hui 💡";

  const transactionsDuJour = useMemo(
    () => transactions.filter((t) => t.date === today),
    [transactions, today]
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "left", "right"]}
    >
      {/* Header custom */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.appName}>Epargne Forcé</Text>
          <Text style={styles.subtitle}>
            Compte commun avec suivi intelligent
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsChip}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.settingsText}>⚙︎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total épargné</Text>
          <Text style={styles.cardValue}>
            {totalEpargne.toLocaleString()} FCFA
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Dépenses du jour</Text>
          <Text style={styles.cardValue}>
            {depenseDuJour.toLocaleString()} FCFA
          </Text>
        </View>
      </View>

      {/* Résumé mensuel / annuel */}
      <View style={styles.summaryBox}>
  <Text style={styles.summaryTitle}>Résumé</Text>
  <Text style={styles.summaryLine}>
    Ce mois-ci :{" "}
    <Text style={styles.amountPositive}>
      +{epargneMois.toLocaleString()} FCFA
    </Text>{" "}
    ·{" "}
    <Text style={styles.amountNegative}>
      -{depenseMois.toLocaleString()} FCFA
    </Text>
  </Text>
  <Text style={styles.summaryLine}>
    Cette année :{" "}
    <Text style={styles.amountPositive}>
      +{epargneAnnee.toLocaleString()} FCFA
    </Text>{" "}
    ·{" "}
    <Text style={styles.amountNegative}>
      -{depenseAnnee.toLocaleString()} FCFA
    </Text>
  </Text>
</View>

      

      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{messageDuJour}</Text>
      </View>

     <View style={styles.actionsRow}>
  <TouchableOpacity
    style={[styles.actionButton, styles.saveButton]}
    onPress={() => navigation.navigate("ManageSavings")}
  >
    <Text style={styles.actionText}>Épargne</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[styles.actionButton, styles.spendButton]}
    onPress={() => navigation.navigate("ManageExpenses")}
  >
    <Text style={styles.actionText}>Dépenses</Text>
  </TouchableOpacity>
</View>



      <View style={styles.sectionHeaderRow}>
  <Text style={styles.sectionTitle}>Activité du jour</Text>
  <TouchableOpacity onPress={() => navigation.navigate("History")}>
    <Text style={styles.sectionLink}>Historique complet</Text>
  </TouchableOpacity>
</View>


      <FlatList
        data={transactionsDuJour}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.transactionRow}>
            <View>
              <Text style={styles.transactionLabel}>{item.label}</Text>
              <Text style={styles.transactionMeta}>
  {item.type === "epargne" ? "Épargne" : "Dépense"}
  {item.type === "epargne" && item.destination
    ? " · " + getDestinationLabel(item.destination)
    : ""}
</Text>


            </View>
            <Text
              style={[
                styles.transactionAmount,
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
  destSummaryRow: {
    marginTop: 4,
  },
  destSummaryItem: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },

  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  settingsChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  settingsText: {
    color: "#e5e7eb",
    fontSize: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  cardValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
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
  messageBox: {
    backgroundColor: "#1f2937",
    padding: 12,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#374151",
  },
  messageText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#16a34a",
  },
  spendButton: {
    backgroundColor: "#dc2626",
  },
  actionText: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 14,
  },

  sectionHeaderRow: {
    marginTop: 4,
    marginBottom: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLink: {
    fontSize: 12,
    color: "#60a5fa",
  },

  sectionTitle: {
    marginTop: 4,
    marginBottom: 6,
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  listContent: {
    paddingBottom: 24,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  transactionLabel: {
    color: "#f9fafb",
    fontSize: 14,
  },
  transactionMeta: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  amountPositive: {
    color: "#4ade80",
  },
  amountNegative: {
    color: "#f87171",
  },
});
