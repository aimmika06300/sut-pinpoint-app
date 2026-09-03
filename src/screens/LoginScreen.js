import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [screenMode, setScreenMode] = useState('welcome');

  // State สำหรับ Form
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ฟังก์ชัน Sign In -> ส่งข้อมูลไปยังหน้า Main
  const handleSignIn = () => {
    Keyboard.dismiss();

    if (!email.trim() || !password.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอก Email และ Password ให้ครบถ้วน');
      return;
    }

    if (navigation) {
      const displayName = studentId.trim() || email.split('@')[0];

      navigation.replace('Main', {
        user: {
          name: displayName,
          studentId: studentId.trim() || 'B64xxxxx',
          email: email.trim(),
          isLoggedIn: true,
        },
      });
    }
  };

  // ฟังก์ชัน Sign Up
  const handleSignUp = () => {
    Keyboard.dismiss();

    if (!studentId.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('ข้อผิดพลาด', 'รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    Alert.alert('สำเร็จ', 'สมัครสมาชิกเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ', [
      {
        text: 'ตกลง',
        onPress: () => setScreenMode('signin'),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerBackground}>
            <View style={styles.logoContainer}>
              <View style={styles.pinIcon}>
                <Ionicons name="location" size={48} color="#bd5628" />
              </View>
              <Text style={styles.brandTitle}>SUT PINPOINT</Text>
            </View>
          </View>

          {/* Bottom Card */}
          <View style={styles.cardContainer}>
            {screenMode === 'welcome' && (
              /* ---------------- 1. หน้า Welcome ---------------- */
              <View style={styles.welcomeContent}>
                <Text style={styles.welcomeTitle}>Welcome!</Text>

                <TouchableOpacity
                  style={styles.primaryDarkBtn}
                  onPress={() => setScreenMode('signin')}
                >
                  <Text style={styles.primaryDarkBtnText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryWhiteBtn}
                  onPress={() => setScreenMode('signup')}
                >
                  <Text style={styles.secondaryWhiteBtnText}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}

            {screenMode === 'signin' && (
              /* ---------------- 2. หน้า Sign In ---------------- */
              <View style={styles.signInContent}>
                <TouchableOpacity
                  style={styles.backCircleBtn}
                  onPress={() => setScreenMode('welcome')}
                >
                  <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>

                <Text style={styles.signInTitle}>Sign In</Text>

                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.primaryDarkBtn} onPress={handleSignIn}>
                  <Text style={styles.primaryDarkBtnText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.footerRow}>
                  <Text style={{ color: '#555' }}>Don't have an account? </Text>
                  <TouchableOpacity onPress={() => setScreenMode('signup')}>
                    <Text style={styles.linkText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {screenMode === 'signup' && (
              /* ---------------- 3. หน้า Sign Up ---------------- */
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.signInContent}
                keyboardShouldPersistTaps="handled"
              >
                <TouchableOpacity
                  style={styles.backCircleBtn}
                  onPress={() => setScreenMode('welcome')}
                >
                  <Ionicons name="arrow-back" size={20} color="#333" />
                </TouchableOpacity>

                <Text style={styles.signInTitle}>Sign Up</Text>

                {/* Student ID Input */}
                <View style={styles.inputBox}>
                  <Ionicons name="card-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Student ID (เช่น B64xxxxx)"
                    placeholderTextColor="#A0A0A0"
                    value={studentId}
                    onChangeText={setStudentId}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Email Input */}
                <View style={styles.inputBox}>
                  <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#A0A0A0"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A0A0A0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>

                <TouchableOpacity style={styles.primaryDarkBtn} onPress={handleSignUp}>
                  <Text style={styles.primaryDarkBtnText}>Sign Up</Text>
                </TouchableOpacity>

                <View style={styles.footerRow}>
                  <Text style={{ color: '#555' }}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => setScreenMode('signin')}>
                    <Text style={styles.linkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEBE4',
  },
  headerBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  pinIcon: {
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4A3223',
    letterSpacing: 1.5,
  },
  cardContainer: {
    backgroundColor: '#F38346',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    maxHeight: '75%',
  },
  welcomeContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3D2516',
    marginBottom: 32,
  },
  primaryDarkBtn: {
    backgroundColor: '#5A4033',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  primaryDarkBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryWhiteBtn: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryWhiteBtnText: {
    color: '#5A4033',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInContent: {
    position: 'relative',
  },
  backCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  signInTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3D2516',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#333',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  linkText: {
    color: '#FFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});