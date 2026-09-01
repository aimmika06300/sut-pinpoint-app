// อ้างอิง Element จาก HTML
const button = document.getElementById('btn-click');
const outputText = document.getElementById('output-text');

// ฟังก์ชันทำงานเมื่อคลิกปุ่ม
function handleClick() {
  outputText.textContent = 'ทำงานเรียบร้อยแล้ว!';
}

// ผูก Event เข้ากับปุ่มกด
button.addEventListener('click', handleClick);