import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";

export default function ProfileScreen({ navigation }: { navigation: any }) {
  const { user, logout, myShareCode, acceptShareCode, viewableUsers } =
    useAuth();
  const [codeInput, setCodeInput] = useState("");

  if (!user) {
    return null;
  }

  async function handleAccept() {
    try {
      await acceptShareCode(codeInput);
      Alert.alert(
        "C'est fait",
        "Cette personne pourra voir tes activités (sur cet appareil)."
      );
      setCodeInput("");
    } catch (e: any) {
      Alert.alert("Impossible", e.message || "Erreur inconnue.");
    }
  }

  async function handleLogout() {
    await logout();
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mon profil</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nom</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Pseudo</Text>
        <Text style={styles.value}>{user.pseudo}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Partager mes activités</Text>
        <Text style={styles.cardText}>
          Envoie ce code à la personne qui veut suivre ton activité. Elle pourra
          le coller dans son app (sur ce téléphone) et accepter.
        </Text>
        <Text style={styles.shareCode}>
          {myShareCode ?? "Connecte-toi pour obtenir un code"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>J'ai reçu un code</Text>
        <Text style={styles.cardText}>
          Colle ici le code que tu as reçu (par ex. de ton partenaire) pour
          l’autoriser à voir tes activités.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Ex : REQ:123456..."
          placeholderTextColor="#6b7280"
          value={codeInput}
          onChangeText={setCodeInput}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
          <Text style={styles.acceptText}>Accepter cette demande</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          Personnes qui partagent leurs activités avec moi
        </Text>
        {viewableUsers.length === 0 ? (
          <Text style={styles.cardText}>
            Personne ne t’a encore donné accès à ses activités sur cet appareil.
          </Text>
        ) : (
          viewableUsers.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={styles.sharedRow}
              onPress={() =>
                navigation.navigate("SharedActivity", {
                  userId: u.id,
                  userName: u.pseudo || u.name,
                })
              }
            >
              <Text style={styles.sharedName}>
                {u.name} ({u.pseudo})
              </Text>
              <Text style={styles.sharedChevron}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
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
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
  },
  label: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 4,
  },
  value: {
    color: "#f9fafb",
    fontSize: 14,
    marginTop: 2,
  },
  cardTitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardText: {
    color: "#9ca3af",
    fontSize: 12,
    marginBottom: 8,
  },
  shareCode: {
    color: "#60a5fa",
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 14,
    backgroundColor: "#020617",
  },
  acceptButton: {
    marginTop: 10,
    backgroundColor: "#22c55e",
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: "center",
  },
  acceptText: {
    color: "#0f172a",
    fontWeight: "600",
    fontSize: 13,
  },
  sharedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
  },
  sharedName: {
    color: "#f9fafb",
    fontSize: 14,
  },
  sharedChevron: {
    color: "#6b7280",
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: "#ef4444",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  logoutText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },
});
