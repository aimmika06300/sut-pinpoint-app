import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function NotificationScreen({ notifications, setNotifications }) {
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={styles.profileImageContainer}>
          <FontAwesome name="user" size={32} color="#F28C4B" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>USER NAME</Text>
          <Text style={styles.userId}>BXXXXXX</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <Text style={styles.notifTitle}>การแจ้งเตือน</Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={{ color: '#F28C4B', fontSize: 12, fontWeight: 'bold' }}>อ่านทั้งหมด</Text>
        </TouchableOpacity>
      </View>

      {notifications.map((n) => (
        <View key={n.id} style={[styles.notifCard, n.unread && styles.unreadNotifCard]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name={n.unread ? 'notifications' : 'notifications-outline'} size={18} color="#F28C4B" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', flex: 1 }}>{n.title}</Text>
            <Text style={{ fontSize: 10, color: '#888' }}>{n.time}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#555', marginLeft: 26 }}>{n.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16, paddingBottom: 80 },
  headerCard: { backgroundColor: '#F28C4B', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  profileImageContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  userInfo: { justifyContent: 'center' },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#5C3A21' },
  userId: { fontSize: 12, color: '#5C3A21', opacity: 0.8 },
  notifTitle: { fontSize: 16, fontWeight: 'bold', color: '#5C3A21' },
  notifCard: { backgroundColor: '#FFF', borderRadius: 14, padding: 12, marginBottom: 8 },
  unreadNotifCard: { borderLeftWidth: 4, borderLeftColor: '#F28C4B' },
});