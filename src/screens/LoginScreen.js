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

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';

import { doc, setDoc, getDoc } from 'firebase/firestore';

import { auth, db } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [screenMode, setScreenMode] = useState('welcome');

  // State สำหรับ Form
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // =========================================================
  // SIGN IN
  // =========================================================
  const handleSignIn = async () => {
    Keyboard.dismiss();

    if (!email.trim() || !password.trim()) {
      Alert.alert(
        'แจ้งเตือน',
        'กรุณากรอก Email และ Password ให้ครบถ้วน'
      );
      return;
    }

    try {
      // Login ด้วย Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const firebaseUser = userCredential.user;

      // ดึงข้อมูล user จาก Firestore
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      let userData;

      if (userSnap.exists()) {
        // มีข้อมูลอยู่แล้ว
        userData = userSnap.data();
      } else {
        // ถ้ายังไม่มี document users ให้สร้าง
        userData = {
          uid: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            email.trim().split('@')[0],
          studentId: '',
          email: firebaseUser.email,
          isLoggedIn: true,
        };

        await setDoc(userRef, userData);
      }

      // ส่งข้อมูลไปหน้า Main
      navigation.replace('Main', {
        user: {
          ...userData,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isLoggedIn: true,
        },
        notification: {
          id: Date.now().toString(),
          title: 'เข้าสู่ระบบสำเร็จ',
          body: 'ยินดีต้อนรับเข้าสู่ระบบ',
          time: 'เมื่อสักครู่',
          unread: true,
        },
      });

    } catch (error) {
      console.log('Login error:', error);

      let message = 'ไม่สามารถเข้าสู่ระบบได้';

      switch (error.code) {
        case 'auth/invalid-credential':
          message = 'Email หรือ Password ไม่ถูกต้อง';
          break;

        case 'auth/user-not-found':
          message = 'ไม่พบบัญชีผู้ใช้นี้';
          break;

        case 'auth/wrong-password':
          message = 'Password ไม่ถูกต้อง';
          break;

        case 'auth/invalid-email':
          message = 'รูปแบบ Email ไม่ถูกต้อง';
          break;

        case 'auth/too-many-requests':
          message =
            'ลองเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่';
          break;

        default:
          message =
            error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      }

      Alert.alert(
        'เข้าสู่ระบบไม่สำเร็จ',
        message
      );
    }
  };

  // =========================================================
  // SIGN UP
  // =========================================================
  const handleSignUp = async () => {
    Keyboard.dismiss();

    // ตรวจสอบข้อมูล
    if (
      !studentId.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'แจ้งเตือน',
        'กรุณากรอกข้อมูลให้ครบทุกช่อง'
      );
      return;
    }

    // ตรวจสอบ Password
    if (password !== confirmPassword) {
      Alert.alert(
        'ข้อผิดพลาด',
        'รหัสผ่านทั้งสองช่องไม่ตรงกัน'
      );
      return;
    }

    // Firebase ต้องการ password อย่างน้อย 6 ตัว
    if (password.length < 6) {
      Alert.alert(
        'ข้อผิดพลาด',
        'Password ต้องมีอย่างน้อย 6 ตัวอักษร'
      );
      return;
    }

    try {
      // สร้างบัญชี Firebase Authentication
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );

      const firebaseUser = userCredential.user;

      // ใช้ Student ID เป็นชื่อผู้ใช้
      const displayName =
        studentId.trim() ||
        email.trim().split('@')[0];

      // บันทึก displayName ใน Firebase Auth
      await updateProfile(firebaseUser, {
        displayName: displayName,
      });

      // =====================================================
      // บันทึกข้อมูล User ลง Firestore
      //
      // users
      //   └── Firebase UID
      //       ├── uid
      //       ├── name
      //       ├── studentId
      //       ├── email
      //       └── schedules
      // =====================================================

      await setDoc(
        doc(db, 'users', firebaseUser.uid),
        {
          uid: firebaseUser.uid,
          name: displayName,
          studentId: studentId.trim(),
          email: email.trim(),
          createdAt: new Date().toISOString(),
        }
      );

      // หลังสมัคร Firebase จะ Login ให้อัตโนมัติ
      // เรา Sign Out เพื่อให้กลับไปหน้า Sign In
      await signOut(auth);

      Alert.alert(
        'สมัครสมาชิกสำเร็จ',
        'สร้างบัญชีเรียบร้อยแล้ว กรุณาเข้าสู่ระบบ',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              setPassword('');
              setConfirmPassword('');
              setScreenMode('signin');
            },
          },
        ]
      );

    } catch (error) {
      console.log('Sign up error:', error);

      let message = 'ไม่สามารถสมัครสมาชิกได้';

      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email นี้มีบัญชีอยู่แล้ว';
          break;

        case 'auth/invalid-email':
          message = 'รูปแบบ Email ไม่ถูกต้อง';
          break;

        case 'auth/weak-password':
          message =
            'Password ต้องมีอย่างน้อย 6 ตัวอักษร';
          break;

        default:
          message =
            error.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      }

      Alert.alert(
        'สมัครสมาชิกไม่สำเร็จ',
        message
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <KeyboardAvoidingView
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      style={styles.container}
    >
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
      >
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.headerBackground}>
            <View style={styles.logoContainer}>
              <View style={styles.pinIcon}>
                <Ionicons
                  name="location"
                  size={48}
                  color="#bd5628"
                />
              </View>

              <Text style={styles.brandTitle}>
                SUT PINPOINT
              </Text>
            </View>
          </View>

          {/* Bottom Card */}
          <View style={styles.cardContainer}>

            {/* =================================================
                WELCOME
            ================================================= */}
            {screenMode === 'welcome' && (
              <View style={styles.welcomeContent}>

                <Text style={styles.welcomeTitle}>
                  Welcome!
                </Text>

                <TouchableOpacity
                  style={styles.primaryDarkBtn}
                  onPress={() =>
                    setScreenMode('signin')
                  }
                >
                  <Text
                    style={styles.primaryDarkBtnText}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryWhiteBtn}
                  onPress={() =>
                    setScreenMode('signup')
                  }
                >
                  <Text
                    style={
                      styles.secondaryWhiteBtnText
                    }
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>

              </View>
            )}

            {/* =================================================
                SIGN IN
            ================================================= */}
            {screenMode === 'signin' && (
              <View style={styles.signInContent}>

                <TouchableOpacity
                  style={styles.backCircleBtn}
                  onPress={() =>
                    setScreenMode('welcome')
                  }
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color="#333"
                  />
                </TouchableOpacity>

                <Text style={styles.signInTitle}>
                  Sign In
                </Text>

                {/* Email */}
                <View style={styles.inputBox}>

                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />

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

                {/* Password */}
                <View style={styles.inputBox}>

                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-outline'
                          : 'eye-off-outline'
                      }
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>

                </View>

                {/* Sign In Button */}
                <TouchableOpacity
                  style={styles.primaryDarkBtn}
                  onPress={handleSignIn}
                >
                  <Text
                    style={styles.primaryDarkBtnText}
                  >
                    Sign In
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footerRow}>

                  <Text style={{ color: '#555' }}>
                    Don't have an account?{' '}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setScreenMode('signup')
                    }
                  >
                    <Text style={styles.linkText}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>

                </View>

              </View>
            )}

            {/* =================================================
                SIGN UP
            ================================================= */}
            {screenMode === 'signup' && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.signInContent}
                keyboardShouldPersistTaps="handled"
              >

                <TouchableOpacity
                  style={styles.backCircleBtn}
                  onPress={() =>
                    setScreenMode('welcome')
                  }
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color="#333"
                  />
                </TouchableOpacity>

                <Text style={styles.signInTitle}>
                  Sign Up
                </Text>

                {/* Student ID */}
                <View style={styles.inputBox}>

                  <Ionicons
                    name="card-outline"
                    size={20}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Student ID (เช่น B64xxxxx)"
                    placeholderTextColor="#A0A0A0"
                    value={studentId}
                    onChangeText={setStudentId}
                    autoCapitalize="characters"
                  />

                </View>

                {/* Email */}
                <View style={styles.inputBox}>

                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />

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

                {/* Password */}
                <View style={styles.inputBox}>

                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#A0A0A0"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />

                  <TouchableOpacity
                    onPress={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <Ionicons
                      name={
                        showPassword
                          ? 'eye-outline'
                          : 'eye-off-outline'
                      }
                      size={20}
                      color="#888"
                    />
                  </TouchableOpacity>

                </View>

                {/* Confirm Password */}
                <View style={styles.inputBox}>

                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color="#888"
                    style={{ marginRight: 10 }}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#A0A0A0"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />

                </View>

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.primaryDarkBtn}
                  onPress={handleSignUp}
                >
                  <Text
                    style={styles.primaryDarkBtnText}
                  >
                    Sign Up
                  </Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footerRow}>

                  <Text style={{ color: '#555' }}>
                    Already have an account?{' '}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      setScreenMode('signin')
                    }
                  >
                    <Text style={styles.linkText}>
                      Sign In
                    </Text>
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

// =========================================================
// STYLE
// =========================================================

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