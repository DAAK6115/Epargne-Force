import React, { useState } from "react";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../auth/AuthContext";

export default function SignupScreen({ navigation }: { navigation: any }) {
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSignup() {
    try {
      setSubmitting(true);
            await signup(name, email, pseudo, password);
      // une fois inscrit, on est connecté automatiquement
    } catch (e: any) {
      Alert.alert("Inscription impossible", e.message || "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.appName}>Créer un compte</Text>
        <Text style={styles.subtitle}>
          Un compte par personne, pour suivre ton propre argent.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ton prénom ou pseudo"
          placeholderTextColor="#6b7280"
        />
        <Text style={styles.label}>Pseudo</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={pseudo}
          onChangeText={setPseudo}
          placeholder="Nom d’utilisateur (unique)"
          placeholderTextColor="#6b7280"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="ton.email@example.com"
          placeholderTextColor="#6b7280"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#6b7280"
        />

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.7 }]}
          onPress={handleSignup}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Création..." : "Créer mon compte"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.footerText}>
          Tu as déjà un compte ?{" "}
          <Text style={styles.footerLink}>Se connecter</Text>
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
    paddingTop: 12,
  },
  header: {
    marginBottom: 32,
    marginTop: 24,
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: "#9ca3af",
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    marginTop: 8,
  },
  input: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#f9fafb",
    fontSize: 14,
    backgroundColor: "#020617",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#22c55e",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 14,
  },
  footerText: {
    marginTop: 16,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
  },
  footerLink: {
    color: "#60a5fa",
    fontWeight: "600",
  },
});
