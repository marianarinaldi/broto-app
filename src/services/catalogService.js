import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import { PLANT_CATALOG_SEED } from '../constants/plantCatalogData';

const CATALOG_COLLECTION = 'plant_catalog';
const FIRESTORE_OPERATION_TIMEOUT_MS = 15_000;
const catalogCollection = collection(db, CATALOG_COLLECTION);

function withTimeout(operation, message) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), FIRESTORE_OPERATION_TIMEOUT_MS);
  });

  return Promise.race([operation, timeout]).finally(() => clearTimeout(timeoutId));
}

const toCatalogItem = (snapshot) => ({
  ...snapshot.data(),
  id: snapshot.id,
});

export async function seedPlantCatalog() {
  const catalogRef = collection(db, CATALOG_COLLECTION);
  await Promise.all(
    PLANT_CATALOG_SEED.map((plant) => withTimeout(
      setDoc(doc(catalogRef, plant.id), plant, { merge: true }),
      'A restauração do catálogo demorou mais que o esperado.',
    )),
  );
  return PLANT_CATALOG_SEED;
}

export async function getPlantCatalog() {
  try {
    const snapshot = await withTimeout(
      getDocs(collection(db, CATALOG_COLLECTION)),
      'O carregamento do catálogo demorou mais que o esperado.',
    );
    if (snapshot.empty) {
      seedPlantCatalog().catch((error) => {
        console.warn('Não foi possível fazer o seed do catálogo no Firestore:', error);
      });
      return PLANT_CATALOG_SEED;
    }

    return snapshot.docs.map(toCatalogItem);
  } catch (error) {
    console.warn('Catálogo remoto indisponível; usando catálogo local:', error);
    return PLANT_CATALOG_SEED;
  }
}

export async function restorePlantCatalog() {
  await seedPlantCatalog();
  return PLANT_CATALOG_SEED;
}

export async function createCatalogPlant(plantData) {
  const document = {
    ...plantData,
    source: 'user',
    createdAt: new Date().toISOString(),
  };
  const snapshot = await withTimeout(
    addDoc(catalogCollection, document),
    'O cadastro da espécie demorou mais que o esperado.',
  );
  return { id: snapshot.id, ...document };
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
