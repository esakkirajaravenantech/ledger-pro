import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

export const configurePushNotifications = () => {
  PushNotification.configure({
    onRegister: function (token) {
      console.log('TOKEN:', token);
    },
    onNotification: function (notification) {
      console.log('NOTIFICATION:', notification);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: Platform.OS === 'ios',
  });

  PushNotification.createChannel(
    {
      channelId: 'ledger-pro-channel',
      channelName: 'LedgerPro Reminders',
      channelDescription: 'Reminders for receipts and agreements',
      importance: 4,
      vibrate: true,
    },
    created => console.log(`Channel created: ${created}`),
  );
};

/**
 * Schedule a local notification reminder for a missing receipt.
 * @param {number} unitId
 * @param {string} unitName
 * @param {number} month - 1-12
 * @param {number} year
 * @returns {string} notification id
 */
export const scheduleReceiptReminder = (unitId, unitName, month, year) => {
  const notificationId = `receipt_${unitId}_${month}_${year}`;
  const idNum = Math.abs(hashCode(notificationId));

  PushNotification.localNotificationSchedule({
    channelId: 'ledger-pro-channel',
    id: idNum,
    title: 'Receipt Reminder',
    message: `Rent receipt for ${unitName} (${getMonthName(month)} ${year}) not yet received.`,
    // Schedules for the 5th of the following month as a practical reminder
    date: new Date(new Date(year, month, 5).getTime()),
    allowWhileIdle: true,
    userInfo: { unitId, month, year, type: 'receipt' },
  });

  return String(idNum);
};

/**
 * Schedule a notification 3 months before agreement expiry.
 * @param {number} unitId
 * @param {string} unitName
 * @param {string} expiryDate - ISO date YYYY-MM-DD
 * @returns {string} notification id
 */
export const scheduleAgreementExpiryReminder = (unitId, unitName, expiryDate) => {
  const notificationId = `expiry_${unitId}`;
  const idNum = Math.abs(hashCode(notificationId));

  const expiry = new Date(expiryDate);
  const reminderDate = new Date(expiry);
  reminderDate.setMonth(reminderDate.getMonth() - 3);

  if (reminderDate <= new Date()) {
    // Already past 3-month mark, notify immediately
    PushNotification.localNotification({
      channelId: 'ledger-pro-channel',
      id: idNum,
      title: 'Agreement Expiring Soon',
      message: `Rent agreement for ${unitName} expires on ${expiryDate}. Please renew.`,
      userInfo: { unitId, expiryDate, type: 'expiry' },
    });
  } else {
    PushNotification.localNotificationSchedule({
      channelId: 'ledger-pro-channel',
      id: idNum,
      title: 'Agreement Expiring Soon',
      message: `Rent agreement for ${unitName} will expire on ${expiryDate}. Please renew in time.`,
      date: reminderDate,
      allowWhileIdle: true,
      userInfo: { unitId, expiryDate, type: 'expiry' },
    });
  }

  return String(idNum);
};

/**
 * Cancel a scheduled notification.
 * @param {string|number} notificationId
 */
export const cancelReminder = notificationId => {
  PushNotification.cancelLocalNotification(String(notificationId));
};

const getMonthName = month => {
  const names = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return names[month - 1] || '';
};

const hashCode = str => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
};
