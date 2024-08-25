import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import Svg, { Path } from 'react-native-svg';
import { db } from '@/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

// Tipos
type PetData = {
  name: string;
  Age: number;
  bread: string;
  phone: string;
  direction: string;
};

// Componentes de iconos
const SearchIcon: React.FC = React.memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24.032 24.032">
    <Path d="M23.707,22.293l-5.969-5.969a10.016,10.016,0,1,0-1.414,1.414l5.969,5.969a1,1,0,1,0,1.414-1.414ZM10,18a8,8,0,1,1,8-8,8,8,0,0,1-8,8Z" fill="#FF4C6A" />
  </Svg>
));

const ScanIcon: React.FC = React.memo(() => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path d="M4,6H6V18H4ZM8,18h2V6H8ZM20,6H18V18h2ZM11,18h3V6H11ZM2,19V16H0v3a3,3,0,0,0,3,3H6V20H3A1,1,0,0,1,2,19Zm20,0a1,1,0,0,1-1,1H18v2h3a3,3,0,0,0,3-3V16H22ZM21,2H18V4h3a1,1,0,0,1,1,1V8h2V5A3,3,0,0,0,21,2ZM0,5V8H2V5A1,1,0,0,1,3,4H6V2H3A3,3,0,0,0,0,5Z" fill="#fff" />
    <Path d="M16,6H15V18h1V6Z" fill="#fff" />
  </Svg>
));

// Componente para mostrar la información de la mascota
const PetInfo: React.FC<{ petData: PetData }> = React.memo(({ petData }) => (
  <View style={styles.petInfo}>
    <Text style={styles.petText}>Nombre: {petData.name}</Text>
    <Text style={styles.petText}>Edad: {petData.Age}</Text>
    <Text style={styles.petText}>Raza: {petData.bread}</Text>
    <Text style={styles.petText}>Teléfono: {petData.phone}</Text>
    <Text style={styles.petText}>Dirección: {petData.direction}</Text>
  </View>
));

// Componente principal HomeScreen
export default function HomeScreen() {
  // Estados
  const [connectionStatus, setConnectionStatus] = useState('');
  const [code, setCode] = useState('');
  const [petData, setPetData] = useState<PetData | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Efecto para solicitar permisos de cámara
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  // Función para buscar mascotas en Firestore
  const handleSearch = useCallback(async (searchCode: string) => {
    setIsSearching(true);
    setConnectionStatus("Buscando...");

    try {
      const petsCollection = collection(db, 'pets');
      const q = query(petsCollection, where('code', '==', parseInt(searchCode)), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const pet = snapshot.docs[0].data() as PetData;
        setPetData(pet);
        setConnectionStatus("Mascota encontrada");
      } else {
        setConnectionStatus("No se encontró ninguna mascota con el código proporcionado.");
        setPetData(null);
      }
    } catch (error) {
      console.error("Error buscando mascota:", error);
      setConnectionStatus("Error buscando mascota. Revisa la consola para más detalles.");
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Manejador para el escaneo de código de barras
  const handleBarCodeScanned = useCallback(({ data }: { data: string }) => {
    setScanning(false);
    setCode(data);
    handleSearch(data);
  }, [handleSearch]);

  // Función para iniciar el escaneo
  const startScanning = useCallback(() => setScanning(true), []);

  // Memo para determinar si los botones deben estar deshabilitados
  const isButtonDisabled = useMemo(() => isSearching || scanning, [isSearching, scanning]);

  // Renderizado condicional para la vista de la cámara
  if (scanning) {
    return (
      <CameraView
        onBarcodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  // Renderizado principal
  return (
    <View style={styles.container}>
      {/* Barra superior con el logo */}
      <View style={styles.brandBar}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoBrand} resizeMode="contain" />
      </View>

      {/* Contenido principal */}
      <Image source={require('@/assets/images/petcode.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.instructions}>Ingresa o escanea el código de la mascota.</Text>
      
      {/* Campo de entrada para el código */}
      <TextInput
        style={styles.input}
        placeholder="Código"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        placeholderTextColor="#ccc"
        editable={!isSearching}
      />
      
      {/* Contenedor de botones */}
      <View style={styles.buttonContainer}>
        {/* Botón de búsqueda */}
        <TouchableOpacity 
          style={[styles.searchButton, isButtonDisabled && styles.disabledButton]} 
          onPress={() => handleSearch(code)} 
          disabled={isButtonDisabled}
        >
          {isSearching ? (
            <ActivityIndicator color="#FF4C6A" />
          ) : (
            <>
              <SearchIcon />
              <Text style={styles.buttonText}>BUSCAR</Text>
            </>
          )}
        </TouchableOpacity>
        
        {/* Botón de escaneo */}
        <TouchableOpacity 
          style={[styles.scanButton, isButtonDisabled && styles.disabledButton]} 
          onPress={startScanning} 
          disabled={isButtonDisabled}
        >
          <ScanIcon />
          <Text style={styles.buttonTextWhite}>ESCANEAR</Text>
        </TouchableOpacity>
      </View>
      
      {/* Mensaje de estado de la conexión */}
      <Text style={styles.connectionStatus}>{connectionStatus}</Text>
      
      {/* Información de la mascota (si se encuentra) */}
      {petData && <PetInfo petData={petData} />}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C3248',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  brandBar: {
    position: 'absolute',
    top: 40,
    left: -20,
    height: 60,
    width: '100%',
    backgroundColor: '#2C3248',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 20,
  },
  logoBrand: {
    width: 100,
    height: 40,
    marginLeft: 10,
  },
  instructions: {
    color: '#fff',
    marginBottom: 10,
    fontSize: 18,
    width: '90%',
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#fff',
    padding: 10,
    marginVertical: 10,
    width: '90%',
    color: '#fff',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4C6A',
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  buttonText: {
    color: '#FF4C6A',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  buttonTextWhite: {
    color: '#FFFFFF',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  connectionStatus: {
    color: '#fff',
    marginVertical: 10,
    textAlign: 'left',
    fontWeight: 'bold',
    width: '90%'
  },
  petInfo: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    width: '90%',
  },
  petText: {
    color: '#2C3248',
  },
  disabledButton: {
    opacity: 0.5,
  },
});