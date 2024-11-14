import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity, Alert } from 'react-native';
import Logo from "../../../assets/Logo.png"; // ajuste o caminho conforme necessário
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig'; 
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  function makeSignUp() {
    createUserWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        console.log('Usuário criado:', userCredential);
        Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
        navigation.navigate('MapMenu'); 
      })
      .catch(error => {
        if (error.code === "auth/email-already-in-use") {
          Alert.alert("Erro", "Email já cadastrado");
        } else if (error.code === "auth/invalid-email") {
          Alert.alert("Erro", "Email inválido");
        } else if (error.code === "auth/weak-password") {
          Alert.alert("Erro", "Senha muito fraca");
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

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="#2BB490" />
      </TouchableOpacity>

      <Image source={Logo} style={styles.logo} />
      <Text style={styles.subtitulo}>Preencha seus dados abaixo:</Text>
      
      <TextInput
        keyboardType="email-address"
        placeholder="Insira o seu email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor="rgba(166, 166, 166, 1)"
      />
      <TextInput
        placeholder="Insira a sua senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        placeholderTextColor="rgba(166, 166, 166, 1)"
      />

      <TouchableOpacity onPress={makeSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Cadastre-se</Text>
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
    fontWeight: "bold",
  },

  backButton: {
    position: 'absolute',
    top: 50, // ajuste conforme necessário
    left: 20,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
