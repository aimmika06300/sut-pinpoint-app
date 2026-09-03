import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { BUILDINGS_DATA } from '../data/mockData';

// นำเข้าแผนที่ SVG
import SutMap from '../../assets/แผนที่.svg';

export default function MapScreen({
  searchQuery,
  setSearchQuery,
  selectedFilter,
  setSelectedFilter,
  onBack,
}) {
  const filteredBuildings = BUILDINGS_DATA.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.desc.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'taobin') {
      return (
        matchesSearch &&
        b.vending.some((v) => v.type === 'taobin')
      );
    }

    return matchesSearch;
  });

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >

      {/* =========================
          HEADER
      ========================= */}

      <View style={styles.headerCard}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#5C4033"
          />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.mapTitle}>
            SUT Map
          </Text>

          <Text style={styles.mapSubtitle}>
            ค้นหาอาคารเรียนและจุดตู้กดสินค้า
          </Text>
        </View>

      </View>


      {/* =========================
          SEARCH
      ========================= */}

      <View style={styles.searchContainer}>

        <View style={styles.searchInputWrapper}>

          <Ionicons
            name="search"
            size={18}
            color="#666"
            style={{ marginRight: 6 }}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="ค้นหาชื่อตึก เช่น B1, F1..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>


        {/* Filter */}

        <View style={styles.filterContainer}>

          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'all' &&
                styles.activeFilterChip,
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={styles.filterChipText}>
              ทั้งหมด
            </Text>
          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedFilter === 'taobin' &&
                styles.activeFilterChip,
            ]}
            onPress={() => setSelectedFilter('taobin')}
          >
            <Text style={styles.filterChipText}>
              🧋 ตู้เต่าบิน
            </Text>
          </TouchableOpacity>

        </View>

      </View>


      {/* =========================
          OPENSTREETMAP SVG
      ========================= */}

      <View style={styles.mapContainer}>

        <SutMap
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
        />

      </View>


      {/* =========================
          BUILDING LIST
      ========================= */}

      <View style={styles.buildingList}>

        <Text style={styles.buildingListTitle}>
          รายการอาคารเรียน ({filteredBuildings.length})
        </Text>


        {filteredBuildings.map((b) => (

          <View
            key={b.id}
            style={styles.mapBuildingCard}
          >

            {/* Building Name */}

            <View style={styles.buildingNameRow}>

              <Ionicons
                name="business"
                size={20}
                color="#F28C4B"
                style={{ marginRight: 8 }}
              />

              <Text style={styles.buildingName}>
                {b.name}
              </Text>

            </View>


            {/* Description */}

            <Text style={styles.buildingDescription}>
              {b.desc}
            </Text>


            {/* Vending */}

            <View style={styles.vendingSectionBox}>

              <Text style={styles.vendingTitle}>
                📍 จุดบริการภายในตึก:
              </Text>

              {b.vending.map((v, i) => (

                <Text
                  key={i}
                  style={styles.vendingText}
                >
                  • {v.name} ({v.location})
                </Text>

              ))}

            </View>

          </View>

        ))}

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  /* =========================
     MAIN
  ========================= */

  scrollContainer: {
    padding: 16,
    paddingBottom: 80,
  },


  /* =========================
     HEADER
  ========================= */

  headerCard: {
    backgroundColor: '#F28C4B',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5C3A21',
  },

  mapSubtitle: {
    fontSize: 12,
    color: '#5C3A21',
    opacity: 0.8,
    marginTop: 2,
  },


  /* =========================
     SEARCH
  ========================= */

  searchContainer: {
    backgroundColor: '#5C4033',
    borderRadius: 20,
    padding: 12,
    marginBottom: 14,
  },

  searchInputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },

  filterContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },

  filterChip: {
    backgroundColor: '#FFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginRight: 6,
  },

  activeFilterChip: {
    backgroundColor: '#F28C4B',
  },

  filterChipText: {
    fontSize: 11,
    color: '#333',
    fontWeight: 'bold',
  },


  /* =========================
     OPENSTREETMAP
  ========================= */

  mapContainer: {
    width: '100%',
    height: 350,
    backgroundColor: '#FFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },


  /* =========================
     BUILDING LIST
  ========================= */

  buildingList: {
    marginTop: 10,
  },

  buildingListTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#5C3A21',
    marginBottom: 10,
  },

  mapBuildingCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },

  buildingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  buildingName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },

  buildingDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },


  /* =========================
     VENDING
  ========================= */

  vendingSectionBox: {
    backgroundColor: '#F5F5F5',
    padding: 8,
    borderRadius: 10,
  },

  vendingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#5C4033',
    marginBottom: 4,
  },

  vendingText: {
    fontSize: 12,
    color: '#333',
  },

});