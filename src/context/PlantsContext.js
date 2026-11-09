import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  createPlant as createPlantService,
  deletePlant as deletePlantService,
  getPlants,
  updatePlant as updatePlantService,
  updateWateringDate as updateWateringDateService,
} from '../services/plantService';

const PlantsContext = createContext(null);

export function PlantsProvider({ children }) {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [operationLoading, setOperationLoading] = useState(false);

  const loadPlants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const loadedPlants = await getPlants();
      setPlants(loadedPlants);
      return loadedPlants;
    } catch (loadError) {
      setError('Não foi possível carregar suas plantas.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlants();
  }, [loadPlants]);

  const createPlant = useCallback(async (plantData) => {
    setOperationLoading(true);
    setError('');
    try {
      const createdPlant = await createPlantService(plantData);
      setPlants((currentPlants) => [...currentPlants, createdPlant]);
      return createdPlant;
    } catch (createError) {
      setError('Não foi possível salvar a planta.');
      throw createError;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const updatePlant = useCallback(async (plantId, plantData) => {
    setOperationLoading(true);
    setError('');
    try {
      const updatedPlant = await updatePlantService(plantId, plantData);
      setPlants((currentPlants) =>
        currentPlants.map((plant) => (plant.id === plantId ? { ...plant, ...updatedPlant } : plant)),
      );
      return updatedPlant;
    } catch (updateError) {
      setError('Não foi possível atualizar a planta.');
      throw updateError;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const updateWateringDate = useCallback(async (plantId) => {
    setOperationLoading(true);
    setError('');
    try {
      const result = await updateWateringDateService(plantId);
      setPlants((currentPlants) =>
        currentPlants.map((plant) =>
          plant.id === plantId
            ? { ...plant, ...result }
            : plant,
        ),
      );
    } catch (wateringError) {
      setError('Não foi possível registrar a rega.');
      throw wateringError;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const deletePlant = useCallback(async (plantId) => {
    setOperationLoading(true);
    setError('');
    try {
      await deletePlantService(plantId);
      setPlants((currentPlants) => currentPlants.filter((plant) => plant.id !== plantId));
    } catch (deleteError) {
      setError('Não foi possível excluir a planta.');
      throw deleteError;
    } finally {
      setOperationLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      plants,
      loading,
      error,
      operationLoading,
      loadPlants,
      createPlant,
      updatePlant,
      updateWateringDate,
      deletePlant,
    }),
    [
      plants,
      loading,
      error,
      operationLoading,
      loadPlants,
      createPlant,
      updatePlant,
      updateWateringDate,
      deletePlant,
    ],
  );

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

export function usePlants() {
  const context = useContext(PlantsContext);
  if (!context) {
    throw new Error('usePlants deve ser usado dentro de PlantsProvider.');
  }
  return context;
}
