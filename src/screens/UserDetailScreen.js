import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  Alert, Modal, TextInput, ActivityIndicator 
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';

const API_URL = 'http://10.0.2.2:5000/api/users';

const FACULTY_LIST = [
  'สำนักวิชาวิทยาศาสตร์',
  'สำนักวิชาเทคโนโลยีสังคม',
  'สำนักวิชาเทคโนโลยีการเกษตร',
  'สำนักวิชาวิศวกรรมศาสตร์',
  'สำนักวิชาแพทยศาสตร์',
  'สำนักวิชาพยาบาลศาสตร์',
  'สำนักวิชาทันตแพทยศาสตร์',
  'สำนักวิชาสาธารณสุขศาสตร์',
  'สำนักวิชาศาสตร์และศิลป์ดิจิทัล'
];

export default function UserDetailScreen({ profile, onBack }) {
  const [userData, setUserData] = useState({
    name: profile?.name || profile?.displayName || 'กรุณาระบุชื่อ-นามสกุล',
    studentId: profile?.studentId || 'B68xxxxx',
    email: profile?.email || '',
    faculty: profile?.faculty || profile?.institute || 'สำนักวิชาวิศวกรรมศาสตร์',
    club: profile?.club || 'ชมรมพัฒนาซอฟต์แวร์'
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [editKey, setEditKey] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.studentId) {
      fetch(`${API_URL}/${profile.studentId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.name) {
            setUserData({
              name: data.name,
              studentId: data.studentId || profile.studentId,
              email: data.email || profile?.email || '',
              faculty: data.institute || data.faculty || 'สำนักวิชาวิศวกรรมศาสตร์',
              club: data.club || 'ชมรมพัฒนาซอฟต์แวร์'
            });
          } else {
            syncUserData(userData);
          }
        })
        .catch(() => syncUserData(userData));
    }
  }, []);

  const syncUserData = async (dataToSync) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: dataToSync.studentId,
          name: dataToSync.name,
          email: dataToSync.email,
          institute: dataToSync.faculty,
          faculty: dataToSync.faculty,
          club: dataToSync.club
        })
      });
    } catch (err) {
      console.error('Failed to sync user data:', err);
    }
  };

  const handleOpenEdit = (key, label, value) => {
    setEditKey(key);
    setEditLabel(label);
    setEditValue(value);
    setModalVisible(true);
  };

  const handleSaveEdit = async (customValue) => {
    const finalValue = (customValue !== undefined ? customValue : editValue).trim();

    if (!finalValue) {
      Alert.alert('แจ้งเตือน', 'กรุณาระบุข้อมูล');
      return;
    }

    const updatedData = { ...userData, [editKey]: finalValue };
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: updatedData.studentId,
          name: updatedData.name,
          email: updatedData.email,
          institute: updatedData.faculty,
          faculty: updatedData.faculty,
          club: updatedData.club
        })
      });

      if (!response.ok) throw new Error('Update failed');

      setUserData(updatedData);
      setModalVisible(false);
      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      Alert.alert('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <TouchableOpacity onPress={onBack} style={{ paddingRight: 10 }}>
          <Ionicons name="chevron-back" size={24} color="#5C3A21" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#5C3A21', flex: 1, textAlign: 'center' }}>
          ข้อมูลผู้ใช้
        </Text>
        <TouchableOpacity onPress={() => Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?')}>
          <Ionicons name="log-out-outline" size={22} color="#5C3A21" />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={styles.largeAvatarCircle}>
          <FontAwesome name="user" size={36} color="#FFF" />
          <TouchableOpacity 
            style={styles.avatarEditBadge}
            onPress={() => Alert.alert('เปลี่ยนรูปโปรไฟล์', 'ฟังก์ชันเลือกรูปภาพ')}
          >
            <Ionicons name="pencil" size={10} color="#FFF" />
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#5C3A21', marginTop: 8 }}>
          {userData.name}
        </Text>
        <Text style={{ fontSize: 12, color: '#888' }}>
          {userData.studentId}
        </Text>
      </View>

      <View style={styles.userDetailCard}>
        {/* ชื่อ - นามสกุล */}
        <TouchableOpacity 
          style={styles.fieldRow}
          onPress={() => handleOpenEdit('name', 'ชื่อ - นามสกุล', userData.name)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ชื่อ - นามสกุล</Text>
            <Text style={styles.fieldValue}>{userData.name}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </TouchableOpacity>

        {/* รหัสนักศึกษา */}
        <TouchableOpacity 
          style={styles.fieldRow}
          onPress={() => handleOpenEdit('studentId', 'รหัสนักศึกษา', userData.studentId)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>รหัสนักศึกษา</Text>
            <Text style={styles.fieldValue}>{userData.studentId}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </TouchableOpacity>

        {/* อีเมล (เพิ่มใหม่) */}
        <TouchableOpacity 
          style={styles.fieldRow}
          onPress={() => handleOpenEdit('email', 'อีเมล', userData.email)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>อีเมล</Text>
            <Text style={styles.fieldValue}>{userData.email || 'ยังไม่ได้ระบุอีเมล'}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </TouchableOpacity>

        {/* สำนักวิชา */}
        <TouchableOpacity 
          style={styles.fieldRow}
          onPress={() => handleOpenEdit('faculty', 'สำนักวิชา', userData.faculty)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>สำนักวิชา</Text>
            <Text style={styles.fieldValue}>{userData.faculty}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </TouchableOpacity>

        {/* ชมรม */}
        <TouchableOpacity 
          style={[styles.fieldRow, { borderBottomWidth: 0 }]}
          onPress={() => handleOpenEdit('club', 'ชมรม', userData.club)}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ชมรม</Text>
            <Text style={styles.fieldValue}>{userData.club}</Text>
          </View>
          <Ionicons name="pencil-outline" size={16} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Modal Popup แก้ไขข้อมูล */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เลือก / แก้ไข{editLabel}</Text>
            
            {editKey === 'faculty' ? (
              <ScrollView style={{ maxHeight: 320, marginBottom: 16 }}>
                {FACULTY_LIST.map((facultyName, index) => {
                  const isSelected = editValue === facultyName;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.facultyOptionItem,
                        isSelected && styles.facultyOptionItemSelected
                      ]}
                      onPress={() => setEditValue(facultyName)}
                    >
                      <Text style={[
                        styles.facultyOptionText,
                        isSelected && styles.facultyOptionTextSelected
                      ]}>
                        {facultyName}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#5C3A21" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <TextInput
                style={styles.input}
                value={editValue}
                onChangeText={setEditValue}
                placeholder={`กรอก${editLabel}`}
                keyboardType={editKey === 'email' ? 'email-address' : 'default'}
                autoCapitalize="none"
                autoFocus
              />
            )}

            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.btn, styles.btnCancel]} 
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={styles.btnCancelText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.btn, styles.btnSave]} 
                onPress={() => handleSaveEdit()}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnSaveText}>บันทึก</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '90%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#5C3A21', marginBottom: 14 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, marginBottom: 18, color: '#333' },
  facultyOptionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 6, backgroundColor: '#FDFDFD', borderWidth: 1, borderColor: '#EEE' },
  facultyOptionItemSelected: { backgroundColor: '#FBECE3', borderColor: '#E88147' },
  facultyOptionText: { fontSize: 13, color: '#444' },
  facultyOptionTextSelected: { fontWeight: 'bold', color: '#5C3A21' },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  btn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  btnCancel: { backgroundColor: '#F0F0F0' },
  btnCancelText: { color: '#666', fontWeight: '600' },
  btnSave: { backgroundColor: '#5C3A21' },
  btnSaveText: { color: '#FFF', fontWeight: 'bold' }
});