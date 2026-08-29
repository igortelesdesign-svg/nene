import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { AppointmentEvent } from '../types';

function notificationId(id: string, offset = 0): number {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }

  return (Math.abs(hash) || 1) + offset;
}

export const notificationService = {
  async requestPermission(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return false;

    const current = await LocalNotifications.checkPermissions();

    if (current.display === 'granted') {
      return true;
    }

    const requested = await LocalNotifications.requestPermissions();
    return requested.display === 'granted';
  },

  async scheduleAppointment(event: AppointmentEvent): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const allowed = await this.requestPermission();
    if (!allowed) return;

    const scheduledAt = new Date(
      `${event.scheduledDate}T${event.scheduledTime}:00`
    );

    if (Number.isNaN(scheduledAt.getTime())) return;
    if (scheduledAt.getTime() <= Date.now()) return;

    const oneDayBefore = new Date(
      scheduledAt.getTime() - 24 * 60 * 60 * 1000
    );

    const oneHourBefore = new Date(
      scheduledAt.getTime() - 60 * 60 * 1000
    );

    const notifications = [];

    if (oneDayBefore.getTime() > Date.now()) {
      notifications.push({
        id: notificationId(event.id, 1),
        title: 'Consulta amanhã 🩺',
        body: `${event.specialty} com ${event.doctorName} amanhã às ${event.scheduledTime}.`,
        schedule: {
          at: oneDayBefore,
          allowWhileIdle: true,
        },
        extra: {
          eventId: event.id,
          childId: event.childId,
          type: 'appointment',
          reminder: '24h',
        },
      });
    }

    if (oneHourBefore.getTime() > Date.now()) {
      notifications.push({
        id: notificationId(event.id, 2),
        title: 'Consulta chegando 🩺',
        body: `${event.specialty} com ${event.doctorName} em 1 hora.`,
        schedule: {
          at: oneHourBefore,
          allowWhileIdle: true,
        },
        extra: {
          eventId: event.id,
          childId: event.childId,
          type: 'appointment',
          reminder: '1h',
        },
      });
    }

    if (notifications.length === 0) return;

    await LocalNotifications.schedule({
      notifications,
    });
  },

  async getPendingNotifications() {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    const result = await LocalNotifications.getPending();
    return result.notifications;
  },

  async cancelAppointment(eventId: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    await LocalNotifications.cancel({
      notifications: [
        { id: notificationId(eventId, 1) },
        { id: notificationId(eventId, 2) },
      ],
    });
  },
};
