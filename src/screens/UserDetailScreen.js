import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

export default function UserDetailScreen({ profile, onBack }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={onBack} style={{ paddingRight: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#5C3A21" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#5C3A21', flex: 1, textAlign: 'center' }}>ข้อมูลผู้ใช้</Text>
        <TouchableOpacity onPress={() => Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?')}>
          <Ionicons name="log-out-outline" size={22} color="#5C3A21" />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={styles.largeAvatarCircle}>
          <FontAwesome name="user" size={36} color="#FFF" />
          <View style={styles.avatarEditBadge}>
            <Ionicons name="pencil" size={10} color="#FFF" />
          </View>
        </View>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#5C3A21', marginTop: 8 }}>{profile.name}</Text>
        <Text style={{ fontSize: 12, color: '#888' }}>{profile.studentId}</Text>
      </View>

      <View style={styles.userDetailCard}>
        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ชื่อ - นามสกุล</Text>
            <Text style={styles.fieldValue}>{profile.name}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </View>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>รหัสนักศึกษา</Text>
            <Text style={styles.fieldValue}>{profile.studentId}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </View>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>สำนักวิชา</Text>
            <Text style={styles.fieldValue}>{profile.faculty}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </View>

        <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ชมรม</Text>
            <Text style={styles.fieldValue}>{profile.club}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16, paddingBottom: 80 },
  largeAvatarCircle: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#F28C4B', justifyContent: 'center', alignItems: 'center' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#5C4033', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  userDetailCard: { backgroundColor: '#FFF', borderRadius: 18, paddingHorizontal: 14 },
  fieldRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  fieldLabel: { fontSize: 11, color: '#888' },
  fieldValue: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 2 },
});