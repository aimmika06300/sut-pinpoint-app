import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const DAYS = [
  { label: 'S', key: 0, fullName: 'Sunday' },
  { label: 'M', key: 1, fullName: 'Monday' },
  { label: 'T', key: 2, fullName: 'Tuesday' },
  { label: 'W', key: 3, fullName: 'Wednesday' },
  { label: 'T', key: 4, fullName: 'Thursday' },
  { label: 'F', key: 5, fullName: 'Friday' },
  { label: 'S', key: 6, fullName: 'Saturday' },
];

export default function ClassroomScreen({
  scheduleList,
  setScheduleList,
  selectedDayIndex,
  setSelectedDayIndex,
  onNavigateToMap,
  onAddNotification,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // -----------------------------
  // ข้อมูลวิชา
  // -----------------------------
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [time, setTime] = useState('');

  // -----------------------------
  // อาคาร / ห้อง
  // -----------------------------
  const [building, setBuilding] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [room, setRoom] = useState('');

  // -----------------------------
  // ข้อมูลจาก Firebase
  // -----------------------------
  const [buildings, setBuildings] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);

  // -----------------------------
  // เปิด/ปิดตัวเลือก
  // -----------------------------
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [showRoomList, setShowRoomList] = useState(false);

  // =========================================================
  // โหลดข้อมูลอาคาร + ห้องจาก Firebase
  // =========================================================
  useEffect(() => {
    loadLocations();
  }, []);

  // =========================================================
  // โหลดตารางเรียนของ User จาก Firebase
  // =========================================================
  useEffect(() => {
    let unsubscribe;

    const listenToUser = () => {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          console.log('ยังไม่มีผู้ใช้ Login');
          setScheduleList([]);
          setLoadingSchedules(false);
          return;
        }

        try {
          setLoadingSchedules(true);

          console.log(
            'กำลังโหลดตารางเรียนของ UID:',
            user.uid
          );

          const schedulesSnapshot = await getDocs(
            collection(
              db,
              'users',
              user.uid,
              'schedules'
            )
          );

          const schedules = schedulesSnapshot.docs.map(
            (item) => {
              const data = item.data();

              return {
                id: item.id,

                dayIndex:
                  typeof data.dayIndex === 'number'
                    ? data.dayIndex
                    : 0,

                code: data.code || '',
                name: data.name || '',
                time: data.time || '',

                // รองรับทั้งข้อมูลเก่าและข้อมูลใหม่
                building_id:
                  data.building_id ||
                  data.buildingId ||
                  '',

                building:
                  data.building ||
                  data.building_name ||
                  '',

                room: data.room || '',
              };
            }
          );

          console.log(
            'ตารางเรียนจาก Firebase:',
            schedules
          );

          // สำคัญ:
          // ใช้ข้อมูล Firebase แทน scheduleList เดิม
          // เพื่อไม่ให้ข้อมูล default เช่น 523351 ค้างอยู่
          setScheduleList(schedules);
        } catch (error) {
          console.log(
            'Load schedules error:',
            error
          );

          Alert.alert(
            'โหลดตารางเรียนไม่สำเร็จ',
            'ไม่สามารถโหลดข้อมูลตารางเรียนจาก Firebase ได้'
          );
        } finally {
          setLoadingSchedules(false);
        }
      });
    };

    listenToUser();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setScheduleList]);

  // =========================================================
  // โหลดข้อมูลอาคาร + ห้อง
  // =========================================================
  const loadLocations = async () => {
    try {
      setLoadingLocations(true);

      // โหลด Buildings
      const buildingsSnapshot = await getDocs(
        collection(db, 'buildings')
      );

      const buildingData = buildingsSnapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      );

      // โหลด Classrooms
      const classroomsSnapshot = await getDocs(
        collection(db, 'classrooms')
      );

      const classroomData =
        classroomsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

      setBuildings(buildingData);
      setClassrooms(classroomData);

      console.log('Buildings:', buildingData);
      console.log('Classrooms:', classroomData);
    } catch (error) {
      console.log(
        'Load locations error:',
        error
      );

      Alert.alert(
        'โหลดข้อมูลไม่สำเร็จ',
        'ไม่สามารถโหลดข้อมูลอาคารและห้องจาก Firebase ได้'
      );
    } finally {
      setLoadingLocations(false);
    }
  };

  // =========================================================
  // ห้องที่อยู่ในอาคารที่เลือก
  // =========================================================
  const filteredRooms = classrooms.filter(
    (item) => {
      if (!buildingId) return false;

      return (
        item.building_id === buildingId ||
        item.building_name === building
      );
    }
  );

  // =========================================================
  // หาชื่ออาคารจาก building_id
  // =========================================================
  const getBuildingName = (
    buildingIdValue,
    fallback = ''
  ) => {
    const foundBuilding = buildings.find(
      (item) =>
        item.id === buildingIdValue ||
        item.building_id === buildingIdValue
    );

    if (foundBuilding) {
      return (
        foundBuilding.name ||
        foundBuilding.building_name ||
        foundBuilding.building_id ||
        foundBuilding.id
      );
    }

    return (
      fallback ||
      buildingIdValue ||
      '-'
    );
  };

  // =========================================================
  // เปิด Modal เพิ่ม
  // =========================================================
  const handleOpenAddModal = () => {
    setEditingItem(null);

    setCode('');
    setName('');
    setTime('13:00 - 16:00 น.');

    setBuilding('');
    setBuildingId('');
    setRoom('');

    setShowBuildingList(false);
    setShowRoomList(false);

    setModalVisible(true);
  };

  // =========================================================
  // เปิด Modal แก้ไข
  // =========================================================
  const handleOpenEditModal = (item) => {
    setEditingItem(item);

    setCode(item.code || '');
    setName(item.name || '');
    setTime(item.time || '');

    // รองรับทั้ง building_id และ buildingId
    const savedBuildingId =
      item.building_id ||
      item.buildingId ||
      '';

    const savedBuildingName =
      item.building ||
      item.building_name ||
      getBuildingName(
        savedBuildingId,
        ''
      );

    setBuilding(savedBuildingName);
    setBuildingId(savedBuildingId);
    setRoom(item.room || '');

    setShowBuildingList(false);
    setShowRoomList(false);

    setModalVisible(true);
  };

  // =========================================================
  // เลือกอาคาร
  // =========================================================
  const handleSelectBuilding = (item) => {
    const selectedBuildingId = item.id;

    const selectedBuildingName =
      item.name ||
      item.building_name ||
      item.building_id ||
      item.id ||
      '';

    setBuilding(selectedBuildingName);
    setBuildingId(selectedBuildingId);

    // เมื่อเปลี่ยนอาคาร ต้องล้างห้องเดิม
    setRoom('');

    setShowBuildingList(false);
    setShowRoomList(false);
  };

  // =========================================================
  // เลือกห้อง
  // =========================================================
  const handleSelectRoom = (item) => {
    setRoom(item.id);
    setShowRoomList(false);
  };

  // =========================================================
  // บันทึกข้อมูลลง Firebase
  // =========================================================
  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      Alert.alert(
        'กรุณากรอกข้อมูล',
        'กรุณากรอกรหัสวิชาและชื่อวิชาให้ครบถ้วน'
      );
      return;
    }

    if (!building) {
      Alert.alert(
        'กรุณาเลือกอาคาร',
        'กรุณาเลือกอาคารเรียนก่อนบันทึก'
      );
      return;
    }

    if (!room) {
      Alert.alert(
        'กรุณาเลือกห้อง',
        'กรุณาเลือกห้องเรียนก่อนบันทึก'
      );
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert(
        'ไม่พบผู้ใช้งาน',
        'กรุณาเข้าสู่ระบบใหม่อีกครั้ง'
      );
      return;
    }

    try {
      const userId = currentUser.uid;

      // ============================================
      // กรณีแก้ไข
      // ============================================
      if (editingItem) {
        const updatedItem = {
          id: editingItem.id,

          code: code.trim(),
          name: name.trim(),
          time: time.trim(),

          building: building,

          // ใช้ building_id เป็นหลัก
          building_id: buildingId,

          room: room,

          dayIndex: editingItem.dayIndex,
        };

        const scheduleRef = doc(
          db,
          'users',
          userId,
          'schedules',
          editingItem.id
        );

        await setDoc(
          scheduleRef,
          updatedItem,
          {
            merge: true,
          }
        );

        setScheduleList((prev) =>
          prev.map((item) =>
            item.id === editingItem.id
              ? updatedItem
              : item
          )
        );

        setModalVisible(false);

        Alert.alert(
          'สำเร็จ',
          `แก้ไขวิชา ${code} เรียบร้อยแล้ว`
        );

        return;
      }

      // ============================================
      // กรณีเพิ่มใหม่
      // ============================================
      const newId =
        Date.now().toString();

      const newItem = {
        id: newId,

        dayIndex: selectedDayIndex,

        code: code.trim(),
        name: name.trim(),
        time: time.trim(),

        building: building,

        // เปลี่ยนจาก buildingId เป็น building_id
        building_id: buildingId,

        room: room,
      };

      const scheduleRef = doc(
        db,
        'users',
        userId,
        'schedules',
        newId
      );

      await setDoc(
        scheduleRef,
        newItem
      );

      setScheduleList((prev) => [
        ...prev,
        newItem,
      ]);

      // แจ้งเตือน
      if (onAddNotification) {
        onAddNotification({
          id: Date.now().toString(),
          title: 'เพิ่มรายวิชาสำเร็จ',
          message:
            `เพิ่มวิชา ${code} ${name} ` +
            `(ห้อง ${room}) เรียบร้อยแล้ว`,
          time: 'เมื่อครู่นี้',
          unread: true,
        });
      }

      setModalVisible(false);

      Alert.alert(
        'เพิ่มรายวิชาสำเร็จ',
        `เพิ่มวิชา ${code} ${name} เรียบร้อยแล้ว`
      );
    } catch (error) {
      console.log(
        'Save schedule error:',
        error
      );

      Alert.alert(
        'บันทึกไม่สำเร็จ',
        'ไม่สามารถบันทึกข้อมูลลง Firebase ได้'
      );
    }
  };

  // =========================================================
  // ลบวิชา
  // =========================================================
  const handleDelete = (id) => {
    Alert.alert(
      'ยืนยันการลบ',
      'คุณต้องการลบรายวิชานี้ใช่หรือไม่?',
      [
        {
          text: 'ยกเลิก',
          style: 'cancel',
        },

        {
          text: 'ลบ',
          style: 'destructive',

          onPress: async () => {
            const currentUser =
              auth.currentUser;

            if (!currentUser) {
              Alert.alert(
                'ไม่พบผู้ใช้งาน',
                'กรุณาเข้าสู่ระบบใหม่อีกครั้ง'
              );
              return;
            }

            try {
              await deleteDoc(
                doc(
                  db,
                  'users',
                  currentUser.uid,
                  'schedules',
                  id
                )
              );

              setScheduleList((prev) =>
                prev.filter(
                  (item) =>
                    item.id !== id
                )
              );

              Alert.alert(
                'สำเร็จ',
                'ลบรายวิชาเรียบร้อยแล้ว'
              );
            } catch (error) {
              console.log(
                'Delete schedule error:',
                error
              );

              Alert.alert(
                'ลบไม่สำเร็จ',
                'ไม่สามารถลบข้อมูลจาก Firebase ได้'
              );
            }
          },
        },
      ]
    );
  };

  // =========================================================
  // วิชาของวันที่เลือก
  // =========================================================
  const currentDaySchedules =
    scheduleList.filter(
      (item) =>
        item.dayIndex ===
        selectedDayIndex
    );

  // =========================================================
  // UI
  // =========================================================
  return (
    <View style={styles.container}>

      {/* ================================================
          HEADER
      ================================================= */}
      <View style={styles.topHeader}>

        <View style={styles.daysRow}>
          {DAYS.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={[
                styles.dayCircle,
                selectedDayIndex === day.key &&
                  styles.activeDayCircle,
              ]}
              onPress={() =>
                setSelectedDayIndex(
                  day.key
                )
              }
            >
              <Text
                style={[
                  styles.dayText,
                  selectedDayIndex === day.key &&
                    styles.activeDayText,
                ]}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={
            handleOpenAddModal
          }
        >
          <Ionicons
            name="add"
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>

      </View>

      {/* ================================================
          SCHEDULE LIST
      ================================================= */}
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {loadingSchedules ? (

          <View style={styles.emptyContainer}>

            <ActivityIndicator
              size="small"
              color="#F28C4B"
            />

            <Text
              style={{
                color: '#888',
                fontSize: 14,
                marginTop: 10,
              }}
            >
              กำลังโหลดตารางเรียน...
            </Text>

          </View>

        ) : currentDaySchedules.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Text
              style={{
                color: '#888',
                fontSize: 14,
              }}
            >
              ไม่มีรายการวิชาเรียนในวันนี้
            </Text>

          </View>

        ) : (

          currentDaySchedules.map(
            (item) => (

              <View
                key={item.id}
                style={styles.cardWrapper}
              >

                <View
                  style={
                    styles.cardHeaderAction
                  }
                >

                  <TouchableOpacity
                    onPress={() =>
                      handleOpenEditModal(
                        item
                      )
                    }
                    style={{
                      marginRight: 10,
                    }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      handleDelete(
                        item.id
                      )
                    }
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#FFF"
                    />
                  </TouchableOpacity>

                </View>

                <View
                  style={styles.cardInner}
                >

                  <Text
                    style={
                      styles.subjectCode
                    }
                  >
                    {item.code}
                  </Text>

                  <Text
                    style={
                      styles.subjectName
                    }
                  >
                    {item.name}
                  </Text>

                  <View
                    style={styles.infoRow}
                  >

                    <Ionicons
                      name="alarm-outline"
                      size={16}
                      color="#E53935"
                      style={{
                        marginRight: 6,
                      }}
                    />

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      {item.time}
                    </Text>

                  </View>

                  <View
                    style={styles.infoRow}
                  >

                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#E53935"
                      style={{
                        marginRight: 6,
                      }}
                    />

                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      {getBuildingName(
                        item.building_id ||
                          item.buildingId,
                        item.building
                      )}

                      {item.room
                        ? ` (${item.room})`
                        : ''}
                    </Text>

                  </View>

                  <TouchableOpacity
                    style={
                      styles.navigateBtn
                    }
                    onPress={() =>
                      onNavigateToMap &&
                      onNavigateToMap(
                        item.building ||
                          getBuildingName(
                            item.building_id ||
                              item.buildingId
                          )
                      )
                    }
                  >

                    <FontAwesome
                      name="location-arrow"
                      size={14}
                      color="#FFF"
                      style={{
                        marginRight: 6,
                      }}
                    />

                    <Text
                      style={
                        styles.navigateBtnText
                      }
                    >
                      นำทางไปตึกเรียน
                    </Text>

                  </TouchableOpacity>

                </View>

              </View>

            )
          )

        )}

      </ScrollView>

      {/* ================================================
          ADD / EDIT MODAL
      ================================================= */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() =>
          setModalVisible(false)
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <View
            style={
              styles.modalContent
            }
          >

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                {editingItem
                  ? 'แก้ไขรายวิชา'
                  : 'เพิ่มรายวิชาเรียน'}
              </Text>

              {/* รหัสวิชา */}
              <TextInput
                style={styles.input}
                placeholder="รหัสวิชา (เช่น 523351)"
                placeholderTextColor="#999"
                value={code}
                onChangeText={setCode}
              />

              {/* ชื่อวิชา */}
              <TextInput
                style={styles.input}
                placeholder="ชื่อรายวิชา"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
              />

              {/* เวลา */}
              <TextInput
                style={styles.input}
                placeholder="เวลาเรียน (เช่น 13:00 - 16:00 น.)"
                placeholderTextColor="#999"
                value={time}
                onChangeText={setTime}
              />

              {/* ==========================================
                  เลือกอาคาร
              ========================================== */}
              <Text
                style={
                  styles.fieldLabel
                }
              >
                อาคารเรียน
              </Text>

              <TouchableOpacity
                style={
                  styles.selectBox
                }
                onPress={() => {
                  setShowBuildingList(
                    !showBuildingList
                  );
                  setShowRoomList(
                    false
                  );
                }}
              >

                <Text
                  style={
                    building
                      ? styles.selectText
                      : styles.placeholderText
                  }
                  numberOfLines={1}
                >
                  {building ||
                    'เลือกอาคารเรียน'}
                </Text>

                <Ionicons
                  name={
                    showBuildingList
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={20}
                  color="#777"
                />

              </TouchableOpacity>

              {/* รายการอาคาร */}
              {showBuildingList && (
                <View
                  style={
                    styles.dropdownList
                  }
                >

                  {loadingLocations ? (

                    <View
                      style={
                        styles.loadingBox
                      }
                    >

                      <ActivityIndicator
                        size="small"
                        color="#F28C4B"
                      />

                      <Text
                        style={{
                          marginLeft: 8,
                          color: '#777',
                        }}
                      >
                        กำลังโหลดอาคาร...
                      </Text>

                    </View>

                  ) : buildings.length === 0 ? (

                    <Text
                      style={
                        styles.noDataText
                      }
                    >
                      ไม่พบข้อมูลอาคาร
                    </Text>

                  ) : (

                    <ScrollView
                      style={
                        styles.dropdownScroll
                      }
                      nestedScrollEnabled
                    >

                      {buildings.map(
                        (item) => {

                          const buildingName =
                            item.name ||
                            item.building_name ||
                            item.building_id ||
                            item.id;

                          return (
                            <TouchableOpacity
                              key={
                                item.id
                              }
                              style={[
                                styles.dropdownItem,
                                buildingId ===
                                  item.id &&
                                  styles.selectedDropdownItem,
                              ]}
                              onPress={() =>
                                handleSelectBuilding(
                                  item
                                )
                              }
                            >

                              <Ionicons
                                name="business-outline"
                                size={18}
                                color="#F28C4B"
                                style={{
                                  marginRight: 10,
                                }}
                              />

                              <Text
                                style={
                                  styles.dropdownItemText
                                }
                              >
                                {
                                  buildingName
                                }
                              </Text>

                              {buildingId ===
                                item.id && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color="#F28C4B"
                                />
                              )}

                            </TouchableOpacity>
                          );
                        }
                      )}

                    </ScrollView>

                  )}

                </View>
              )}

              {/* ==========================================
                  เลือกห้อง
              ========================================== */}
              <Text
                style={
                  styles.fieldLabel
                }
              >
                ห้องเรียน
              </Text>

              <TouchableOpacity
                style={[
                  styles.selectBox,
                  !building &&
                    styles.disabledSelectBox,
                ]}
                disabled={!building}
                onPress={() => {
                  setShowRoomList(
                    !showRoomList
                  );
                  setShowBuildingList(
                    false
                  );
                }}
              >

                <Text
                  style={
                    room
                      ? styles.selectText
                      : styles.placeholderText
                  }
                  numberOfLines={1}
                >
                  {!building
                    ? 'กรุณาเลือกอาคารก่อน'
                    : room ||
                      'เลือกห้องเรียน'}
                </Text>

                <Ionicons
                  name={
                    showRoomList
                      ? 'chevron-up'
                      : 'chevron-down'
                  }
                  size={20}
                  color={
                    building
                      ? '#777'
                      : '#BBB'
                  }
                />

              </TouchableOpacity>

              {/* รายการห้อง */}
              {showRoomList &&
                building && (
                  <View
                    style={
                      styles.dropdownList
                    }
                  >

                    {filteredRooms.length ===
                    0 ? (

                      <Text
                        style={
                          styles.noDataText
                        }
                      >
                        ไม่พบห้องของอาคารนี้
                      </Text>

                    ) : (

                      <ScrollView
                        style={
                          styles.dropdownScroll
                        }
                        nestedScrollEnabled
                      >

                        {filteredRooms.map(
                          (item) => (

                            <TouchableOpacity
                              key={
                                item.id
                              }
                              style={[
                                styles.dropdownItem,
                                room ===
                                  item.id &&
                                  styles.selectedDropdownItem,
                              ]}
                              onPress={() =>
                                handleSelectRoom(
                                  item
                                )
                              }
                            >

                              <View
                                style={{
                                  flex: 1,
                                }}
                              >

                                <Text
                                  style={
                                    styles.dropdownItemText
                                  }
                                >
                                  {item.id}
                                </Text>

                                <Text
                                  style={
                                    styles.roomDetailText
                                  }
                                >
                                  ชั้น{' '}
                                  {item.floor ||
                                    '-'}
                                  {item.type
                                    ? ` • ${item.type}`
                                    : ''}
                                </Text>

                              </View>

                              {room ===
                                item.id && (
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color="#F28C4B"
                                />
                              )}

                            </TouchableOpacity>

                          )
                        )}

                      </ScrollView>

                    )}

                  </View>
                )}

              {/* ==========================================
                  ปุ่ม
              ========================================== */}
              <View
                style={
                  styles.modalActions
                }
              >

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.cancelBtn,
                  ]}
                  onPress={() => {
                    setShowBuildingList(
                      false
                    );
                    setShowRoomList(
                      false
                    );
                    setModalVisible(
                      false
                    );
                  }}
                >

                  <Text
                    style={{
                      color: '#666',
                      fontWeight: 'bold',
                    }}
                  >
                    ยกเลิก
                  </Text>

                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.saveBtn,
                  ]}
                  onPress={
                    handleSave
                  }
                >

                  <Text
                    style={{
                      color: '#FFF',
                      fontWeight: 'bold',
                    }}
                  >
                    บันทึก
                  </Text>

                </TouchableOpacity>

              </View>

            </ScrollView>

          </View>

        </View>

      </Modal>

    </View>
  );
}

