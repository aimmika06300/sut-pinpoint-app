import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({
  navigation, // 🟢 เพิ่มการรับ prop navigation ตรงนี้
  profile,
  isLoggedIn = false,
  onLogin,
  notificationsEnabled,
  setNotificationsEnabled,
  onGoToUserDetail,
  onGoToTimetable,
}) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.profileScreenTitle}>Profile</Text>

      {/* Header Profile Card */}
      <View style={styles.profileMainHeader}>
        <View style={[styles.largeAvatarCircle, !isLoggedIn && styles.guestAvatarCircle]}>
          <FontAwesome name="user" size={36} color="#FFF" />
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5C3A21' }}>
            {isLoggedIn ? profile?.name : 'ผู้ใช้งานทั่วไป'}
          </Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            {isLoggedIn ? profile?.studentId : 'ยังไม่ได้เข้าสู่ระบบ'}
          </Text>
        </View>

        {isLoggedIn ? (
          <TouchableOpacity style={styles.editProfileBtn} onPress={onGoToUserDetail}>
            <Ionicons name="pencil" size={12} color="#5C3A21" />
            <Text style={{ fontSize: 11, color: '#5C3A21', fontWeight: 'bold' }}> แก้ไขโปรไฟล์</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.loginBtn} onPress={onLogin}>
            <Text style={{ fontSize: 11, color: '#FFF', fontWeight: 'bold' }}>เข้าสู่ระบบ</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Menu Options */}
      <View style={styles.menuListContainer}>
        <TouchableOpacity
          style={styles.profileMenuItem}
          onPress={isLoggedIn ? onGoToUserDetail : onLogin}
        >
          <Ionicons name="person-outline" size={20} color="#5C3A21" style={{ marginRight: 12 }} />
          <Text style={styles.menuItemText}>ข้อมูลผู้ใช้</Text>
          <Ionicons name="chevron-forward" size={18} color="#B57A55" />
        </TouchableOpacity>

        <View style={styles.profileMenuItem}>
          <Ionicons name="notifications-outline" size={20} color="#5C3A21" style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.menuItemText}>การแจ้งเตือน</Text>
            <Text style={{ fontSize: 10, color: '#888' }}>{notificationsEnabled ? 'เปิด' : 'ปิด'}</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#F28C4B' }}
            thumbColor={notificationsEnabled ? '#FFF' : '#f4f3f4'}
          />
        </View>

        {isLoggedIn && (
          <TouchableOpacity style={styles.profileMenuItem} onPress={onGoToTimetable}>
            <Ionicons name="book-outline" size={20} color="#5C3A21" style={{ marginRight: 12 }} />
            <Text style={styles.menuItemText}>ตารางเรียน</Text>
            <Ionicons name="chevron-forward" size={18} color="#B57A55" />
          </TouchableOpacity>
        )}
      </View>

      {/* 🟢 ปุ่มสีน้ำตาลสำหรับ เข้าสู่ระบบ / สมัครสมาชิก */}
      {!isLoggedIn && (
        <TouchableOpacity
          style={styles.fullLoginBtn}
          onPress={() => navigation.navigate('Login')}
        >
          <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.fullLoginBtnText}>เข้าสู่ระบบ / สมัครสมาชิก</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16, paddingBottom: 20 },
  profileScreenTitle: { fontSize: 22, fontWeight: 'bold', color: '#5C3A21', marginBottom: 14 },
  profileMainHeader: { backgroundColor: '#FFF', borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  largeAvatarCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F28C4B', justifyContent: 'center', alignItems: 'center' },
  guestAvatarCircle: { backgroundColor: '#B0BEC5' },
  editProfileBtn: { backgroundColor: '#F8F4E9', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  loginBtn: { backgroundColor: '#F28C4B', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 },
  menuListContainer: { backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 14 },
  profileMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuItemText: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },
  fullLoginBtn: { backgroundColor: '#5C4033', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  fullLoginBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});