import * as Notifications from 'expo-notifications';

let permissionPromise;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function schedulePlantReminder({ plantName, date }) {
  permissionPromise ??= requestNotificationPermission().catch((error) => {
    permissionPromise = undefined;
    throw error;
  });
  const finalStatus = await permissionPromise;

  if (finalStatus !== 'granted') {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de cuidar do seu Broto 🌿',
      body: `A ${plantName} está esperando por você.`,
      data: { plantName },
    },
    trigger: date,
  });
}

async function requestNotificationPermission() {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.status === 'granted') {
    return permissions.status;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status;
}

export async function cancelPlantReminder(notificationId) {
  if (notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
}
