import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseConfig } from '../config/firebaseConfig';
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

function toRestFields(document) {
  const fields = {};
  Object.entries(document).forEach(([key, value]) => {
    if (typeof value === 'number') fields[key] = { integerValue: String(value) };
    else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
    else if (Array.isArray(value)) fields[key] = { arrayValue: { values: value.map((item) => ({ stringValue: String(item) })) } };
    else if (value !== null && value !== undefined) fields[key] = { stringValue: String(value) };
  });
  return fields;
}

function parseRestFields(fields = {}) {
  const document = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (Object.prototype.hasOwnProperty.call(value, 'stringValue')) document[key] = value.stringValue;
    else if (Object.prototype.hasOwnProperty.call(value, 'integerValue')) document[key] = value.integerValue;
    else if (Object.prototype.hasOwnProperty.call(value, 'doubleValue')) document[key] = value.doubleValue;
    else if (Object.prototype.hasOwnProperty.call(value, 'booleanValue')) document[key] = value.booleanValue;
    else if (Object.prototype.hasOwnProperty.call(value, 'timestampValue')) document[key] = value.timestampValue;
  });
  return document;
}

const restCollectionUrl = (collectionName) =>
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}?key=${encodeURIComponent(firebaseConfig.apiKey)}`;

async function restRequest(url, options = {}) {
  return withTimeout(
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }),
    'A conexão com o Firestore demorou mais que o esperado.',
  );
}

export const createPlant = async (plantData) => {
  try {
    const lastWateredDate = new Date().toISOString();
    const requestedNextCareDate = plantData.nextCareDate ? new Date(plantData.nextCareDate) : null;
    const nextCareDate = requestedNextCareDate && !Number.isNaN(requestedNextCareDate.getTime())
      ? requestedNextCareDate
      : calculateNextCareDate(lastWateredDate, plantData.wateringFrequency);
    const id = `plant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const document = {
      ...plantData,
      createdAt: new Date().toISOString(),
      lastWateredDate,
      nextCareDate: nextCareDate.toISOString(),
      nextCare: formatDate(nextCareDate),
    };

    try {
      await withTimeout(
        setDoc(doc(collection(db, PLANTS_COLLECTION), id), document),
        'O cadastro demorou mais que o esperado. Verifique sua conexão e tente novamente.',
      );
    } catch (sdkError) {
      if (sdkError?.code === 'permission-denied') throw sdkError;
      const response = await restRequest(
        `${restCollectionUrl(PLANTS_COLLECTION)}&documentId=${encodeURIComponent(id)}`,
        { method: 'POST', body: JSON.stringify({ fields: toRestFields(document) }) },
      );
      if (!response.ok) {
        throw new Error(`Não foi possível cadastrar a planta: ${response.status}`);
      }
    }

    return {
      id,
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
    try {
      const querySnapshot = await withTimeout(
        getDocs(collection(db, PLANTS_COLLECTION)),
        'O carregamento demorou mais que o esperado. Verifique sua conexão e tente novamente.',
      );
      const plants = [];
      querySnapshot.forEach((snapshotDoc) => {
        plants.push({ id: snapshotDoc.id, ...snapshotDoc.data() });
      });
      return plants;
    } catch (sdkError) {
      if (sdkError?.code === 'permission-denied') throw sdkError;
      const response = await restRequest(restCollectionUrl(PLANTS_COLLECTION));
      if (!response.ok) throw sdkError;
      const payload = await response.json();
      return (payload.documents || []).map((item) => {
        const id = item.name.split('/').pop();
        return { id, ...parseRestFields(item.fields) };
      });
    }
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
    try {
      await withTimeout(
        updateDoc(plantRef, updatedFields),
        'O registro da rega demorou mais que o esperado. Verifique sua conexão e tente novamente.',
      );
    } catch (sdkError) {
      if (sdkError?.code === 'permission-denied') throw sdkError;
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${PLANTS_COLLECTION}/${encodeURIComponent(plantId)}?key=${encodeURIComponent(firebaseConfig.apiKey)}&currentDocument.exists=true`;
      const response = await restRequest(url, {
        method: 'PATCH',
        body: JSON.stringify({ fields: toRestFields(updatedFields) }),
      });
      if (!response.ok) throw sdkError;
    }
    return updatedFields;
  } catch (error) {
    console.error("Erro ao registrar rega: ", error);
    throw error;
  }
};

export const updatePlant = async (plantId, plantData) => {
  try {
    const plantRef = doc(db, PLANTS_COLLECTION, plantId);
    try {
      await withTimeout(
        updateDoc(plantRef, plantData),
        'A atualização demorou mais que o esperado. Verifique sua conexão e tente novamente.',
      );
    } catch (sdkError) {
      if (sdkError?.code === 'permission-denied') throw sdkError;
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${PLANTS_COLLECTION}/${encodeURIComponent(plantId)}?key=${encodeURIComponent(firebaseConfig.apiKey)}&currentDocument.exists=true`;
      const response = await restRequest(url, {
        method: 'PATCH',
        body: JSON.stringify({ fields: toRestFields(plantData) }),
      });
      if (!response.ok) throw sdkError;
    }
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
    try {
      await withTimeout(
        deleteDoc(doc(db, PLANTS_COLLECTION, plantId)),
        'A exclusão demorou mais que o esperado. Verifique sua conexão e tente novamente.',
      );
    } catch (sdkError) {
      if (sdkError?.code === 'permission-denied') throw sdkError;
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${PLANTS_COLLECTION}/${encodeURIComponent(plantId)}?key=${encodeURIComponent(firebaseConfig.apiKey)}`;
      const response = await restRequest(url, { method: 'DELETE' });
      if (!response.ok) throw sdkError;
    }
  } catch (error) {
    console.error('Erro ao excluir planta:', error);
    throw error;
  }
};