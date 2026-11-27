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
import { PLANT_CATALOG_SEED } from '../constants/plantCatalogData';

const CATALOG_COLLECTION = 'plant_catalog';
const FIRESTORE_OPERATION_TIMEOUT_MS = 12_000;

function withTimeout(operation, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), FIRESTORE_OPERATION_TIMEOUT_MS);
  });

  return Promise.race([operation, timeout]).finally(() => clearTimeout(timeoutId));
}

function getCatalogErrorMessage(error, fallback) {
  if (error?.code === 'permission-denied') {
    return 'O Firestore recusou o cadastro. Verifique as regras do banco.';
  }
  if (error?.code === 'unavailable') {
    return 'O Firestore está indisponível. Verifique sua conexão e tente novamente.';
  }
  if (error?.message) {
    return error.message;
  }
  return fallback;
}

export async function getPlantCatalog(userId) {
  try {
    const snapshot = await withTimeout(
      getDocs(query(collection(db, CATALOG_COLLECTION), where('ownerId', '==', userId))),
      'O carregamento do catálogo demorou mais que o esperado.',
    );
    const userCatalog = snapshot.docs.map((catalogDocument) => ({
      ...catalogDocument.data(),
      id: catalogDocument.id,
    }));
    return [...PLANT_CATALOG_SEED, ...userCatalog];
  } catch (error) {
    console.warn('Catálogo remoto indisponível; usando catálogo local:', error);
    return PLANT_CATALOG_SEED;
  }
}

export async function restorePlantCatalog(userId) {
  return getPlantCatalog(userId);
}

export async function createCatalogPlant(plantData, userId) {
  if (!userId) {
    throw new Error('É necessário entrar na conta para cadastrar uma espécie.');
  }
  const document = {
    ...plantData,
    source: 'user',
    ownerId: userId,
    createdAt: new Date().toISOString(),
  };
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const catalogRef = collection(db, CATALOG_COLLECTION);

  try {
    await withTimeout(
      setDoc(doc(catalogRef, id), document),
      'O cadastro da espécie demorou mais que o esperado.',
    );
    return { id, ...document };
  } catch (error) {
    throw new Error(getCatalogErrorMessage(error, 'Não foi possível cadastrar a espécie.'));
  }
}

export async function updateCatalogPlant(plantId, plantData) {
  await withTimeout(
    updateDoc(doc(db, CATALOG_COLLECTION, plantId), plantData),
    'A atualização da espécie demorou mais que o esperado.',
  );
  return { id: plantId, ...plantData };
}

export async function deleteCatalogPlant(plantId) {
  await withTimeout(
    deleteDoc(doc(db, CATALOG_COLLECTION, plantId)),
    'A exclusão da espécie demorou mais que o esperado.',
  );
}