// =========================================================
// Styles
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E9',
  },

  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  daysRow: {
    flexDirection: 'row',
    gap: 6,
  },

  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EADEC9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeDayCircle: {
    backgroundColor: '#F28C4B',
  },

  dayText: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },

  activeDayText: {
    color: '#FFF',
  },

  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B8B8B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    padding: 16,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },

  cardWrapper: {
    backgroundColor: '#F28C4B',
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
  },

  cardHeaderAction: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },

  cardInner: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
  },

  subjectCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F28C4B',
    marginBottom: 4,
  },

  subjectName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  infoText: {
    fontSize: 12,
    color: '#666',
    flexShrink: 1,
  },

  navigateBtn: {
    backgroundColor: '#5C3A21',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  navigateBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // =======================================================
  // Modal
  // =======================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '85%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C3A21',
    marginBottom: 14,
    textAlign: 'center',
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
    marginTop: 2,
  },

  // =======================================================
  // Select Box
  // =======================================================

  selectBox: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#FFF',
  },

  disabledSelectBox: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E5E5E5',
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginRight: 10,
  },

  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    marginRight: 10,
  },

  // =======================================================
  // Dropdown
  // =======================================================

  dropdownList: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    backgroundColor: '#FFF',
    marginBottom: 12,
    overflow: 'hidden',
  },

  dropdownScroll: {
    maxHeight: 180,
  },

  dropdownItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 8,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  selectedDropdownItem: {
    backgroundColor: '#FFF4EC',
  },

  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  roomDetailText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  loadingBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  noDataText: {
    padding: 15,
    textAlign: 'center',
    color: '#999',
    fontSize: 13,
  },

  // =======================================================
  // Modal buttons
  // =======================================================

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },

  cancelBtn: {
    backgroundColor: '#EEE',
  },

  saveBtn: {
    backgroundColor: '#F28C4B',
  },
});