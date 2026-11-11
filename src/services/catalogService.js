import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

import { db } from '../config/firebaseConfig';
import { PLANT_CATALOG_SEED } from '../constants/plantCatalogData';

const CATALOG_COLLECTION = 'plant_catalog';

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
