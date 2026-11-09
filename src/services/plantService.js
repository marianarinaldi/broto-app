import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const PLANTS_COLLECTION = 'plants';

const getNextCareDate = (wateringFrequency) => {
  const days = Number.parseInt(wateringFrequency, 10);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + (Number.isFinite(days) && days > 0 ? days : 1));
  nextDate.setHours(9, 0, 0, 0);
  return nextDate;
};

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
    const lastWateredDate = new Date().toISOString();
    const plantSnapshot = await getDoc(plantRef);
    if (!plantSnapshot.exists()) {
      throw new Error('Planta não encontrada.');
    }

    const nextCareDate = getNextCareDate(plantSnapshot.data().wateringFrequency);
    const nextCare = nextCareDate.toLocaleDateString('pt-BR');
    await updateDoc(plantRef, {
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare,
    });
    return { lastWateredDate, nextCareDate: nextCareDate.toISOString(), nextCare };
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