export const INITIAL_PROFILE = {
  name: 'สมชาย ใจดี',
  studentId: 'B6600000',
  faculty: 'สำนักวิชาวิศวกรรมศาสตร์',
  club: 'ชมรมพัฒนาซอฟต์แวร์',
};

export const INITIAL_CLASSES = [
  {
    id: '1', code: '523211', name: 'COMPUTER PROGRAMMING II',
    time: '09:00 - 12:00 น.', building: 'อาคารเรียนรวม 1 (B1)', room: 'B1101',
    dayIndex: 1, vending: ['ตู้เต่าบิน (ชั้น 1)', 'ตู้น้ำดื่ม (ชั้น 1)'],
  },
  {
    id: '4', code: '523351', name: 'WEB APPLICATION DEV',
    time: '13:00 - 16:00 น.', building: 'อาคารเครื่องมือ 1 (F1)', room: 'F01-202',
    dayIndex: 4, vending: ['ตู้เต่าบิน (หน้าลิฟต์)'],
  },
];

export const BUILDINGS_DATA = [
  {
    id: 'b1', name: 'อาคารเรียนรวม 1 (B1)', desc: 'อาคารเรียนทฤษฎี',
    vending: [{ type: 'taobin', name: 'ตู้เต่าบิน', location: 'ชั้น 1' }],
  },
  {
    id: 'f1', name: 'อาคารเครื่องมือ 1 (F1)', desc: 'อาคารปฏิบัติการคอมพิวเตอร์',
    vending: [{ type: 'taobin', name: 'ตู้เต่าบิน', location: 'หน้าลิฟต์ ชั้น 1' }],
  },
];

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', title: 'แจ้งเตือนเข้าเรียน!', body: 'วิชา PROGRAMMING จะเริ่มในอีก 15 นาที', time: '08:45 น.', unread: true },
];