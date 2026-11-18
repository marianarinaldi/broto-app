import { collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { db, firebaseConfig } from '../config/firebaseConfig';
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
  const id = `user-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const catalogRef = collection(db, CATALOG_COLLECTION);

  try {
    await withTimeout(
      setDoc(doc(catalogRef, id), document),
      'O cadastro da espécie demorou mais que o esperado.',
    );
    return { id, ...document };
  } catch (error) {
    if (error?.code === 'permission-denied') {
      throw new Error(getCatalogErrorMessage(error, 'Não foi possível cadastrar a espécie.'));
    }

    const fields = {};
    Object.entries(document).forEach(([key, value]) => {
      if (typeof value === 'number') fields[key] = { integerValue: String(value) };
      else if (typeof value === 'boolean') fields[key] = { booleanValue: value };
      else if (Array.isArray(value)) fields[key] = { arrayValue: { values: value.map((item) => ({ stringValue: String(item) })) } };
      else if (value !== null && value !== undefined) fields[key] = { stringValue: String(value) };
    });

    const response = await withTimeout(
      fetch(
        `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${CATALOG_COLLECTION}?documentId=${encodeURIComponent(id)}&key=${encodeURIComponent(firebaseConfig.apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        },
      ),
      'A conexão com o catálogo demorou mais que o esperado.',
    );

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error(getCatalogErrorMessage(error, `Não foi possível cadastrar a espécie: ${responseText || response.status}`));
    }

    return { id, ...document };
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
