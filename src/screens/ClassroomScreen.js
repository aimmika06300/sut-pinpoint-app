import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const DAYS = [
  { label: 'S', key: 0, fullName: 'Sunday' },
  { label: 'M', key: 1, fullName: 'Monday' },
  { label: 'T', key: 2, fullName: 'Tuesday' },
  { label: 'W', key: 3, fullName: 'Wednesday' },
  { label: 'T', key: 4, fullName: 'Thursday' },
  { label: 'F', key: 5, fullName: 'Friday' },
  { label: 'S', key: 6, fullName: 'Saturday' },
];

export default function ClassroomScreen({ onNavigateToMap, onAddNotification }) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(4);
  
  const [scheduleList, setScheduleList] = useState([
    {
      id: '1',
      dayIndex: 4,
      code: '523351',
      name: 'WEB APPLICATION DEV',
      time: '13:00 - 16:00 น.',
      building: 'อาคารเครื่องมือ 1 (F1)',
      room: 'F01-202',
    },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setCode('');
    setName('');
    setTime('13:00 - 16:00 น.');
    setBuilding('');
    setRoom('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setCode(item.code);
    setName(item.name);
    setTime(item.time);
    setBuilding(item.building);
    setRoom(item.room);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!code || !name) {
      Alert.alert('กรุณากรอกข้อมูล', 'กรุณากรอกรหัสวิชาและชื่อวิชาให้ครบถ้วน');
      return;
    }

    if (editingItem) {
      setScheduleList(scheduleList.map(item => 
        item.id === editingItem.id 
          ? { ...item, code, name, time, building, room } 
          : item
      ));
    } else {
      const newItem = {
        id: Date.now().toString(),
        dayIndex: selectedDayIndex,
        code,
        name,
        time,
        building,
        room,
      };
      setScheduleList([...scheduleList, newItem]);

      // 🔹 สร้างการแจ้งเตือนใหม่ส่งไปยังหน้า Notification
      if (onAddNotification) {
        onAddNotification({
          id: Date.now().toString(),
          title: 'เพิ่มรายวิชาสำเร็จ',
          message: `เพิ่มวิชา ${code} ${name} (ห้อง ${room || 'ไม่ระบุ'}) เรียบร้อยแล้ว`,
          time: 'เมื่อครู่นี้',
          unread: true,
        });
      }
    }
    setModalVisible(false);
  };

  const handleDelete = (id) => {
    Alert.alert('ยืนยันการลบ', 'คุณต้องการลบรายวิชานี้ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { 
        text: 'ลบ', 
        style: 'destructive', 
        onPress: () => setScheduleList(scheduleList.filter(item => item.id !== id)) 
      },
    ]);
  };

  const currentDaySchedules = scheduleList.filter(item => item.dayIndex === selectedDayIndex);

  return (
    <View style={styles.container}>
      <View style={styles.topHeader}>
        <View style={styles.daysRow}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayCircle,
                selectedDayIndex === day.key && styles.activeDayCircle,
              ]}
              onPress={() => setSelectedDayIndex(day.key)}
            >
              <Text style={[styles.dayText, selectedDayIndex === day.key && styles.activeDayText]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAddModal}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentDaySchedules.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ color: '#888', fontSize: 14 }}>ไม่มีรายการวิชาเรียนในวันนี้</Text>
          </View>
        ) : (
          currentDaySchedules.map((item) => (
            <View key={item.id} style={styles.cardWrapper}>
              <View style={styles.cardHeaderAction}>
                <TouchableOpacity onPress={() => handleOpenEditModal(item)} style={{ marginRight: 10 }}>
                  <Ionicons name="create-outline" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardInner}>
                <Text style={styles.subjectCode}>{item.code}</Text>
                <Text style={styles.subjectName}>{item.name}</Text>
                
                <View style={styles.infoRow}>
                  <Ionicons name="alarm-outline" size={16} color="#E53935" style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>{item.time}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#E53935" style={{ marginRight: 6 }} />
                  <Text style={styles.infoText}>
                    {item.building} {item.room ? `(${item.room})` : ''}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.navigateBtn} 
                  onPress={() => onNavigateToMap && onNavigateToMap(item.building)}
                >
                  <FontAwesome name="location-arrow" size={14} color="#FFF" style={{ marginRight: 6 }} />
                  <Text style={styles.navigateBtnText}>นำทางไปตึกเรียน</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'แก้ไขรายวิชา' : 'เพิ่มรายวิชาเรียน'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="รหัสวิชา (เช่น 523351)"
              value={code}
              onChangeText={setCode}
            />
            <TextInput
              style={styles.input}
              placeholder="ชื่อรายวิชา"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="เวลาเรียน (เช่น 13:00 - 16:00 น.)"
              value={time}
              onChangeText={setTime}
            />
            <TextInput
              style={styles.input}
              placeholder="อาคารเรียน (เช่น อาคารเครื่องมือ 1)"
              value={building}
              onChangeText={setBuilding}
            />
            <TextInput
              style={styles.input}
              placeholder="ห้องเรียน (เช่น F01-202)"
              value={room}
              onChangeText={setRoom}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setModalVisible(false)}>
                <Text style={{ color: '#666', fontWeight: 'bold' }}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={handleSave}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F4E9' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
  daysRow: { flexDirection: 'row', gap: 6 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EADEC9', justifyContent: 'center', alignItems: 'center' },
  activeDayCircle: { backgroundColor: '#F28C4B' },
  dayText: { fontSize: 13, color: '#FFF', fontWeight: 'bold' },
  activeDayText: { color: '#FFF' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#8B8B8B', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  cardWrapper: { backgroundColor: '#F28C4B', borderRadius: 20, padding: 12, marginBottom: 16 },
  cardHeaderAction: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  cardInner: { backgroundColor: '#FFF', borderRadius: 16, padding: 16 },
  subjectCode: { fontSize: 16, fontWeight: 'bold', color: '#F28C4B', marginBottom: 4 },
  subjectName: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { fontSize: 12, color: '#666', flexShrink: 1 },
  navigateBtn: { backgroundColor: '#5C3A21', borderRadius: 12, paddingVertical: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  navigateBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#5C3A21', marginBottom: 14, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 14 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  cancelBtn: { backgroundColor: '#EEE' },
  saveBtn: { backgroundColor: '#F28C4B' },
});