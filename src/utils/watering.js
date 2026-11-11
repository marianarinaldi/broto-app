export function calculateNextCareDate(lastWateredDate, wateringFrequency) {
  const nextCareDate = new Date(lastWateredDate);
  const intervalDays = Number.parseInt(wateringFrequency, 10);

  if (!Number.isFinite(intervalDays) || intervalDays <= 0) {
    throw new Error('A frequência de rega deve ser um número maior que zero.');
  }

  nextCareDate.setDate(nextCareDate.getDate() + intervalDays);
  return nextCareDate;
}
