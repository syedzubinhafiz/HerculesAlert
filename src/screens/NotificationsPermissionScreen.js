// src/screens/NotificationsPermissionScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsPermissionScreen = ({ onRequestPermission }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="notifications" size={80} color="#FF6347" />
        </View>
        
        <Text style={styles.title}>Enable Notifications</Text>
        
        <Text style={styles.description}>
          To receive important Amber Alerts, please allow notifications. These alerts can help locate missing children and potentially save lives.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#FF6347" style={styles.featureIcon} />
            <Text style={styles.featureText}>Receive critical missing child alerts</Text>
          </View>
          
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#FF6347" style={styles.featureIcon} />
            <Text style={styles.featureText}>Get details to help identify missing children</Text>
          </View>
          
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={24} color="#FF6347" style={styles.featureIcon} />
            <Text style={styles.featureText}>Be notified immediately when alerts are issued</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={onRequestPermission}
        >
          <Text style={styles.buttonText}>Allow Notifications</Text>
        </TouchableOpacity>
        
        <Text style={styles.note}>
          You can change notification settings at any time in the app settings.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FF63471A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  button: {
    backgroundColor: '#FF6347',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
});

export default NotificationsPermissionScreen;