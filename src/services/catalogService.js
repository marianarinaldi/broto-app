import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import { PLANT_CATALOG_SEED } from '../constants/plantCatalogData';

const CATALOG_COLLECTION = 'plant_catalog';
const catalogCollection = collection(db, CATALOG_COLLECTION);

const toCatalogItem = (snapshot) => ({
  ...snapshot.data(),
  id: snapshot.id,
});

export async function seedPlantCatalog() {
  const catalogRef = collection(db, CATALOG_COLLECTION);
  await Promise.all(
    PLANT_CATALOG_SEED.map((plant) => setDoc(doc(catalogRef, plant.id), plant, { merge: true })),
  );
  return PLANT_CATALOG_SEED;
}

export async function getPlantCatalog() {
  try {
    const snapshot = await getDocs(collection(db, CATALOG_COLLECTION));
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
  const snapshot = await addDoc(catalogCollection, document);
  return { id: snapshot.id, ...document };
}

export async function updateCatalogPlant(plantId, plantData) {
  await updateDoc(doc(db, CATALOG_COLLECTION, plantId), plantData);
  return { id: plantId, ...plantData };
}

export async function deleteCatalogPlant(plantId) {
  await deleteDoc(doc(db, CATALOG_COLLECTION, plantId));
}
