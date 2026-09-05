import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Pressable, Alert, } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function NotificationScreen({ notifications, setNotifications, profile, }) {

  const isLoggedIn = profile?.isLoggedIn || false;
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบการแจ้งเตือนนี้หรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },
        {
          text: 'ยืนยัน',
          style: 'destructive',
          onPress: () => {
            setNotifications(
              notifications.filter((n) => n.id !== id)
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={styles.profileImageContainer}>
          <FontAwesome name="user" size={32} color="#F28C4B" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {isLoggedIn ? profile?.name : 'ผู้ใช้งานทั่วไป'}
          </Text>

          <Text style={styles.userId}>
            {isLoggedIn ? (profile?.email || profile?.studentId) : 'ยังไม่ได้เข้าสู่ระบบ'}
          </Text>
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
          <Pressable
            style={styles.deleteButton}
            onPress={() => confirmDelete(n.id)}
          >
            <Text style={styles.deleteButtonText}>-</Text>
          </Pressable>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name={n.unread ? 'notifications' : 'notifications-outline'} size={18} color="#F28C4B" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#333', flex: 1 }}>{n.title}</Text>
          </View>
          <Text style={{ fontSize: 12, color: '#555', marginLeft: 26 }}>{n.body}</Text>
          <Text style={styles.notifTime}>
            {n.time}
          </Text>
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
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#999',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  deleteButtonText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 18,
  },
  notifTime: {
    position: 'absolute',
    bottom: 8,
    right: 10,
    fontSize: 10,
    color: '#888',
  },
});