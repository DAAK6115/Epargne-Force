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

export default function LoginScreen({ navigation }: { navigation: any }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    try {
      setSubmitting(true);
            await login(identifier, password);
    } catch (e: any) {
      Alert.alert("Connexion impossible", e.message || "Erreur inconnue.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Text style={styles.appName}>Epargne Forcé</Text>
        <Text style={styles.subtitle}>
          Connecte-toi pour voir et suivre ton épargne.
        </Text>
      </View>

      <View style={styles.card}>
                <Text style={styles.label}>Email ou pseudo</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
          placeholder="ton mail ou ton pseudo"
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
          onPress={handleLogin}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            {submitting ? "Connexion..." : "Se connecter"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.footerText}>
          Pas encore de compte ?{" "}
          <Text style={styles.footerLink}>Créer un compte</Text>
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
    fontSize: 28,
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
