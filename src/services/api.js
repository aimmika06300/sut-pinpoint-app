// src/services/api.js
import axios from 'axios';

// ⚠️ แก้ IP/PORT ตรงนี้ให้ตรงกับเครื่องที่รัน backend (server.js)
// - Android Emulator (Android Studio/AVD): ใช้ '10.0.2.2'
// - มือถือจริงผ่าน Expo Go: ใช้ IPv4 ของเครื่อง dev บนวง Wi-Fi เดียวกัน (หาได้จาก `ipconfig`)
// - Web (expo start --web): ใช้ 'localhost'
//
// พอร์ตต้องตรงกับที่ server.js รันจริง (ดูจาก .env -> PORT=5000 และ log ตอนรัน `npm start`)
const API_HOST = '10.0.2.2'; // TODO: เปลี่ยนตามอุปกรณ์ที่ทดสอบ
const API_PORT = 5000; // ต้องตรงกับ backend จริง 

const api = axios.create({
  baseURL: `http://${API_HOST}:${API_PORT}/api`,
  timeout: 10000,
});

// ดึงรายการอาคารทั้งหมด
export async function fetchBuildings() {
  const response = await api.get('/buildings');
  return response.data;
}

// ดึงรายการห้องเรียนทั้งหมด
export async function fetchRooms() {
  const response = await api.get('/rooms');
  return response.data;
}

export default api;