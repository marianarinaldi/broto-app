export function getPlantCareStatus(plant) {
  const today = new Date();
  const careDate = plant.nextCareDate ? new Date(plant.nextCareDate) : null;

  if (!careDate || Number.isNaN(careDate.getTime())) {
    return { label: plant.nextCare || 'Data não definida', tone: 'neutral', icon: 'calendar-question-outline' };
  }

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const careStart = new Date(careDate.getFullYear(), careDate.getMonth(), careDate.getDate());
  const difference = Math.round((careStart - todayStart) / 86400000);

  if (difference < 0) return { label: 'Atrasada', tone: 'danger', icon: 'alert-circle-outline' };
  if (difference === 0) return { label: 'Regar hoje', tone: 'warning', icon: 'water-alert-outline' };
  if (difference === 1) return { label: 'Regar amanhã', tone: 'soon', icon: 'calendar-today' };
  return { label: `Em ${difference} dias`, tone: 'healthy', icon: 'calendar-check-outline' };
}
