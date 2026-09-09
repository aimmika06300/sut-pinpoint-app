import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const API_BASE_URL = 'http://10.0.2.2:5000/api';

export default function MapScreen({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  onBackToHome,
}) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับควบคุม Modal และเก็บข้อมูลอาคารที่ถูกคลิก
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  
  // State สำหรับเก็บข้อมูลห้องทั้งหมดเพื่อนำมาคำนวณจำนวนห้องและจำนวนชั้น
  const [allRooms, setAllRooms] = useState([]);

  const [userInfo, setUserInfo] = useState({
    name: 'กำลังโหลด...',
    studentId: '...',
  });

  // ดึงข้อมูลโปรไฟล์ผู้ใช้จาก Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserInfo({
              name: data.name || currentUser.displayName || 'B6803971',
              studentId: data.studentId || 'B6803971',
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // ฟังก์ชันเปิดแอป Google Maps เพื่อนำทาง
  const openGoogleMaps = (lat, lng, label) => {
    const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
    const latLng = `${lat},${lng}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${encodeURIComponent(label)})`,
    });

    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(googleMapsUrl);
        }
      })
      .catch(() => {
        Linking.openURL(googleMapsUrl);
      });
  };

  // ดึงรายการอาคารและห้องเรียนจาก Backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const [buildingRes, roomRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/buildings`),
        axios.get(`${API_BASE_URL}/rooms`).catch(() => ({ data: [] }))
      ]);

      const rawData = Array.isArray(buildingRes.data) ? buildingRes.data : [];
      const normalizedData = rawData.map((b) => ({
        id: b.id || b._id,
        name: b.name || 'อาคารรัฐสีมาคุณากร',
        lat: parseFloat(b.lat || b.latitude || 14.8770),
        lng: parseFloat(b.lng || b.longitude || 102.0185),
      }));

      setBuildings(normalizedData);
      setAllRooms(Array.isArray(roomRes.data) ? roomRes.data : []);
    } catch (error) {
      setBuildings([
        { id: '1', name: 'อาคารรัฐสีมาคุณากร', lat: 14.8770, lng: 102.0185 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearSearch = () => {
    if (setSearchQuery) {
      setSearchQuery('');
    }
  };

  // คำนวณจำนวนห้องและจำนวนชั้นของอาคารที่เลือก
  const getBuildingSummary = () => {
    if (!selectedBuilding) return { roomCount: 0, floorCount: 0 };
    
    const roomsInBuilding = allRooms.filter(
      (room) =>
        room.building_name === selectedBuilding.name ||
        room.buildingName === selectedBuilding.name ||
        room.building === selectedBuilding.name
    );

    // หาจำนวนชั้นที่ไม่ซ้ำกัน
    const floors = new Set(roomsInBuilding.map((r) => r.floor).filter(Boolean));

    return {
      roomCount: roomsInBuilding.length,
      floorCount: floors.size > 0 ? floors.size : '-',
    };
  };

  const summary = getBuildingSummary();

  // HTML และ JS สำหรับแผนที่ Leaflet
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body, html, #map { height: 100%; margin: 0; padding: 0; background: #f8f9fa; }
        .pin-wrapper { display: flex; align-items: center; cursor: pointer; }
        .pin-marker {
          width: 36px; height: 36px; border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, #FF9F5A 0%, #F28544 100%);
          position: relative; transform: rotate(-45deg);
          box-shadow: 0 4px 10px rgba(242, 133, 68, 0.4);
          border: 2px solid #FFFFFF; display: flex; align-items: center; justify-content: center;
        }
        .pin-inner-eye {
          transform: rotate(45deg); width: 20px; height: 20px;
          background: #FFFFFF; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
        }
        .pin-inner-eye svg { width: 12px; height: 12px; fill: #F28544; }
        .pin-label {
          background: #FFFFFF; color: #2D3748; font-weight: 700; font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          padding: 6px 14px; border-radius: 20px; margin-left: -6px; padding-left: 14px;
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12); border: 1px solid #EDF2F7; white-space: nowrap;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        const map = L.map('map', { zoomControl: false }).setView([14.8770, 102.0185], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        const buildings = ${JSON.stringify(buildings)};
        buildings.forEach(b => {
          const customIcon = L.divIcon({
            className: 'custom-pin-container',
            html: \`
              <div class="pin-wrapper">
                <div class="pin-marker">
                  <div class="pin-inner-eye">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  </div>
                </div>
                <div class="pin-label">\${b.name}</div>
              </div>
            \`,
            iconSize: [180, 40],
            iconAnchor: [18, 36]
          });
          
          L.marker([b.lat, b.lng], { icon: customIcon })
            .addTo(map)
            .on('click', () => {
              window.ReactNativeWebView.postMessage(JSON.stringify(b));
            });
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.userProfileGroup}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={28} color="#F28544" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userNameText}>{userInfo.name}</Text>
            <Text style={styles.userIdText}>{userInfo.studentId}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={onBackToHome}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRowContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#555" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Where you are going ?"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="mic-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.closeBtn} onPress={clearSearch}>
          <Ionicons name="close" size={22} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Map WebView */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F28544" />
        </View>
      ) : (
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={(event) => {
            try {
              const buildingData = JSON.parse(event.nativeEvent.data);
              if (buildingData && buildingData.name) {
                setSelectedBuilding(buildingData);
                setModalVisible(true);
              }
            } catch (err) {
              console.error('Error parsing map message:', err);
            }
          }}
        />
      )}

      {/* Modal แสดงข้อมูลสรุปอาคาร และลิงก์ไป Google Maps */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="business" size={26} color="#F28544" />
              <Text style={styles.modalTitle}>{selectedBuilding?.name}</Text>
            </View>

            {/* ส่วนแสดงจำนวนชั้นและจำนวนห้อง */}
            <View style={styles.infoContainer}>
              <View style={styles.infoBox}>
                <Ionicons name="layers-outline" size={22} color="#F28544" />
                <Text style={styles.infoLabel}>จำนวนชั้น</Text>
                <Text style={styles.infoValue}>{summary.floorCount} ชั้น</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoBox}>
                <Ionicons name="grid-outline" size={22} color="#F28544" />
                <Text style={styles.infoLabel}>จำนวนห้อง</Text>
                <Text style={styles.infoValue}>{summary.roomCount} ห้อง</Text>
              </View>
            </View>

            {/* ปุ่มกดเชื่อมต่อไปยัง Google Maps */}
            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={() => {
                setModalVisible(false);
                if (selectedBuilding) {
                  openGoogleMaps(selectedBuilding.lat, selectedBuilding.lng, selectedBuilding.name);
                }
              }}
            >
              <Ionicons name="navigate" size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.modalButtonTextPrimary}>เปิดนำทางด้วย Google Maps</Text>
            </TouchableOpacity>

            {/* ปุ่มปิด Modal */}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>ปิดหน้าต่าง</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  headerBar: {
    backgroundColor: '#F28544',
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
  },
  userProfileGroup: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { marginLeft: 12 },
  userNameText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  userIdText: { color: '#FFF', fontSize: 13, marginTop: 2, opacity: 0.9 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchRowContainer: {
    position: 'absolute',
    top: 105,
    left: 15,
    right: 15,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#FFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  iconBtn: { padding: 4 },
  closeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  map: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // สไตล์ Modal สรุปข้อมูลอาคาร
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8, textAlign: 'center' },
  
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  infoBox: { alignItems: 'center', flex: 1 },
  infoDivider: { width: 1, height: '80%', backgroundColor: '#CBD5E0' },
  infoLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 2 },

  modalButtonPrimary: {
    width: '100%',
    backgroundColor: '#F28544',
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonTextPrimary: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  modalCloseButton: { paddingVertical: 8, width: '100%', alignItems: 'center' },
  modalCloseText: { color: '#888', fontSize: 14, fontWeight: '600' },
});