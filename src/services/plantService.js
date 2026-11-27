import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { calculateNextCareDate } from '../utils/watering';

const PLANTS_COLLECTION = 'plants';
const FIRESTORE_OPERATION_TIMEOUT_MS = 12_000;

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

function requireUserId(userId) {
  if (!userId) {
    throw new Error('É necessário entrar na conta para acessar as plantas.');
  }
}

export const createPlant = async (plantData, userId) => {
  try {
    requireUserId(userId);
    const lastWateredDate = new Date().toISOString();
    const requestedNextCareDate = plantData.nextCareDate ? new Date(plantData.nextCareDate) : null;
    const nextCareDate = requestedNextCareDate && !Number.isNaN(requestedNextCareDate.getTime())
      ? requestedNextCareDate
      : calculateNextCareDate(lastWateredDate, plantData.wateringFrequency);
    const id = `plant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const document = {
      ...plantData,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    };

    await withTimeout(
      setDoc(doc(collection(db, PLANTS_COLLECTION), id), document),
      'O cadastro demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );

    return {
      id,
      ...document,
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

export const getPlants = async (userId) => {
  try {
    requireUserId(userId);
    const snapshot = await withTimeout(
      getDocs(query(collection(db, PLANTS_COLLECTION), where('ownerId', '==', userId))),
      'O carregamento demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
    return snapshot.docs.map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() }));
  } catch (error) {
    console.error('Erro ao buscar plantas:', error);
    throw error;
  }
};

export const updateWateringDate = async (plantId, wateringFrequency, userId) => {
  try {
    requireUserId(userId);
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

export const updatePlant = async (plantId, plantData, userId) => {
  try {
    requireUserId(userId);
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

export const deletePlant = async (plantId, userId) => {
  try {
    requireUserId(userId);
    await withTimeout(
      deleteDoc(doc(db, PLANTS_COLLECTION, plantId)),
      'A exclusão demorou mais que o esperado. Verifique sua conexão e tente novamente.',
    );
  } catch (error) {
    console.error('Erro ao excluir planta:', error);
    throw error;
  }
};