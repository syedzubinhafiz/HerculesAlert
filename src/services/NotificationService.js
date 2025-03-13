// src/services/NotificationService.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, doc, setDoc, query, orderBy, limit, getDocs, getDoc, where, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { firestore, functions } from '../firebase/config';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.lastNotificationResponse = null;
  }

  /**
   * Register for push notifications and get the device token
   */
  async registerForPushNotificationsAsync() {
    let token;
    
    if (Platform.OS === 'android') {
      // Set high-priority channel for Android
      await Notifications.setNotificationChannelAsync('amber-alerts', {
        name: 'Amber Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6347',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return { success: false, message: 'Permission not granted' };
      }
      
      // Get the token
      try {
        // For Expo projects that use EAS
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
      } catch (error) {
        // Fallback for projects without EAS configuration
        token = (await Notifications.getExpoPushTokenAsync()).data;
      }
      
      // Store the token locally
      await this.storeToken(token);
    } else {
      console.log('Must use physical device for push notifications');
      return { success: false, message: 'Must use physical device' };
    }

    return { success: true, token };
  }

  /**
   * Store the push token locally
   */
  async storeToken(token) {
    try {
      await AsyncStorage.setItem('pushToken', token);
      return true;
    } catch (error) {
      console.error('Error storing token:', error);
      return false;
    }
  }

  /**
   * Get the stored push token
   */
  async getToken() {
    try {
      return await AsyncStorage.getItem('pushToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Subscribe to Amber alerts by storing the token in Firestore
   */
  async subscribeToAlerts(token) {
    if (!token) {
      const tokenData = await this.registerForPushNotificationsAsync();
      if (!tokenData.success) {
        return { success: false };
      }
      token = tokenData.token;
    }

    try {
      // Generate a user ID if not exists
      let userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        userId = 'user_' + Math.random().toString(36).substring(2, 15);
        await AsyncStorage.setItem('userId', userId);
      }
      
      // Store token in Firestore
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, {
        expoPushToken: token,
        subscribedToAlerts: true,
        updatedAt: serverTimestamp(),
        platform: Platform.OS,
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error subscribing to alerts:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unsubscribe from Amber alerts
   */
  async unsubscribeFromAlerts() {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return { success: false, error: 'User not found' };
      
      const userRef = doc(firestore, 'users', userId);
      await setDoc(userRef, {
        subscribedToAlerts: false,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing from alerts:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get recent alerts from Firestore
   */
  async getRecentAlerts(limit = 10) {
    try {
      const alertsRef = collection(firestore, 'alerts');
      const alertsQuery = query(
        alertsRef,
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(alertsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }
  
  /**
   * Get details of a specific alert
   */
  async getAlertDetails(alertId) {
    try {
      const alertRef = doc(firestore, 'alerts', alertId);
      const alertDoc = await getDoc(alertRef);
        
      if (!alertDoc.exists()) {
        return null;
      }
      
      return {
        id: alertDoc.id,
        ...alertDoc.data(),
        timestamp: alertDoc.data().timestamp?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error getting alert details:', error);
      return null;
    }
  }

  /**
   * Add notification listeners for the app
   */
  addNotificationListeners(notificationListener, responseListener) {
    const notificationSub = Notifications.addNotificationReceivedListener(notificationListener);
    const responseSub = Notifications.addNotificationResponseReceivedListener(responseListener);
    
    return () => {
      notificationSub.remove();
      responseSub.remove();
    };
  }

  /**
   * Get the last notification that opened the app
   */
  async getLastNotificationResponse() {
    return await Notifications.getLastNotificationResponseAsync();
  }

  /**
   * Send a test notification locally
   */
  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Test Amber Alert",
        body: "This is a test alert for a missing child.",
        data: { 
          type: 'amber_alert',
          testAlert: true,
          timestamp: new Date().toISOString()
        },
      },
      trigger: { seconds: 2 },
    });
  }
}

export default new NotificationService();