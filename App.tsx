import React, { useEffect } from "react";
import { Alert, Platform, View, ActivityIndicator, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";

import DashboardScreen from "./screens/DashboardScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AddExpenseScreen from "./screens/AddExpenseScreen";
import AddSavingScreen from "./screens/AddSavingScreen";
import HistoryScreen from "./screens/HistoryScreen";
import ManageExpensesScreen from "./screens/ManageExpensesScreen";
import ManageSavingsScreen from "./screens/ManageSavingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SharedActivityScreen from "./screens/SharedActivityScreen";

import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";

import { TransactionsProvider } from "./context/TransactionsContext";
import { AuthProvider, useAuth } from "./auth/AuthContext";

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function askNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert(
      "Notifications désactivées",
      "Tu peux les réactiver dans les réglages de ton iPhone pour profiter des rappels."
    );
  }

  if (Platform.OS === "ios") {
    await Notifications.setNotificationCategoryAsync("default", []);
  }
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
        <Text style={{ color: "#e5e7eb", marginTop: 8 }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          {/* App connectée */}
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="AddSaving" component={AddSavingScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="ManageExpenses" component={ManageExpensesScreen} />
          <Stack.Screen name="ManageSavings" component={ManageSavingsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen
            name="SharedActivity"
            component={SharedActivityScreen}
          />
        </>
      ) : (
        <>
          {/* Auth */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    askNotificationPermission();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <TransactionsProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </TransactionsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
