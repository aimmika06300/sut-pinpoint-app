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
  onBackToHome, // ✅ Prop สำหรับย้อนกลับหน้า Home
}) {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // ดึงรายการอาคารสถานที่
  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/buildings`);
      const rawData = Array.isArray(response.data) ? response.data : [];

      const normalizedData = rawData.map((b) => ({
        id: b.id || b._id,
        name: b.name || 'อาคารรัฐสีมาคุณากร',
        lat: parseFloat(b.lat || b.latitude || 14.8770),
        lng: parseFloat(b.lng || b.longitude || 102.0185),
      }));

      setBuildings(normalizedData);
    } catch (error) {
      setBuildings([
        { id: '1', name: 'อาคารรัฐสีมาคุณากร', lat: 14.8770, lng: 102.0185 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const clearSearch = () => {
    if (setSearchQuery) {
      setSearchQuery('');
    }
  };

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

        {/* ปุ่มกลับไปหน้า Home */}
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
              if (buildingData && buildingData.lat && buildingData.lng) {
                openGoogleMaps(buildingData.lat, buildingData.lng, buildingData.name);
              }
            } catch (err) {
              console.error('Error parsing map message:', err);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
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
  userProfileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 12,
  },
  userNameText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  userIdText: {
    color: '#FFF',
    fontSize: 13,
    marginTop: 2,
    opacity: 0.9,
  },
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  iconBtn: {
    padding: 4,
  },
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
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});