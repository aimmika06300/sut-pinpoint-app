import React, { useState } from 'react';
import { StyleSheet, View, StatusBar, Platform, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import HomeScreen from './screens/HomeScreen';
import ClassroomScreen from './screens/ClassroomScreen';
import MapScreen from './screens/MapScreen';
import NotificationScreen from './screens/NotificationScreen';
import ProfileScreen from './screens/ProfileScreen';
import UserDetailScreen from './screens/UserDetailScreen';
import LoginScreen from './screens/LoginScreen';
import AllClassroomsScreen from './screens/AllClassroomsScreen';

// Import Mock Data
import { INITIAL_PROFILE, INITIAL_NOTIFICATIONS } from './data/mockData';

const Stack = createNativeStackNavigator();

// คอมโพเนนต์รวมสำหรับหน้าหลักพร้อม Bottom Navigation
function MainTabs({ navigation }) {
  const [activeTab, setActiveTab] = useState('Home');
  const [currentProfileView, setCurrentProfileView] = useState('Main');
  
  // App States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [profile] = useState(INITIAL_PROFILE);

  // คำนวณจำนวนการแจ้งเตือนที่ยังไม่ได้อ่าน
  const unreadCount = notifications.filter((n) => n.unread).length;

  const navigateToMap = (buildingName) => {
    setActiveTab('Map');
    setSearchQuery(buildingName || '');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return (
          <HomeScreen
            onNavigateToMap={navigateToMap}
            onOpenClassroom={() => setActiveTab('Classroom')}
            onOpenAllClassrooms={() => navigation.navigate('AllClassrooms')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onGoToProfile={() => setActiveTab('Profile')}
          />
        );

      case 'Classroom':
        return (
          <ClassroomScreen
            selectedDayIndex={selectedDayIndex}
            setSelectedDayIndex={setSelectedDayIndex}
            onNavigateToMap={navigateToMap}
          />
        );

      case 'Map':
        return (
          <MapScreen
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
          />
        );

      case 'Notif':
        return (
          <NotificationScreen
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );

      case 'Profile':
        return currentProfileView === 'UserDetail' ? (
          <UserDetailScreen
            profile={profile}
            onBack={() => setCurrentProfileView('Main')}
          />
        ) : (
          <ProfileScreen
            navigation={navigation}
            profile={profile}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            onGoToUserDetail={() => setCurrentProfileView('UserDetail')}
            onGoToTimetable={() => setActiveTab('Classroom')}
            onLogin={() => navigation.navigate('Login')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F4E9" />

      {/* Dynamic Screen Content */}
      <View style={styles.contentContainer}>
        {renderScreen()}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
          <Ionicons name={activeTab === 'Home' ? 'home' : 'home-outline'} size={24} color={activeTab === 'Home' ? '#5C3A21' : '#888'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Classroom')}>
          <Ionicons name={activeTab === 'Classroom' ? 'book' : 'book-outline'} size={24} color={activeTab === 'Classroom' ? '#5C3A21' : '#888'} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Notif')}>
          <View>
            <Ionicons name={activeTab === 'Notif' ? 'notifications' : 'notifications-outline'} size={24} color={activeTab === 'Notif' ? '#5C3A21' : '#888'} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem} onPress={() => { setActiveTab('Profile'); setCurrentProfileView('Main'); }}>
          <Ionicons name={activeTab === 'Profile' ? 'person' : 'person-outline'} size={24} color={activeTab === 'Profile' ? '#5C3A21' : '#888'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Root App Component
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* หน้าหลักของแอป */}
        <Stack.Screen name="Main" component={MainTabs} />
        
        {/* หน้า Login */}
        <Stack.Screen name="Login" component={LoginScreen} />

        {/* หน้าห้องเรียนทั้งหมด (อาคาร > ชั้น > ห้อง) */}
        <Stack.Screen name="AllClassrooms" component={AllClassroomsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E9',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40,
  },
  contentContainer: {
    flex: 1,
  },
  bottomNav: {
    height: 65,
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#E53935',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});