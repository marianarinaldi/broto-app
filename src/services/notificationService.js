import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

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

  if (!(date instanceof Date) || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('plant-care', {
      name: 'Cuidados das plantas',
      importance: AndroidImportance.DEFAULT,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Hora de cuidar do seu Broto 🌿',
      body: `A ${plantName} está esperando por você.`,
      data: { plantName },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: 'plant-care',
    },
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
