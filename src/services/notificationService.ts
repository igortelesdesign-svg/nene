import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import type { AppointmentEvent } from '../types';

function notificationId(id: string): number {
  let hash = 0;

  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) || 1;
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

    // Avisar 1 hora antes.
    const notifyAt = new Date(scheduledAt.getTime() - 60 * 60 * 1000);

    if (notifyAt.getTime() <= Date.now()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: notificationId(event.id),
          title: 'Consulta chegando 🩺',
          body: `${event.specialty} com ${event.doctorName} em 1 hora.`,
          schedule: {
            at: notifyAt,
            allowWhileIdle: true,
          },
          extra: {
            eventId: event.id,
            childId: event.childId,
            type: 'appointment',
          },
        },
      ],
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
      notifications: [{ id: notificationId(eventId) }],
    });
  },
};
