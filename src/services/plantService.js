import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { calculateNextCareDate } from '../utils/watering';

const PLANTS_COLLECTION = 'plants';
const FIRESTORE_OPERATION_TIMEOUT_MS = 15_000;

function withTimeout(operation, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), FIRESTORE_OPERATION_TIMEOUT_MS);
  });

  return Promise.race([operation, timeout]).finally(() => clearTimeout(timeoutId));
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR');
}

function getFirestoreErrorMessage(error, fallback) {
  if (error?.code === 'permission-denied') {
    return 'O Firestore recusou a gravação. Verifique as regras do banco.';
  }
  if (error?.code === 'unavailable' || error?.code === 'failed-precondition') {
    return 'O Firestore está indisponível. Verifique sua conexão e tente novamente.';
  }
  if (error?.message?.includes('demorou mais')) {
    return error.message;
  }
  return fallback;
}

export const createPlant = async (plantData) => {
  try {
    const lastWateredDate = new Date().toISOString();
    const requestedNextCareDate = plantData.nextCareDate ? new Date(plantData.nextCareDate) : null;
    const nextCareDate = requestedNextCareDate && !Number.isNaN(requestedNextCareDate.getTime())
      ? requestedNextCareDate
      : calculateNextCareDate(lastWateredDate, plantData.wateringFrequency);
    const docRef = await withTimeout(
      addDoc(collection(db, PLANTS_COLLECTION), {
        ...plantData,
        createdAt: serverTimestamp(),
        lastWateredDate,
        nextCareDate: nextCareDate.toISOString(),
        nextCare: formatDate(nextCareDate),
      }),
      'O cadastro demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
    return {
      id: docRef.id,
      ...plantData,
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    };
  } catch (error) {
    const message = getFirestoreErrorMessage(error, 'Não foi possível cadastrar a planta.');
    console.error('Erro ao criar planta:', error);
    const userError = new Error(message);
    userError.code = error?.code;
    throw userError;
  }
};

export const getPlants = async () => {
  try {
    const querySnapshot = await withTimeout(
      getDocs(collection(db, PLANTS_COLLECTION)),
      'O carregamento demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
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

export const updateWateringDate = async (plantId, wateringFrequency) => {
  try {
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    const lastWateredDate = new Date().toISOString();
    const nextCareDate = calculateNextCareDate(lastWateredDate, wateringFrequency);
    const updatedFields = {
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    };
    await withTimeout(
      updateDoc(plantRef, updatedFields),
      'O registro da rega demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
    return updatedFields;
  } catch (error) {
    console.error("Erro ao registrar rega: ", error);
    throw error;
  }
};

export const updatePlant = async (plantId, plantData) => {
  try {
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    await withTimeout(
      updateDoc(plantRef, plantData),
      'A atualização demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
    return { id: plantId, ...plantData };
  } catch (error) {
    const message = getFirestoreErrorMessage(error, 'Não foi possível atualizar a planta.');
    console.error('Erro ao atualizar planta:', error);
    const userError = new Error(message);
    userError.code = error?.code;
    throw userError;
  }
};

export const deletePlant = async (plantId) => {
  try {
    await withTimeout(
      deleteDoc(doc(db, PLANTS_COLLECTION, plantId)),
      'A exclusão demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
  } catch (error) {
    console.error('Erro ao excluir planta:', error);
    throw error;
  }
};