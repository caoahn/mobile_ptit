const os = require('os');
const fs = require('fs');
const path = require('path');

// Hàm tự động lấy IPv4 của máy tính
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    if (name.toLowerCase().includes('wi-fi') || name.toLowerCase().includes('wireless') || name.toLowerCase().includes('wlan')) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const currentIP = getLocalIPAddress();
const envPath = path.join(__dirname, '.env');
const newApiUrl = `EXPO_PUBLIC_API_URL=http://${currentIP}:3000/api`;

let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
let lines = envContent.split('\n');
let updated = false;

// Tìm và cập nhật đúng dòng EXPO_PUBLIC_API_URL
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim().startsWith('EXPO_PUBLIC_API_URL=')) {
    lines[i] = newApiUrl;
    updated = true;
    break;
  }
}

if (!updated) {
  lines.push(newApiUrl);
}


while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
  lines.pop();
}

// Ghi đè lại nội dung mới vào .env
fs.writeFileSync(envPath, lines.join('\n') + '\n', { encoding: 'utf8' });
console.log(`✅ Đã tự động cập nhật IP vào file .env`);
