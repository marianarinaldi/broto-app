import { 
  collection, 
  addDoc, 
  getDocs, 
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const PLANTS_COLLECTION = 'plants';

// 1. Cadastrar nova planta
export const createPlant = async (plantData) => {
  try {
    const docRef = await addDoc(collection(db, PLANTS_COLLECTION), {
      ...plantData,
      createdAt: serverTimestamp(),
      lastWateredDate: new Date().toISOString(),
    });
    return { id: docRef.id, ...plantData };
  } catch (error) {
    console.error("Erro ao criar planta: ", error);
    throw error;
  }
};

// 2. Buscar todas as plantas
export const getPlants = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PLANTS_COLLECTION));
    const plants = [];
    querySnapshot.forEach((doc) => {
      plants.push({ id: doc.id, ...doc.data() });
    });
    return plants;
  } catch (error) {
    console.error("Erro ao buscar plantas: ", error);
    throw error;
  }
};

// 3. Atualizar data de rega
export const updateWateringDate = async (plantId) => {
  try {
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    await updateDoc(plantRef, {
      lastWateredDate: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao registrar rega: ", error);
    throw error;
  }
};

export const updatePlant = async (plantId, plantData) => {
  try {
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    await updateDoc(plantRef, plantData);
    return { id: plantId, ...plantData };
  } catch (error) {
    console.error('Erro ao atualizar planta:', error);
    throw error;
  }
};

export const deletePlant = async (plantId) => {
  try {
    await deleteDoc(doc(db, PLANTS_COLLECTION, plantId));
  } catch (error) {
    console.error('Erro ao excluir planta:', error);
    throw error;
  }
};