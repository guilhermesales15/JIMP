
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Image, TouchableOpacity } from 'react-native';
import Logo from "../../../assets/Logo.png"
import { Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';



export default function SignUp() {

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
      <Image source={Logo} />
      <Text style={styles.subtitulo}> Descubra vagas de emprego pertinho de você</Text>
      
      <TextInput keyboardType='email-address' style={styles.input} placeholder ='Insira o seu nome'  placeholderTextColor=" rgba(rgba(166, 166, 166, 1)" />
      <TextInput keyboardType='email-address' style={styles.input} placeholder ='Insira o seu email'  placeholderTextColor=" rgba(rgba(166, 166, 166, 1)" />
      <TextInput keyboardType='text' style={styles.input} placeholder ='Insira o sua senha' secureTextEntry={true} placeholderTextColor=" rgba(rgba(166, 166, 166, 1)" />

      <TouchableOpacity style={styles.buttom}> 
        <Text style={styles.buttomText}>Cadastre-se</Text>
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

  subtitulo:{
    color:"#279D7E",
    fontSize: 15,
    marginBottom:50,
    marginTop:20,
    fontFamily: 'Poppins_700Bold', 
  },
  input:{
    padding:8,
    marginBottom:10,
    borderRadius:6,
    borderWidth: 2,
    borderColor: '#000000', 
    color:"#000000",
    fontWeight: "bold",
    width:350,
  },

  logo:{
    marginBottom:10,
  },
  buttom:{
    padding:20,
    backgroundColor:'#2BB490',
    width:250,
    borderRadius:15,
    alignItems:"center",
    marginTop:10,
    marginBottom:50,
  },

  buttomText:{
    color:"#ffffff",
    fontWeight: "bold"
  },
});
