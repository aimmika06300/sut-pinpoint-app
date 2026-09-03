import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import MapScreen from './MapScreen';

export default function HomeScreen({
  onNavigateToMap,
  onOpenClassroom,
  searchQuery,
  setSearchQuery,
  onGoToProfile,
}) {

  // ควบคุมการแสดง Map ภายในหน้า Home
  const [showMap, setShowMap] = useState(false);

  // เมื่อกด View Map
  const openMap = (query = '') => {
    setSearchQuery(query);
    setShowMap(true);
  };

  // เมื่อกดปุ่มย้อนกลับจาก Map
  const closeMap = () => {
    setShowMap(false);
  };


  // =========================================
  // ถ้า showMap = true ให้แสดง MapScreen
  // =========================================

  if (showMap) {
    return (
      <View style={styles.mapWrapper}>
        <MapScreen
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilter="all"
          setSelectedFilter={() => {}}
          onBack={closeMap}
        />
      </View>
    );
  }


  // =========================================
  // หน้า Home ปกติ
  // =========================================

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >

      {/* ==============================
          Header Profile Card
      ============================== */}

      <View style={styles.headerCard}>

        <TouchableOpacity
          style={styles.profileClickArea}
          onPress={onGoToProfile}
        >

          <View style={styles.profileImageContainer}>
            <FontAwesome
              name="user"
              size={32}
              color="#F28C4B"
            />
          </View>

          <View>
            <Text style={styles.userName}>
              USER NAME
            </Text>

            <Text style={styles.userId}>
              BXXXXXX
            </Text>
          </View>

        </TouchableOpacity>


        <TouchableOpacity
          style={styles.gearBtn}
          onPress={onGoToProfile}
        >
          <Ionicons
            name="settings-sharp"
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

      </View>


      {/* ==============================
          Search Box
      ============================== */}

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
            placeholder="Where you are going ?"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}

            // กดค้นหาจากหน้า Home
            onSubmitEditing={() => openMap(searchQuery)}
          />

        </View>


        <View style={styles.tagContainer}>

          <TouchableOpacity
            style={styles.tagButton}
            onPress={() => openMap('ตู้เต่าบิน')}
          >
            <Text style={styles.tagText}>
              ตู้เต่าบิน
            </Text>
          </TouchableOpacity>

        </View>

      </View>


      {/* ==============================
          Navigation Links
      ============================== */}

      <View style={styles.otherContainer}>

        <Text style={styles.sectionTitle}>
          Other & Navigation
        </Text>


        {/* ==============================
            View Map SUT
        ============================== */}

        <View style={styles.menuCard}>

          <View style={styles.iconCircle}>

            <Ionicons
              name="location"
              size={24}
              color="#5C4033"
            />

          </View>


          <View style={styles.cardContent}>

            <Text style={styles.cardTitle}>
              View Map SUT
            </Text>


            <TouchableOpacity
              style={styles.actionButton}

              // เปิด Map ภายใน Home
              onPress={() => openMap('')}
            >
              <Text style={styles.actionButtonText}>
                View
              </Text>
            </TouchableOpacity>

          </View>

        </View>


        {/* ==============================
            All classrooms
        ============================== */}

        <View style={styles.menuCard}>

          <View style={styles.iconCircle}>

            <MaterialCommunityIcons
              name="door-open"
              size={24}
              color="#5C4033"
            />

          </View>


          <View style={styles.cardContent}>

            <Text style={styles.cardTitle}>
              All classrooms
            </Text>


            <TouchableOpacity
              style={styles.actionButton}
              onPress={onOpenClassroom}
            >
              <Text style={styles.actionButtonText}>
                View
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      </View>

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  /* ==============================
     Home
  ============================== */

  scrollContainer: {
    padding: 16,
    paddingBottom: 20,
  },


  /* ==============================
     Map Container
  ============================== */

  mapWrapper: {
    flex: 1,
    backgroundColor: '#FFF',
  },


  /* ==============================
     Header
  ============================== */

  headerCard: {
    backgroundColor: '#F28C4B',
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  profileClickArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#5C3A21',
  },

  userId: {
    fontSize: 12,
    color: '#5C3A21',
  },

  gearBtn: {
    padding: 6,
  },


  /* ==============================
     Search
  ============================== */

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

  tagContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },

  tagButton: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 10,
  },

  tagText: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
  },


  /* ==============================
     Other
  ============================== */

  otherContainer: {
    backgroundColor: '#FFA36C',
    borderRadius: 20,
    padding: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5C3A21',
    marginBottom: 10,
  },


  /* ==============================
     Menu Card
  ============================== */

  menuCard: {
    backgroundColor: '#F28C4B',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },

  actionButton: {
    backgroundColor: '#FFF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 15,
  },

  actionButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
  },

});