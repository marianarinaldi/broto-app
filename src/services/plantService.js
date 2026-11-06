import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

const PLANTS_COLLECTION = 'plants';
const STATS_DOCUMENT = 'appStats/global';

const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const getYesterdayKey = (date = new Date()) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday);
};

const calculateMedals = (points, streak, totalWaterings) => [
  ...(totalWaterings >= 1 ? ['primeira-rega'] : []),
  ...(streak >= 3 ? ['constancia'] : []),
  ...(points >= 100 ? ['jardineira-dedicada'] : []),
];

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
    const statsRef = doc(db, STATS_DOCUMENT);
    const now = new Date();
    const todayKey = getDateKey(now);

    return runTransaction(db, async (transaction) => {
      const [plantSnapshot, statsSnapshot] = await Promise.all([
        transaction.get(plantRef),
        transaction.get(statsRef),
      ]);

      if (!plantSnapshot.exists()) {
        throw new Error('Planta não encontrada.');
      }

      const previousStats = statsSnapshot.data() ?? {};
      const alreadyWateredToday =
        previousStats.lastActivityDate === todayKey;
      const currentStreak = alreadyWateredToday
        ? previousStats.streak ?? 1
        : previousStats.lastActivityDate === getYesterdayKey(now)
          ? (previousStats.streak ?? 0) + 1
          : 1;
      const totalWaterings = alreadyWateredToday
        ? previousStats.totalWaterings ?? 0
        : (previousStats.totalWaterings ?? 0) + 1;
      const points = alreadyWateredToday
        ? previousStats.points ?? 0
        : (previousStats.points ?? 0) + 10;

      transaction.update(plantRef, { lastWateredDate: now.toISOString() });
      transaction.set(
        statsRef,
        {
          points,
          streak: currentStreak,
          bestStreak: Math.max(previousStats.bestStreak ?? 0, currentStreak),
          totalWaterings,
          lastActivityDate: todayKey,
          medals: calculateMedals(points, currentStreak, totalWaterings),
        },
        { merge: true },
      );

      return {
        lastWateredDate: now.toISOString(),
        stats: {
          points,
          streak: currentStreak,
          bestStreak: Math.max(previousStats.bestStreak ?? 0, currentStreak),
          totalWaterings,
          medals: calculateMedals(points, currentStreak, totalWaterings),
        },
      };
    });
  } catch (error) {
    console.error("Erro ao registrar rega: ", error);
    throw error;
  }
};

export const getPlantStats = async () => {
  const statsSnapshot = await getDoc(doc(db, STATS_DOCUMENT));
  return statsSnapshot.data() ?? {
    points: 0,
    streak: 0,
    bestStreak: 0,
    totalWaterings: 0,
    medals: [],
  };
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