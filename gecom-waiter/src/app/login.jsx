import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import axios from "axios";
import styles from "../assets/css/styles";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post("http://localhost:3001/api/login", {
        username,
        password,
      });

      if (response.data.success) {
        onLogin(response.data.user);
      } else {
        setErrorMessage(response.data.message || "Credenciais inválidas.");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Usuário ou senha incorretos.");
      } else {
        setErrorMessage("Não foi possível conectar ao servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.loginContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.loginContent}>
        <Text style={styles.loginTitle}>GECOM</Text>
        <Text style={styles.loginSubtitle}>Área do Garçom</Text>

        <View style={styles.loginForm}>
          {errorMessage !== "" && (
            <Text style={{ color: "red", marginTop: 10, fontSize: 16 }}>
              {errorMessage}
            </Text>
          )}

          <TextInput
            style={styles.loginInput}
            placeholder="Usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.loginInput}
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        
      </View>
    </SafeAreaView>
  );
};

export default Login;
