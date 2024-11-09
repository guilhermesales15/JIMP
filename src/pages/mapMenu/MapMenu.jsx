import { StyleSheet, Text, View, TextInput, ActivityIndicator } from 'react-native'; 
import { requestForegroundPermissionsAsync, getCurrentPositionAsync } from 'expo-location';
import { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function MapMenu() {
  const [location, setLocation] = useState(null);
  const [estados, setEstados] = useState([]);
  const [selectedEstado, setSelectedEstado] = useState("");

  // Função para obter a permissão de localização
  async function requestLocationPermissions() {
    const { granted } = await requestForegroundPermissionsAsync();
    if (granted) {
      const currentPosition = await getCurrentPositionAsync();
      setLocation(currentPosition);
    }
  }

  // Função para buscar estados na API do IBGE usando axios
  async function fetchEstados() {
    try {
      const response = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      setEstados(response.data);
    } catch (error) {
      console.error("Erro ao buscar estados: ", error);
    }
  }

  useEffect(() => {
    requestLocationPermissions();
    fetchEstados();
  }, []);

  return (
    <View style={styles.container}>
      {/* Verificando se a localização foi carregada */}
      {location ? (
        // Mapa ocupa a tela inteira
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        </MapView>
      ) : (
        // Mostra um indicador de carregamento enquanto a localização não é definida
        <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />
      )}

      {/* TextInput e Picker flutuando no topo */}
      <View style={styles.overlay}>
        {/* Input de localização com ícone de pesquisa */}
        <View style={styles.inputContainer}>
          <TextInput
            keyboardType="text"
            style={styles.input}
            placeholder="Insira uma localização"
            placeholderTextColor="rgba(0, 0, 0, 0.7)" // Cor preta para o placeholder
          />
          <AntDesign name="search1" size={24} color="black" style={styles.icon} />
        </View>

        {/* Picker para selecionar o estado */}
        <Picker
          selectedValue={selectedEstado}
          onValueChange={(itemValue) => setSelectedEstado(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Selecione um estado" value="" />
          {estados.map((estado) => (
            <Picker.Item key={estado.id} label={`${estado.nome} - ${estado.sigla}`} value={estado.sigla} />
          ))}
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  map: {
    flex: 1, // O mapa ocupa toda a tela
    width: '100%',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  overlay: {
    position: 'absolute',
    top: 50, // Ajuste a distância do topo conforme necessário
    left: 20,
    right: 20,
    zIndex: 2, // Aumentando o zIndex para garantir que o overlay esteja sobre o mapa
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12, // Maior padding horizontal
    paddingVertical: 10, // Ajustando o padding vertical
    marginBottom: 10,
    width: '100%',
    opacity: 0.93, // Opacidade de 93%
    backgroundColor: '#FAFAFA', // Cor de fundo do TextInput
    zIndex: 3, // Garantindo que o TextInput fique acima do mapa
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    color: "#000000", // Cor do texto do input
    fontWeight: "bold",
    backgroundColor: '#FAFAFA', // Cor de fundo do TextInput
    height: 40, // Altura ajustada para dar mais espaço ao texto
    paddingHorizontal: 10, // Maior padding horizontal para o texto não ficar "colado" nas bordas
  },
  picker: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 10,
    color: "#000000",
    fontWeight: "bold",
    opacity: 0.93, // Opacidade de 93%
    backgroundColor: '#FAFAFA', // Cor de fundo do Picker
    height: 50, // Garantindo altura adequada para o picker
  },
});
