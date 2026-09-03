// src/screens/AllClassroomsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchBuildings, fetchRooms } from '../services/api';
import { groupRoomsByBuilding } from '../utils/groupRooms';

export default function AllClassroomsScreen({ navigation }) {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [expandedBuildings, setExpandedBuildings] = useState({});
  const [expandedFloors, setExpandedFloors] = useState({});

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [buildingsData, roomsData] = await Promise.all([
        fetchBuildings(),
        fetchRooms(),
      ]);
      setBuildings(buildingsData);
      setRooms(roomsData);

      // เปิดอาคารแรกไว้อัตโนมัติ (ให้ความรู้สึกเหมือนดีไซน์ต้นแบบ)
      setExpandedBuildings((prev) => {
        if (Object.keys(prev).length > 0 || buildingsData.length === 0) {
          return prev;
        }
        return { [buildingsData[0].name]: true };
      });
    } catch (err) {
      setError(err.message || 'โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const toggleBuilding = (name) => {
    setExpandedBuildings((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleFloor = (key) => {
    setExpandedFloors((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#5C3A21" />
        <Text style={styles.loadingText}>กำลังโหลดข้อมูลห้องเรียน...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.errorBackButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#5C3A21" />
        </TouchableOpacity>
        <Ionicons name="cloud-offline-outline" size={48} color="#B00020" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          เช็คว่า backend รันอยู่ และ IP ใน src/services/api.js ตรงกับเครื่องที่รันเซิร์ฟเวอร์
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>ลองใหม่</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const groupedBuildings = groupRoomsByBuilding(buildings, rooms);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#5C3A21" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ห้องเรียนทั้งหมด</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#5C3A21']}
            tintColor="#5C3A21"
          />
        }
      >
        {groupedBuildings.length === 0 ? (
          <Text style={styles.emptyText}>ยังไม่มีข้อมูลห้องเรียน</Text>
        ) : (
          groupedBuildings.map((building) => (
            <BuildingCard
              key={building.name}
              building={building}
              isExpanded={!!expandedBuildings[building.name]}
              onToggle={() => toggleBuilding(building.name)}
              expandedFloors={expandedFloors}
              onToggleFloor={toggleFloor}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function BuildingCard({
  building,
  isExpanded,
  onToggle,
  expandedFloors,
  onToggleFloor,
}) {
  return (
    <View style={styles.buildingCard}>
      <TouchableOpacity
        style={styles.buildingHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.buildingName}>{building.name}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-down' : 'chevron-forward'}
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.floorsContainer}>
          {building.floors.length === 0 ? (
            <Text style={styles.noRoomsText}>ยังไม่มีข้อมูลห้องของอาคารนี้</Text>
          ) : (
            building.floors.map(({ floorNumber, rooms }) => {
              const floorKey = `${building.name}-${floorNumber}`;
              const isFloorExpanded = !!expandedFloors[floorKey];

              return (
                <View key={floorKey} style={styles.floorSection}>
                  <TouchableOpacity
                    style={styles.floorHeader}
                    onPress={() => onToggleFloor(floorKey)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.floorTitle}>ชั้น {floorNumber}</Text>
                    <Ionicons
                      name={isFloorExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color="#5C3A21"
                    />
                  </TouchableOpacity>

                  {isFloorExpanded &&
                    rooms.map((room) => (
                      <View key={room.id} style={styles.roomRow}>
                        <View
                          style={[
                            styles.statusDot,
                            room.status === 'Close'
                              ? styles.statusClosed
                              : styles.statusOpen,
                          ]}
                        />
                        <Text style={styles.roomText} numberOfLines={1}>
                          <Text style={styles.roomCode}>{room.id}</Text>
                          {'  |  '}
                          {room.building_name || building.name}
                        </Text>
                      </View>
                    ))}
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const BROWN = '#5C3A21';
const BROWN_LIGHT = '#8C6A4F';
const CREAM_BG = '#F8F4E9';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CREAM_BG,
  },
  centered: {
    flex: 1,
    backgroundColor: CREAM_BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorBackButton: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  loadingText: {
    marginTop: 12,
    color: BROWN_LIGHT,
    fontSize: 14,
  },
  errorText: {
    marginTop: 12,
    fontSize: 15,
    color: '#B00020',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorHint: {
    marginTop: 8,
    fontSize: 12,
    color: BROWN_LIGHT,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: BROWN,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BROWN,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: BROWN_LIGHT,
  },
  buildingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  buildingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BROWN,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buildingName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 1,
    marginRight: 8,
  },
  floorsContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  noRoomsText: {
    color: BROWN_LIGHT,
    fontSize: 13,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  floorSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#EFE7DA',
    paddingBottom: 6,
    marginBottom: 6,
  },
  floorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  floorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BROWN,
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingLeft: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusOpen: {
    backgroundColor: '#2E9E4F',
  },
  statusClosed: {
    backgroundColor: '#C0392B',
  },
  roomText: {
    fontSize: 14,
    color: '#3A3A3A',
    flexShrink: 1,
  },
  roomCode: {
    fontWeight: '700',
    color: BROWN,
  },
});