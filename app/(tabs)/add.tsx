import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export default function AddScreen() {
  return (
    <View style={styles.container}>
      {/* Barra superior con el logo */}
      <View style={styles.brandBar}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logoBrand} resizeMode="contain" />
      </View>

      {/* Contenido principal */}
      <Image source={require('@/assets/images/petcode.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.instructions}>Si desea agregar nuevas mascotas contacte al administrador</Text>
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
    textAlign: 'center',
  },
});
