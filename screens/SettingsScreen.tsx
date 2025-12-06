import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

type ReminderFrequency = "weekly" | "biweekly";

export default function SettingsScreen({ navigation }: { navigation: any }) {
  const [frequency, setFrequency] = useState<ReminderFrequency>("weekly");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function scheduleReminders() {
    try {
      setSaving(true);
      setFeedback("");

      // on annule tous les anciens rappels
      await Notifications.cancelAllScheduledNotificationsAsync();

      // 1) Rappel QUOTIDIEN (ex: 21h)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Résumé de ta journée",
          body:
            "Ouvre Epargne Forcé pour voir ce que vous avez dépensé et épargné aujourd'hui.",
        },
        trigger: {
          hour: 21,
          minute: 0,
          repeats: true,
        } as any,
      });

      // 2) Rappel hebdo / toutes les 2 semaines
      const secondsInDay = 24 * 60 * 60;
      const periodDays = frequency === "weekly" ? 7 : 14;

      await Notifications.scheduleNotificationAsync({
        content: {
          title:
            frequency === "weekly"
              ? "Rappel épargne (chaque semaine)"
              : "Rappel épargne (toutes les 2 semaines)",
          body: "Pensez à mettre quelque chose dans votre compte commun aujourd'hui 💰",
        },
        trigger: {
          seconds: secondsInDay * periodDays,
          repeats: true,
        } as any,
      });

      setFeedback("Rappels mis à jour ✔");
    } catch (e) {
      console.log(e);
      Alert.alert("Erreur", "Impossible de configurer les notifications.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres de rappel</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.sectionTitle}>Rappel quotidien</Text>
      <Text style={styles.helperText}>
        Un rappel tous les jours vers 21h pour te montrer ce que vous avez
        dépensé et épargné.
      </Text>

      <View style={styles.divider} />
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => navigation.navigate("Profile")}
      >
        <Text style={styles.profileButtonText}>Voir mon profil</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Rappel d’épargne</Text>
      <Text style={styles.helperText}>
        Choisis la fréquence pour te pousser à épargner dans le compte commun.
      </Text>

      <View style={styles.frequencyRow}>
        <TouchableOpacity
          style={[
            styles.frequencyChip,
            frequency === "weekly" && styles.frequencyChipActive,
          ]}
          onPress={() => setFrequency("weekly")}
        >
          <Text
            style={[
              styles.frequencyText,
              frequency === "weekly" && styles.frequencyTextActive,
            ]}
          >
            Chaque semaine
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.frequencyChip,
            frequency === "biweekly" && styles.frequencyChipActive,
          ]}
          onPress={() => setFrequency("biweekly")}
        >
          <Text
            style={[
              styles.frequencyText,
              frequency === "biweekly" && styles.frequencyTextActive,
            ]}
          >
            Toutes les 2 semaines
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={scheduleReminders}
        disabled={saving}
      >
        <Text style={styles.saveText}>
          {saving ? "Enregistrement..." : "Enregistrer les rappels"}
        </Text>
      </TouchableOpacity>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          ℹ️ Pour que les notifications fonctionnent, accepte la demande
          d’autorisation quand l’app te la propose.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    profileButton: {
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    alignSelf: "flex-start",
    backgroundColor: "#111827",
  },
  profileButtonText: {
    color: "#e5e7eb",
    fontSize: 13,
  },

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
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  helperText: {
    marginTop: 4,
    fontSize: 13,
    color: "#9ca3af",
  },
  divider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 16,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    marginBottom: 24,
  },
  frequencyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
  },
  frequencyChipActive: {
    backgroundColor: "#111827",
    borderColor: "#4ade80",
  },
  frequencyText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  frequencyTextActive: {
    color: "#e5e7eb",
    fontWeight: "600",
  },
  saveButton: {
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
  feedback: {
    marginTop: 10,
    color: "#4ade80",
    fontSize: 13,
  },
  infoBox: {
    marginTop: 20,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  infoText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});
