import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { BUILDINGS_DATA } from '../data/mockData';

export default function MapScreen({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter }) {
  const filteredBuildings = BUILDINGS_DATA.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.desc.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'taobin') {
      return matchesSearch && b.vending.some((v) => v.type === 'taobin');
    }
    return matchesSearch;
  });

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerCard}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#5C3A21' }}>SUT Map & Vending Finder</Text>
          <Text style={{ fontSize: 12, color: '#5C3A21', opacity: 0.8 }}>ค้นหาอาคารเรียนและจุดตู้กดสินค้า</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={18} color="#666" style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาชื่อตึก เช่น B1, F1..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'all' && styles.activeFilterChip]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={styles.filterChipText}>ทั้งหมด</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'taobin' && styles.activeFilterChip]}
            onPress={() => setSelectedFilter('taobin')}
          >
            <Text style={styles.filterChipText}>🧋 ตู้เต่าบิน</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.mapGraphicBox}>
        <FontAwesome5 name="map-marked-alt" size={40} color="#F28C4B" />
        <Text style={styles.mapGraphicTitle}>Interactive Campus Map</Text>
        <Text style={styles.mapGraphicSub}>แสดงตำแหน่งพิกัด GPS ของอาคาร มทส.</Text>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#5C3A21', marginBottom: 10 }}>
          รายการอาคารเรียน ({filteredBuildings.length})
        </Text>

        {filteredBuildings.map((b) => (
          <View key={b.id} style={styles.mapBuildingCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <Ionicons name="business" size={20} color="#F28C4B" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333' }}>{b.name}</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{b.desc}</Text>
            <View style={styles.vendingSectionBox}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#5C4033', marginBottom: 4 }}>📍 จุดบริการภายในตึก:</Text>
              {b.vending.map((v, i) => (
                <Text key={i} style={{ fontSize: 12, color: '#333' }}>• {v.name} ({v.location})</Text>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: 16, paddingBottom: 80 },
  headerCard: { backgroundColor: '#F28C4B', borderRadius: 20, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  searchContainer: { backgroundColor: '#5C4033', borderRadius: 20, padding: 12, marginBottom: 14 },
  searchInputWrapper: { backgroundColor: '#FFF', borderRadius: 25, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 40 },
  searchInput: { flex: 1, fontSize: 13, color: '#333' },
  filterChip: { backgroundColor: '#FFF', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, marginRight: 6 },
  activeFilterChip: { backgroundColor: '#F28C4B' },
  filterChipText: { fontSize: 11, color: '#333', fontWeight: 'bold' },
  mapGraphicBox: { backgroundColor: '#FFE0B2', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 14 },
  mapGraphicTitle: { fontSize: 15, fontWeight: 'bold', color: '#5C3A21', marginTop: 6 },
  mapGraphicSub: { fontSize: 11, color: '#666', marginTop: 2 },
  mapBuildingCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 10 },
  vendingSectionBox: { backgroundColor: '#F5F5F5', padding: 8, borderRadius: 10 },
});