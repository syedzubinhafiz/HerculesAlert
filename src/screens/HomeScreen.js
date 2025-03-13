// src/screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Sample data for alerts
const sampleAlerts = [
  {
    id: '1',
    title: 'AMBER ALERT',
    childName: 'Sarah Johnson',
    location: 'Central Park, New York',
    description: '8-year-old female, blonde hair, blue eyes, last seen wearing a pink jacket and jeans.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    title: 'MISSING CHILD',
    childName: 'Michael Chen',
    location: 'Mission District, San Francisco',
    description: '5-year-old male, black hair, brown eyes, last seen in red t-shirt and shorts.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
  },
];

const HomeScreen = ({ navigation }) => {
  const [alerts, setAlerts] = useState([]);
  const [demoMode, setDemoMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Generate a random alert
  const generateRandomAlert = () => {
    const names = ['James Smith', 'Maria Garcia', 'David Johnson', 'Sarah Lee', 'Robert Kim', 'Lisa Wong'];
    const locations = ['Downtown Mall', 'Central Park', 'Westfield Plaza', 'Main Street', 'Oakridge Elementary School', 'Riverside Park'];
    const descriptions = [
      '4-year-old boy, brown hair, wearing blue shirt and jeans',
      '7-year-old girl, blonde hair, wearing pink dress',
      '6-year-old boy, black hair, wearing green t-shirt and shorts',
      '9-year-old girl, red hair, wearing yellow shirt and white skirt',
      '5-year-old boy, blonde hair, wearing grey hoodie and black pants',
      '8-year-old girl, brown hair, wearing purple jacket and leggings'
    ];
    
    return {
      id: Date.now().toString(),
      title: Math.random() > 0.5 ? 'AMBER ALERT' : 'MISSING CHILD',
      childName: names[Math.floor(Math.random() * names.length)],
      location: locations[Math.floor(Math.random() * locations.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      timestamp: new Date(),
    };
  };
  
  // Send a test notification
  const scheduleNotification = async (alert) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: alert.title,
        body: `${alert.childName} missing from ${alert.location}`,
        data: { alertId: alert.id },
      },
      trigger: { seconds: 1 },
    });
    
    setNotificationCount(prev => prev + 1);
  };
  
  // Toggle demo mode
  const toggleDemoMode = (value) => {
    setDemoMode(value);
    if (value) {
      Alert.alert(
        'Demo Mode Enabled',
        'You will receive a sample notification every 30 seconds.',
        [{ text: 'OK' }]
      );
      setAlerts([...sampleAlerts]);
    } else {
      setAlerts([]);
    }
  };
  
  // Set up notification demo
  useEffect(() => {
    let interval;
    
    if (demoMode) {
      // Initial notification
      const initialAlert = generateRandomAlert();
      setAlerts(prev => [initialAlert, ...prev]);
      scheduleNotification(initialAlert);
      
      // Set up interval for notifications
      interval = setInterval(() => {
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev]);
        scheduleNotification(newAlert);
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [demoMode]);
  
  // Set up notification response handler
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const alertId = response.notification.request.content.data.alertId;
      navigation.navigate('AlertDetails', { alertId });
    });
    
    return () => subscription.remove();
  }, []);
  
  // Render an individual alert item
  const renderAlertItem = ({ item }) => (
    <TouchableOpacity
      style={styles.alertItem}
      onPress={() => navigation.navigate('AlertDetails', { alertId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertTime}>{formatDate(item.timestamp)}</Text>
      </View>
      
      <View style={styles.alertDetails}>
        <View style={styles.placeholderThumbnail}>
          <Ionicons name="person" size={30} color="#FF634780" />
        </View>
        
        <View style={styles.alertContent}>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color="#FF6347" style={styles.infoIcon} />
            <Text style={styles.childName}>{item.childName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color="#FF6347" style={styles.infoIcon} />
            <Text style={styles.alertLocation} numberOfLines={1}>{item.location}</Text>
          </View>
          
          <Text style={styles.alertDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recent Alerts</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.demoContainer}>
        <View style={styles.demoSwitch}>
          <Text style={styles.demoText}>Demo Mode</Text>
          <Switch
            value={demoMode}
            onValueChange={toggleDemoMode}
            trackColor={{ false: '#D1D1D6', true: '#FF634780' }}
            thumbColor={demoMode ? '#FF6347' : '#F4F3F4'}
          />
        </View>
        {demoMode && (
          <Text style={styles.notificationCount}>
            Notifications sent: {notificationCount}
          </Text>
        )}
      </View>
      
      {alerts.length > 0 ? (
        <FlatList
          data={alerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={60} color="#CCCCCC" />
          <Text style={styles.emptyText}>No recent alerts</Text>
          <Text style={styles.helpText}>
            Enable Demo Mode to see sample alerts
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  demoContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  demoSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  demoText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  notificationCount: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  alertItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FF634710',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  alertDetails: {
    flexDirection: 'row',
    padding: 16,
  },
  placeholderThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoIcon: {
    marginRight: 4,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertLocation: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default HomeScreen;