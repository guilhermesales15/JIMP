import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, TextInput, Modal, StatusBar } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { AntDesign } from '@expo/vector-icons';
import estadosData from '../../../assets/estados.json';
import { API_GOOGLE, API_RAPID } from '@env';

export default function MapMenu() {
    const [location, setLocation] = useState(null); // Latitude e longitude básica
    const [userLocationDetails, setUserLocationDetails] = useState({ city: '', state: '', country: '' }); // Localização detalhada
    const [lastSearch, setLastSearch] = useState({ locationDetails: null, jobTitle: '' });
    const [isUsingUserLocation, setIsUsingUserLocation] = useState(true); // Inicialmente, usando localização do usuário
    const [selectedEstado, setSelectedEstado] = useState('');
    const [selectedCidade, setSelectedCidade] = useState('');
    const [estados, setEstados] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const mapRef = useRef(null);
    const googleMapsApiKey = 'AIzaSyDkVobiQ84X3iu5f65CWYHODVHYllcJbFk';


    useEffect(() => {
        setEstados(estadosData.estados);
    }, []);

    useEffect(() => {
        const estadoSelecionado = estados.find((estado) => estado.sigla === selectedEstado);
        setCidades(estadoSelecionado ? estadoSelecionado.cidades : []);
        setSelectedCidade('');
    }, [selectedEstado]);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permissão negada', 'Permissão para acessar localização foi negada.');
                return;
            }

            let userLocation = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });

            // Obtém a localização detalhada e armazena em `userLocationDetails`
            const locationDetails = await getCityStateCountry(
                userLocation.coords.latitude,
                userLocation.coords.longitude
            );
            setUserLocationDetails(locationDetails);
            console.log("Localização detalhada do usuário:", locationDetails);

            // Chama `fetchRemoteJobs` com os detalhes da localização do usuário
            if (locationDetails.city && locationDetails.state && locationDetails.country) {
                await fetchRemoteJobs(locationDetails, searchTerm);
            }
        })();
    }, []);


    const useUserLocation = async () => {
        setIsUsingUserLocation(true);

        // Solicita a geolocalização atual do dispositivo
        try {
            const userLocation = await Location.getCurrentPositionAsync({});
            const updatedLocation = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setLocation(updatedLocation); // Atualiza o estado de `location` com a localização atual
            console.log("Localização atualizada para:", updatedLocation);

            // Obtem detalhes da cidade, estado e país com base na nova localização
            const locationDetails = await getCityStateCountry(
                updatedLocation.latitude,
                updatedLocation.longitude
            );
            setUserLocationDetails(locationDetails);
            setSelectedCidade(locationDetails.city);
            setSelectedEstado(locationDetails.state);
            console.log("Detalhes da localização atualizados para:", locationDetails);

            // Recentraliza o mapa e executa a busca de empregos com a nova localização
            if (mapRef.current) {
                mapRef.current.animateToRegion(updatedLocation, 1000);
            }

            // Força um reset em `lastSearch` para garantir nova requisição
            setLastSearch({ locationDetails: null, jobTitle: '' });

            // Fecha o modal
            setModalVisible(false);

            // Executa `fetchRemoteJobs` com a nova localização detalhada
            console.log("Chamando fetchRemoteJobs com:", locationDetails, searchTerm);
            await fetchRemoteJobs(locationDetails, searchTerm);

        } catch (error) {
            console.log("Erro ao obter a localização do dispositivo:", error);
            Alert.alert("Erro", "Não foi possível obter sua localização. Verifique as permissões.");
        }
    };


    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const renderCustomMarker = (job) => {
        const markerSize = 40; // Tamanho do marcador

        // Verifica se o emprego possui um logotipo
        if (job.employer_logo) {
            return (
                <View style={[styles.markerContainer, { width: markerSize, height: markerSize }]}>
                    <Image
                        source={{ uri: job.employer_logo }}
                        style={[styles.markerImage, { width: markerSize, height: markerSize }]}
                        resizeMode="contain"
                    />
                </View>
            );
        } else {
            // Usa a inicial do nome da empresa como fallback
            const initial = job.employer_name ? job.employer_name.charAt(0).toUpperCase() : 'E';
            return (
                <View style={[styles.markerContainer, { width: markerSize, height: markerSize }]}>
                    <Text style={[styles.markerText, { fontSize: markerSize / 2 }]}>{initial}</Text>
                </View>
            );
        }
    };

    const renderJobDetailPanel = (job) => {
        if (!job) return null; // Verifica se um trabalho está selecionado

        return (
            <View style={styles.bottomPanel}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedJob(null)}>
                    <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
                
                {/* Logotipo ou inicial da empresa */}
                <View style={styles.jobImage}>{renderCustomMarker(job)}</View>

                <Text style={styles.jobTitle}>{job.job_title}</Text>
                <Text style={styles.jobCompany}>
                    {job.employer_name} - {job.job_city}, {job.job_state}
                </Text>

                {/* Descrição com opção de expandir */}
                <ScrollView style={styles.descriptionContainer} nestedScrollEnabled={true}>
                    <Text style={styles.jobDescription}>
                        {showFullDescription ? job.job_description : `${job.job_description.slice(0, 150)}...`}
                    </Text>
                    {job.job_description.length > 150 && (
                        <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                            <Text style={styles.showMoreText}>
                                {showFullDescription ? 'Ver menos' : 'Ver mais'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>

                {/* Botão para candidatura */}
                <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => Linking.openURL(job.job_apply_link)}
                >
                    <Text style={styles.applyButtonText}>Candidatar-se</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const getCityStateCountry = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            console.log("Resposta da API de localização:", data);

            return {
                city: data.address.city || data.address.town || data.address.village || 'local',
                state: data.address.state || 'desconhecido',
                country: data.address.country || 'desconhecido',
            };
        } catch (error) {
            console.log('Erro ao obter dados de localização reversa:', error);
            return { city: 'local', state: '', country: '' };
        }
    };

    const fetchRemoteJobs = async (locationDetails, jobTitle = '') => {
        setLoading(true); // Define loading para true no início
        console.log("fetchRemoteJobs chamado com:", locationDetails, jobTitle);

        // Armazena a nova pesquisa como a última
        setLastSearch({ locationDetails, jobTitle });

        const { city, state, country } = locationDetails;
        const query = `${jobTitle} in ${city}, ${state}, ${country}`;
        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=10&date_posted=all&remote_jobs_only=false`;

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '96d34f201bmshc1bbb7b179a33a2p15f48ejsnd5d8127d4eee',
                'x-rapidapi-host': 'jsearch.p.rapidapi.com'
            }
        };

        try {
            const response = await fetch(url, options);
            const result = await response.json();

            const jobsWithCoordinates = await Promise.all(
                result.data.map(async job => {
                    const coordinates = await getCoordinatesFromGoogleMaps(job.job_city, job.job_state, job.employer_name);
                    return coordinates ? { ...job, coordinates } : null;
                })
            );

            const validJobs = jobsWithCoordinates.filter(job => job);
            setJobs(validJobs);
            setLoading(false);

        } catch (error) {
            console.log('Erro ao buscar empregos remotos:', error);
            Alert.alert('Erro', 'Erro ao buscar empregos remotos. Verifique a chave da API e tente novamente.');
            setLoading(false);
        }
    };

    const getCoordinatesFromGoogleMaps = async (city, state, companyName = "") => {
        const query = `${companyName ? `${companyName}, ` : ''}${city}, ${state}`;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${googleMapsApiKey}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const location = data.results[0].geometry.location;
                return { latitude: location.lat, longitude: location.lng };
            } else {
                console.log('Erro na API do Google Maps. Status:', data.status);
                return null;
            }
        } catch (error) {
            console.log('Erro ao buscar coordenadas no Google Maps:', error);
            return null;
        }
    };

    const handleCenterOnUser = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion(location, 1000);
        }
    };

    const handleSearch = async () => {
        if (userLocationDetails.city && userLocationDetails.state && userLocationDetails.country) {
            await fetchRemoteJobs(userLocationDetails, searchTerm);
        } else {
            Alert.alert('Erro', 'Não foi possível obter as informações detalhadas de localização.');
        }
    };

    const updateUserLocationDetails = () => {
        const updatedDetails = {
            city: selectedCidade,
            state: selectedEstado,
            country: userLocationDetails.country,
        };

        setUserLocationDetails(updatedDetails);
        setIsUsingUserLocation(false); // Desativa o uso da localização do usuário
        toggleModal();

        // Recentraliza o mapa para a nova cidade e realiza a busca
        recentralizeMapToCity(selectedCidade, selectedEstado);
        fetchRemoteJobs(updatedDetails, searchTerm);
    };


    const recentralizeMapToCity = async (city, state) => {
        try {
            const coordinates = await getCoordinatesFromGoogleMaps(city, state);
            if (coordinates && mapRef.current) {
                mapRef.current.animateToRegion({
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude,
                    latitudeDelta: 0.05, // Zoom de acordo com o nível desejado
                    longitudeDelta: 0.05,
                }, 1000);
                console.log("Mapa recentralizado para:", coordinates);
            }
        } catch (error) {
            console.log("Erro ao recentralizar o mapa:", error);
        }
    };

    return (
        <View style={styles.container}>
            {location ? (
                <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={location}
                >
                    {jobs.map((job, index) => (
                        job.coordinates ? (
                            <Marker
                                key={index}
                                coordinate={{
                                    latitude: job.coordinates.latitude,
                                    longitude: job.coordinates.longitude,
                                }}
                                title={job.job_title}
                                description={`${job.employer_name || 'Empresa não informada'} - ${job.job_city}, ${job.job_state}`}
                                onPress={() => {
                                    setSelectedJob(job);
                                    mapRef.current.animateToRegion({
                                        latitude: job.coordinates.latitude,
                                        longitude: job.coordinates.longitude,
                                        latitudeDelta: 0.01,
                                        longitudeDelta: 0.01,
                                    }, 1000);
                                }}
                            >
                                {renderCustomMarker(job)}
                            </Marker>
                        ) : null
                    ))}

                    {location && (
                        <Marker coordinate={location}>
                            <View style={styles.userLocationMarker} />
                        </Marker>
                    )}
                </MapView>
            ) : (
                <ActivityIndicator size="large" color="#0000ff" />
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Carregando empregos remotos...</Text>
                </View>
            )}

                <TouchableOpacity style={styles.centerButton} onPress={useUserLocation}>
                    <Text style={styles.centerButtonText}>📍</Text>
                </TouchableOpacity>

          <View style={styles.searchBlock}>
              <View style={styles.searchContainer}>
                  <TextInput
                      value={searchTerm}
                      onChangeText={(text) => setSearchTerm(text)}
                      onSubmitEditing={handleSearch} // Chama a pesquisa ao pressionar Enter
                      keyboardType="text"
                      style={styles.input}
                      placeholder="Pesquisar..."
                      placeholderTextColor="rgba(0, 0, 0, 0.7)"
                  />
                  <TouchableOpacity onPress={handleSearch} style={styles.icon}>
                      <AntDesign name="search1" size={24} color="black" />
                  </TouchableOpacity>
                  <View style={styles.separator} />
                  <TouchableOpacity onPress={toggleModal} style={styles.filterButton}>
                      <AntDesign name="filter" size={24} color="black" />
                  </TouchableOpacity>
              </View>

              {/* Exibe estado e cidade com o ícone de localização */}
              {(isUsingUserLocation && userLocationDetails.state && userLocationDetails.city) || (selectedEstado && selectedCidade) ? (
                <>
                  <View style={styles.horizontalSeparator} />
                  <TouchableOpacity onPress={toggleModal} style={styles.selectedLocation}>
                    <AntDesign name="enviromento" size={16} color="black" style={styles.locationIcon} />
                    <Text style={styles.locationText}>
                      {isUsingUserLocation ? `${userLocationDetails.city}, ${userLocationDetails.state}` : `${selectedCidade}, ${selectedEstado}`}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : null}

          </View>                

            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={toggleModal}
            >
              <View style={styles.modalContainer}>

                <TouchableOpacity style={styles.closeButtonX} onPress={toggleModal}>
                    <Text style={styles.closeButtonTextX}>X</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Filtros</Text>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Estado</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedEstado}
                      onValueChange={(itemValue) => setSelectedEstado(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Selecione um estado" value="" />
                      {estados.map((estado) => (
                        <Picker.Item key={estado.sigla} label={`${estado.nome} - ${estado.sigla}`} value={estado.sigla} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Cidade</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedCidade}
                      onValueChange={(itemValue) => setSelectedCidade(itemValue)}
                      style={styles.picker}
                      enabled={cidades.length > 0}
                    >
                      <Picker.Item label="Selecione uma cidade" value="" />
                      {cidades.map((cidade, index) => (
                        <Picker.Item key={index} label={cidade} value={cidade} />
                      ))}
                    </Picker>
                  </View>
                </View>

                {!isUsingUserLocation && (
                    <TouchableOpacity onPress={useUserLocation} style={styles.useLocationButton}>
                        <Text style={styles.useLocationButtonText}>Usar minha localização</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={updateUserLocationDetails} style={styles.closeButtonModal}>
                  <Text style={styles.closeButtonTextModal}>Filtrar</Text>
                </TouchableOpacity>
                
              </View>
            </Modal>
            {selectedJob && renderJobDetailPanel(selectedJob)}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: StatusBar.currentHeight
    },
    map: { flex: 1 },
    markerContainer: {
        backgroundColor: '#2BB490',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    markerImage: { width: '100%', height: '100%', borderRadius: 20 },
    markerText: { color: 'white', fontWeight: 'bold' },
    userLocationMarker: {width: 18, height: 18, backgroundColor: 'blue', borderRadius: 9, borderWidth: 3, borderColor: 'white'},
    centerButton: { position: 'absolute', bottom: 50, right: 20, backgroundColor: 'white', padding: 10, borderRadius: 25, elevation: 5 },
    centerButtonText: { fontSize: 20 },
    bottomPanel: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 5, maxHeight: 600 },
    closeButton: { position: 'absolute', top: 30, right: 30 },
    closeButtonText: { fontSize: 20, fontWeight: 'bold' },
    jobImage: { width: 50, height: 50, borderRadius: 25, marginBottom: 10 },
    jobTitle: { fontSize: 20, fontWeight: 'bold' },
    jobCompany: { fontSize: 16, color: 'gray' },
    descriptionContainer: { maxHeight: 150 },
    jobDescription: { fontSize: 14, marginVertical: 10 },
    showMoreText: { color: '#1E90FF', fontWeight: 'bold' },
    applyButton: { backgroundColor: '#1E90FF', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    applyButtonText: { color: 'white', fontWeight: 'bold' },
    loadingContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [
            { translateX: -175 }, // Ajuste manual da posição horizontal
            { translateY: -50 },  // Ajuste manual da posição vertical
        ],
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 10,
        elevation: 5,
        zIndex: 10,
        flexDirection: 'row', // Organiza o conteúdo horizontalmente
    },

    loadingText: {
        fontSize: 16,
        marginLeft: 10, // Adiciona um espaço entre o ícone e o texto
    },
  searchBlock: {
    position: 'absolute',
    top: 90, // Posiciona o bloco no topo, respeitando o SafeAreaView
    left: 20,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 10,
  },
  icon: {
    marginLeft: 10,
  },
  separator: {
    height: 24,
    width: 1,
    backgroundColor: '#D3D3D3',
    marginHorizontal: 10,
  },
  filterButton: {
    marginLeft: 10,
  },
  horizontalSeparator: {
    height: 1,
    backgroundColor: '#D3D3D3',
    marginVertical: 10,
  },
  selectedLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  locationIcon: {
    marginRight: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalTitle: {
    fontSize: 24,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerLabel: {
    fontSize: 18,
    color: '#FFF',
    marginBottom: 5,
  },
  pickerWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  picker: {
    color: '#333',
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  closeButtonModal: {
    backgroundColor: '#2BB490',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonTextModal: {
    color: '#FFF',
    fontSize: 18,
  },
  useLocationButton: {
      backgroundColor: '#2196F3',
      padding: 10,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 15,
  },
  useLocationButtonInline: {
      marginLeft: 10,
  },
  useLocationButtonText: {
      color: '#FFF',
      fontSize: 16,
  },
  closeButtonX: {
    position: 'absolute',
    top: 50,
    right: 40,
  },
  closeButtonTextX: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});