import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Configuración de Firebase obtenida de Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBYAFVNHgCkmz34zfhuOWOTQjSim3cdLrw",
    authDomain: "vet-code-app.firebaseapp.com",
    projectId: "vet-code-app",
    storageBucket: "vet-code-app.appspot.com",
    messagingSenderId: "195004064777",
    appId: "1:195004064777:web:10ad088ae1cd4f67a044d8",
    measurementId: "G-HQPJJZHC3C"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Analytics solo si es compatible
const initializeAnalytics = async () => {
    try {
        const analyticsSupported = await isSupported();
        if (analyticsSupported) {
            getAnalytics(app);
        } else {
            console.log("Firebase Analytics no es compatible en este entorno.");
        }
    } catch (error) {
        console.error("Error al verificar la compatibilidad de Firebase Analytics:", error);
    }
};

initializeAnalytics();