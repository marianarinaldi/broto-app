import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { calculateNextCareDate } from '../utils/watering';

const PLANTS_COLLECTION = 'plants';

function formatDate(date) {
  return date.toLocaleDateString('pt-BR');
}

export const createPlant = async (plantData) => {
  try {
    const lastWateredDate = new Date().toISOString();
    const requestedNextCareDate = plantData.nextCareDate ? new Date(plantData.nextCareDate) : null;
    const nextCareDate = requestedNextCareDate && !Number.isNaN(requestedNextCareDate.getTime())
      ? requestedNextCareDate
      : calculateNextCareDate(lastWateredDate, plantData.wateringFrequency);
    const docRef = await addDoc(collection(db, PLANTS_COLLECTION), {
      ...plantData,
      createdAt: serverTimestamp(),
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    });
    return {
      id: docRef.id,
      ...plantData,
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    };
  } catch (error) {
    console.error("Erro ao criar planta: ", error);
    throw error;
  }
};

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

export const updateWateringDate = async (plantId) => {
  try {
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    const lastWateredDate = new Date().toISOString();
    const snapshot = await getDoc(plantRef);
    const plant = snapshot.data();
    const nextCareDate = calculateNextCareDate(lastWateredDate, plant?.wateringFrequency);
    const updatedFields = {
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    };
    await updateDoc(plantRef, updatedFields);
    return updatedFields;
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