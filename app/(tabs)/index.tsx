import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Platform, TextInput, Button, View } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { db } from '@/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState('');
  const [code, setCode] = useState('');
  const [petData, setPetData] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleSearch = async (searchCode) => {
    try {
      const petsCollection = collection(db, 'pets');
      const q = query(petsCollection, where('code', '==', parseInt(searchCode)));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const pet = snapshot.docs[0].data();
        setPetData(pet);
        setConnectionStatus("Pet found!");
      } else {
        setConnectionStatus("No pet found with the provided code.");
        setPetData(null);
      }
    } catch (error) {
      console.error("Error searching for pet:", error);
      setConnectionStatus("Error searching for pet. Check console for details.");
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    setCode(data);
    handleSearch(data);
  };

  if (scanning) {
    return (
      <BarCodeScanner
        onBarCodeScanned={handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Bienvenido a code-vet-app</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter pet code"
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
        />
        <Button title="Search Pet" onPress={() => handleSearch(code)} />
        <Button title="Scan Code" onPress={() => setScanning(true)} />
        <ThemedText>{connectionStatus}</ThemedText>
        {petData && (
          <View style={styles.petInfo}>
            <ThemedText>Name: {petData.name}</ThemedText>
            <ThemedText>Breed: {petData.breed}</ThemedText>
            <ThemedText>Age: {petData.Age}</ThemedText>
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 10,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 10,
    width: '80%',
  },
  petInfo: {
    marginTop: 10,
  },
});
