export function getPlantMood(plant) {
  if (!plant.lastWateredDate) {
    return { label: 'Esperando carinho', icon: 'emoticon-outline', message: 'Que tal começar nossa rotina de cuidados?' };
  }

  const daysSinceWatering = Math.floor(
    (Date.now() - new Date(plant.lastWateredDate).getTime()) / 86400000,
  );

  if (daysSinceWatering <= 1) {
    return { label: 'Muito feliz', icon: 'emoticon-excited-outline', message: 'A rega de hoje deixou minhas folhas brilhando!' };
  }
  if (daysSinceWatering <= 3) {
    return { label: 'Com saudade', icon: 'emoticon-neutral-outline', message: 'Estou bem, mas aceito um pouquinho de atenção.' };
  }
  return { label: 'Com sede', icon: 'emoticon-sad-outline', message: 'Minhas folhas estão pedindo água.' };
}
