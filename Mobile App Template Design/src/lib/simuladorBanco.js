import { db } from "./firebaseConfig"; // Tu config de Firebase
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const comercios = ["Oxxo", "7-Eleven", "Amazon", "Uber", "Starbucks", "Steam"];

export const simularGastoEntrante = async () => {
    const gastoAleatorio = {
        comercio: comercios[Math.floor(Math.random() * comercios.length)],
        monto: Math.floor(Math.random() * 2000), // Gastos de 0 a 2000
        fecha: serverTimestamp(),
        procesado: false
    };

    await addDoc(collection(db, "transacciones"), gastoAleatorio);
    console.log("🏦 Banco: Nuevo gasto detectado y enviado al sistema.");
};