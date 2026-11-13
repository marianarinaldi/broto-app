export function calculateNextCareDate(lastWateredDate, wateringFrequency) {
  const nextCareDate = new Date(lastWateredDate);
  const intervalDays = Number.parseInt(wateringFrequency, 10);

  if (!Number.isFinite(intervalDays) || intervalDays <= 0) {
    throw new Error('A frequência de rega deve ser um número maior que zero.');
  }

  nextCareDate.setDate(nextCareDate.getDate() + intervalDays);
  return nextCareDate;
}

export function getWateringStatus(plant, now = new Date()) {
  if (!plant.nextCareDate) {
    return { label: plant.nextCare || 'Sem data definida', tone: 'neutral', isDue: false };
  }

  const nextCareDate = new Date(plant.nextCareDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  nextCareDate.setHours(0, 0, 0, 0);
  const daysUntil = Math.round((nextCareDate - today) / 86400000);

  if (daysUntil < 0) return { label: 'Atrasada', tone: 'danger', isDue: true };
  if (daysUntil === 0) return { label: 'Regar hoje', tone: 'today', isDue: true };
  if (daysUntil === 1) return { label: 'Regar amanhã', tone: 'soon', isDue: false };
  return { label: `Próxima rega em ${daysUntil} dias`, tone: 'future', isDue: false };
}
