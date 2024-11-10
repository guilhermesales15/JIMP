import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import Logo from "../../../assets/Logo.png";
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';

export default function Login() {
  const navigation = useNavigation();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        Alert.alert("Sucesso", "Login realizado com sucesso!");
        navigation.navigate('MapMenu'); 
      })
      .catch(error => {
        if (error.code === "auth/user-not-found") {
          Alert.alert("Erro", "Usuário não encontrado");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert("Erro", "Email inválido");
        } else if (error.code === "auth/wrong-password") {
          Alert.alert("Erro", "Senha incorreta");
        } else if (error.code === "auth/invalid-credential") {
          Alert.alert("Erro", "Credenciais inválidas. Verifique o email e a senha.");
        } else {
          Alert.alert("Erro", error.message);
        }
      });
  }

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return <Text>Carregando fontes...</Text>;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Image source={Logo} style={styles.logo} />
      <Text style={styles.subtitulo}>Descubra vagas de emprego pertinho de você</Text>
      
      <TextInput
        keyboardType="email-address"
        style={styles.input}
        placeholder="Insira o seu email"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="rgba(166, 166, 166, 1)"
      />
      <TextInput
        style={styles.input}
        placeholder="Insira a sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="rgba(166, 166, 166, 1)"
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text
          style={styles.cadastroTxt}
          onPress={() => navigation.navigate('SignUp')}
        >
          Não possui uma conta? Clique aqui e cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginBottom: 10,
  },
  subtitulo: {
    color: "#279D7E",
    fontSize: 15,
    marginBottom: 50,
    marginTop: 20,
    fontFamily: 'Poppins_700Bold',
  },
  input: {
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000000',
    color: "#000000",
    fontWeight: "bold",
    width: 350,
  },
  button: {
    padding: 20,
    backgroundColor: '#2BB490',
    width: 250,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 50,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "bold"
  },
  cadastroTxt: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
  }
});
