// if (!document.getElementById('screen-recorder-widget')) {
//     const container = document.createElement('div');
//     container.id = 'screen-recorder-widget';
//     container.style.cssText = `
//         position: fixed !important;
//         bottom: 24px !important;
//         right: 24px !important;
//         z-index: 2147483647 !important;
//         background: rgba(22, 22, 24, 0.92) !important;
//         backdrop-filter: blur(16px) !important;
//         -webkit-backdrop-filter: blur(16px) !important;
//         color: #ffffff !important;
//         padding: 6px 12px !important;
//         border-radius: 30px !important;
//         border: 1px solid rgba(255, 255, 255, 0.12) !important;
//         box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5) !important;
//         font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif !important;
//         display: flex !important;
//         flex-direction: row !important;
//         align-items: center !important;
//         gap: 10px !important;
//         user-select: none !important;
//         box-sizing: border-box !important;
//         cursor: grab !important;
//     `;

//     container.innerHTML = `
//         <!-- Drag Handle / Title -->
//         <div id="recorder-header" style="display: flex; align-items: center; gap: 6px; cursor: move; padding-right: 4px;">
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
//                 <polygon points="23 7 16 12 23 17 23 7"></polygon>
//                 <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
//             </svg>
//             <span style="font-size: 11px; font-weight: 600; color: #e4e4e7; letter-spacing: 0.2px;">Meet Recorder</span>
//         </div>

//         <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.15);"></div>

//         <!-- Status Pill -->
//         <div id="recorder-status" style="font-size: 11px; font-weight: 500; color: #4ade80; background: rgba(74, 222, 128, 0.12); padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(74, 222, 128, 0.25);">
//             <span id="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background-color: #4ade80; display: inline-block;"></span>
//             <span id="status-text">Ready</span>
//         </div>

//         <!-- Action Button -->
//         <button id="recorder-toggle-btn" style="background: #2563eb; color: #ffffff; border: none; padding: 5px 12px; border-radius: 16px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 5px; transition: background 0.2s;">
//             <svg id="btn-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
//                 <circle cx="12" cy="12" r="10"></circle>
//                 <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
//             </svg>
//             <span id="btn-text">Record</span>
//         </button>

//         <!-- Close Button -->
//         <button id="recorder-close-btn" style="background: none; border: none; font-size: 12px; cursor: pointer; color: #71717a; padding: 2px 4px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
//             ✕
//         </button>
//     `;

//     document.body.appendChild(container);

//     // --- DRAG LOGIC ---
//     let isDragging = false;
//     let offsetX = 0, offsetY = 0;
//     const header = container.querySelector('#recorder-header');

//     header.addEventListener('mousedown', (e) => {
//         isDragging = true;
//         container.style.cursor = 'grabbing';
//         offsetX = e.clientX - container.getBoundingClientRect().left;
//         offsetY = e.clientY - container.getBoundingClientRect().top;
//     });

//     document.addEventListener('mousemove', (e) => {
//         if (!isDragging) return;
//         container.style.bottom = 'auto';
//         container.style.right = 'auto';
//         container.style.left = `${e.clientX - offsetX}px`;
//         container.style.top = `${e.clientY - offsetY}px`;
//     });

//     document.addEventListener('mouseup', () => {
//         isDragging = false;
//         container.style.cursor = 'grab';
//     });

//     // --- RECORDING LOGIC ---
//     let mediaRecorder;
//     let recordedChunks = [];
//     let isRecording = false;
//     let timerInterval;
//     let seconds = 0;

//     const statusEl = document.getElementById('recorder-status');
//     const statusText = document.getElementById('status-text');
//     const statusDot = document.getElementById('status-dot');
//     const toggleBtn = document.getElementById('recorder-toggle-btn');
//     const btnText = document.getElementById('btn-text');
//     const btnIcon = document.getElementById('btn-icon');
//     const closeBtn = document.getElementById('recorder-close-btn');

//     closeBtn.onclick = () => {
//         if (isRecording && mediaRecorder) mediaRecorder.stop();
//         container.remove();
//     };

//     toggleBtn.onclick = async () => {
//         if (!isRecording) {
//             try {
//                 const screenStream = await navigator.mediaDevices.getDisplayMedia({
//                     video: { width: 1920, height: 1080, frameRate: 60 },
//                     audio: true
//                 });

//                 const micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
                
//                 const audioContext = new AudioContext();
//                 const destination = audioContext.createMediaStreamDestination();
                
//                 if (screenStream.getAudioTracks().length > 0) {
//                     const tabSource = audioContext.createMediaStreamSource(new MediaStream([screenStream.getAudioTracks()[0]]));
//                     tabSource.connect(destination);
//                 }

//                 if (micStream && micStream.getAudioTracks().length > 0) {
//                     const micSource = audioContext.createMediaStreamSource(micStream);
//                     micSource.connect(destination);
//                 }
                
//                 const combinedStream = new MediaStream([
//                     ...screenStream.getVideoTracks(),
//                     ...destination.stream.getAudioTracks()
//                 ]);

//                 recordedChunks = [];
//                 mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
            
//                 mediaRecorder.ondataavailable = (e) => {
//                     if (e.data.size > 0) recordedChunks.push(e.data);
//                 };

//                 mediaRecorder.onstop = () => {
//                     const blob = new Blob(recordedChunks, { type: "video/webm" });
//                     const url = URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = url;
//                     a.download = `Meet_Recording_${Date.now()}.webm`;
//                     a.click();
//                     URL.revokeObjectURL(url);
//                 };

//                 screenStream.getVideoTracks()[0].onended = () => {
//                     stopRecording();
//                 };

//                 mediaRecorder.start(1000);
//                 isRecording = true;

//                 // Update UI to Recording state
//                 btnText.innerText = "Stop";
//                 toggleBtn.style.backgroundColor = "#dc2626";
//                 btnIcon.innerHTML = `<rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"></rect>`;

//                 statusEl.style.color = "#ef4444";
//                 statusEl.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
//                 statusEl.style.borderColor = "rgba(239, 68, 68, 0.3)";
//                 statusDot.style.backgroundColor = "#ef4444";

//                 seconds = 0;
//                 timerInterval = setInterval(() => {
//                     seconds++;
//                     const mins = Math.floor(seconds / 60);
//                     const secs = seconds % 60;
//                     statusText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//                 }, 1000);

//             } catch (err) {
//                 if (err.name !== "NotAllowedError") {
//                     console.error("Capture failed:", err);
//                 }
//                 statusText.innerText = 'Cancelled';
//             }
//         } else {
//             stopRecording();
//         }
//     };

//     function stopRecording() {
//         if (mediaRecorder && isRecording) {
//             mediaRecorder.stop();
//         }
//         isRecording = false;
//         clearInterval(timerInterval);

//         btnText.innerText = "Record";
//         toggleBtn.style.backgroundColor = "#2563eb";
//         btnIcon.innerHTML = `<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>`;

//         statusText.innerText = "Ready";
//         statusEl.style.color = "#4ade80";
//         statusEl.style.backgroundColor = "rgba(74, 222, 128, 0.12)";
//         statusEl.style.borderColor = "rgba(74, 222, 128, 0.3)";
//         statusDot.style.backgroundColor = "#4ade80";
//     }
// }

// if (!document.getElementById('screen-recorder-widget')) {
//     const container = document.createElement('div');
//     container.id = 'screen-recorder-widget';
//     container.style.cssText = `
//         position: fixed !important;
//         bottom: 24px !important;
//         right: 24px !important;
//         z-index: 2147483647 !important;
//         background: rgba(22, 22, 24, 0.95) !important;
//         backdrop-filter: blur(16px) !important;
//         -webkit-backdrop-filter: blur(16px) !important;
//         color: #ffffff !important;
//         padding: 10px 14px !important;
//         border-radius: 16px !important;
//         border: 1px solid rgba(255, 255, 255, 0.15) !important;
//         box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6) !important;
//         font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif !important;
//         display: flex !important;
//         flex-direction: column !important;
//         gap: 8px !important;
//         user-select: none !important;
//         box-sizing: border-box !important;
//         width: 320px !important;
//     `;

//     container.innerHTML = `
//         <!-- Top Row: Logo, Title & Close -->
//         <div id="recorder-header" style="display: flex; align-items: center; justify-content: space-between; cursor: move; width: 100%;">
//             <div style="display: flex; align-items: center; gap: 8px;">
//             <img id="jsl-logo-img" alt = "JSL Logo" style="width: 22px; height:25px; object-fit: contain; border-radius: 4px;">
//             <div>
//                     <div style="font-size: 10px; font-weight: 700; color: #ffffff; letter-spacing: 0.3px;">JSL WORKS <span style="font-size: 9px; color: #3b82f6; font-weight: 500;">Meet Recorder</span></div>
//                 </div>
//             </div>
//             <button id="recorder-close-btn" style="background: none; border: none; font-size: 14px; cursor: pointer; color: #a1a1aa; padding: 2px 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: color 0.2s;">
//                 ✕
//             </button>
//         </div>

//         <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1);"></div>

//         <!-- Controls Row: Status & Record Button -->
//         <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
//             <!-- Status Pill -->
//             <div id="recorder-status" style="font-size: 11px; font-weight: 500; color: #4ade80; background: rgba(74, 222, 128, 0.12); padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(74, 222, 128, 0.25);">
//                 <span id="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background-color: #4ade80; display: inline-block;"></span>
//                 <span id="status-text">Ready</span>
//             </div>

//             <!-- Action Button -->
//             <button id="recorder-toggle-btn" style="background: #2563eb; color: #ffffff; border: none; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;">
//                 <svg id="btn-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
//                     <circle cx="12" cy="12" r="10"></circle>
//                     <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
//                 </svg>
//                 <span id="btn-text">Record</span>
//             </button>
//         </div>

//         <!-- Footer / Watermark Row -->
//         <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #848498; border-top: 1px solid rgba(54, 52, 52, 0.06); padding-top: 4px; margin-top: 2px;">
//             <span ">© JSL WORKS • Proprietary</span>
//             <span style="color: #f67a15; font-weight: 600;">🇮🇳 Made in India</span>
//         </div>
//     `;

//     document.body.appendChild(container);

//     const logoImg = document.getElementById("jsl-logo-img");
//     if(logoImg){
//         logoImg.src = "https://yt3.googleusercontent.com/ez9cd366O3ArqsrekYPjArl0INAzQZ1cYr5hBGh45wSO2-2gi-qL3VvFdL8MtvmG18OM6NN5=s900-c-k-c0x00ffffff-no-rj";
//         logoImg.onerror = ()=>{
//             logoImg.style.display = 'none';
//         };
//     }

//     // --- DRAG LOGIC (Fixed) ---
//     let isDragging = false;
//     let offsetX = 0, offsetY = 0;
//     const header = container.querySelector('#recorder-header');

//     header.addEventListener('mousedown', (e) => {
//         isDragging = true;
//         container.style.cursor = 'grabbing';
//         offsetX = e.clientX - container.getBoundingClientRect().left;
//         offsetY = e.clientY - container.getBoundingClientRect().top;
//     });

//     document.addEventListener('mousemove', (e) => {
//         if (!isDragging) return;
//         container.style.bottom = 'auto';
//         container.style.right = 'auto';
//         container.style.left = `${e.clientX - offsetX}px`;
//         container.style.top = `${e.clientY - offsetY}px`;
//     });

//     document.addEventListener('mouseup', () => {
//         isDragging = false;
//         container.style.cursor = 'default';
//     });

//     // --- RECORDING LOGIC ---
//     let mediaRecorder;
//     let recordedChunks = [];
//     let isRecording = false;
//     let isPaused = false;
//     let timerInterval;
//     let seconds = 0;

//     const statusEl = document.getElementById('recorder-status');
//     const statusText = document.getElementById('status-text');
//     const statusDot = document.getElementById('status-dot');
//     const toggleBtn = document.getElementById('recorder-toggle-btn');
//     const btnText = document.getElementById('btn-text');
//     const pauseBtn = document.getElementById('recorder-pause-btn');
//     const pauseBtnText = document.getElementById('pause-btn-text');
//     const btnIcon = document.getElementById('btn-icon');
//     const closeBtn = document.getElementById('recorder-close-btn');

//     closeBtn.onclick = () => {
//         if (isRecording && mediaRecorder) mediaRecorder.stop();
//         container.remove();
//     };


//     pauseBtn.onclick = () =>{
//         if(!mediaRecorder) return;
//         if(!isPaused)
//         {
//             mediaRecorder.pause();
//             isPaused = true;
//             clearInterval(timerInterval);
//             pauseBtnText.innerText="Resum";
//             pauseBtn.style.backgroundColor = "#d97706";

//             statusText.innerText = "Paused";
//             statusEl.attributeStyleMap.color = "#fbbf24";
//             statusEl.style.backgroundColor = "rgba(251, 191, 36, 0.12)";
//             statusEl.style.borderColor = "rgba(251,191, 36, 0.3";
//             statusDot.style.backgroundColor = "#fbbf24"; 
//         }else {
//             mediaRecorder.resume();
//             isPaused = false;
//             pauseBtnText.innerText = "Paused";
//             pauseBtn.style.backgroundColor = "rgba(239, 68, 68, 0.3)";
            
//             statusEl.style.color = "#ef4444";
//             statusEl.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
//             statusEl.style.borderColor = "rgba(239, 68, 68, 0.3)";
//             statusDot.style.backgroundColor = "#ef4444";

//             timerInterval = setInterval(() =>{
//                 seconds++;
//                 const mins = Math.floor(seconds/60);
//                 const secs = seconds%60;
//                 statusText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//             }, 1000);

//         }
//     };

//     toggleBtn.onclick = async () => {
//         if (!isRecording) {
//             try {
//                 const screenStream = await navigator.mediaDevices.getDisplayMedia({
//                     video: { width: 1920, height: 1080, frameRate: 60 },
//                     audio: true
//                 });

//                 const micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
                
//                 const audioContext = new AudioContext();
//                 const destination = audioContext.createMediaStreamDestination();
                
//                 if (screenStream.getAudioTracks().length > 0) {
//                     const tabSource = audioContext.createMediaStreamSource(new MediaStream([screenStream.getAudioTracks()[0]]));
//                     tabSource.connect(destination);
//                 }

//                 if (micStream && micStream.getAudioTracks().length > 0) {
//                     const micSource = audioContext.createMediaStreamSource(micStream);
//                     micSource.connect(destination);
//                 }
                
//                 const combinedStream = new MediaStream([
//                     ...screenStream.getVideoTracks(),
//                     ...destination.stream.getAudioTracks()
//                 ]);

//                 recordedChunks = [];
//                 mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
            
//                 mediaRecorder.ondataavailable = (e) => {
//                     if (e.data.size > 0) recordedChunks.push(e.data);
//                 };

//                 mediaRecorder.onstop = () => {
//                     const blob = new Blob(recordedChunks, { type: "video/webm" });
//                     const url = URL.createObjectURL(blob);
//                     const a = document.createElement('a');
//                     a.href = url;
//                     a.download = `JSL_Meet_Recording_${Date.now()}.webm`;
//                     a.click();
//                     URL.revokeObjectURL(url);
//                 };

//                 screenStream.getVideoTracks()[0].onended = () => {
//                     stopRecording();
//                 };

//                 mediaRecorder.start(1000);
//                 isRecording = true;
//                 isPaused = false;

//                 btnText.innerText = "Stop";
//                 toggleBtn.style.backgroundColor = "#dc2626";
//                 btnIcon.innerHTML = `<rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"></rect>`;
                
//                 pauseBtn.style.display = "flex";
//                 pauseBtn.innerText = "Pause";
//                 pauseBtn.style.backgroundColor = "#3f3f46";

//                 statusEl.style.color = "#ef4444";
//                 statusEl.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
//                 statusEl.style.borderColor = "rgba(239, 68, 68, 0.3)";
//                 statusDot.style.backgroundColor = "#ef4444";

//                 seconds = 0;
//                 timerInterval = setInterval(() => {
//                     seconds++;
//                     const mins = Math.floor(seconds / 60);
//                     const secs = seconds % 60;
//                     statusText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//                 }, 1000);

//             } catch (err) {
//                 if (err.name !== "NotAllowedError") {
//                     console.error("Capture failed:", err);
//                 }
//                 statusText.innerText = 'Cancelled';
//             }
//         } else {
//             stopRecording();
//         }
//     };

//     function stopRecording() {
//         if (mediaRecorder && isRecording) {
//             mediaRecorder.stop();
//         }
//         isRecording = false;
//         isPaused = false;
//         clearInterval(timerInterval);

//         btnText.innerText = "Record";
//         toggleBtn.style.backgroundColor = "#2563eb";
//         btnIcon.innerHTML = `<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>`;

//         pauseBtn.style.display = "none"

//         statusText.innerText = "Ready";
//         statusEl.style.color = "#4ade80";
//         statusEl.style.backgroundColor = "rgba(74, 222, 128, 0.12)";
//         statusEl.style.borderColor = "rgba(74, 222, 128, 0.3)";
//         statusDot.style.backgroundColor = "#4ade80";
//     }
// }

if (!document.getElementById('screen-recorder-widget')) {
    const container = document.createElement('div');
    container.id = 'screen-recorder-widget';
    container.style.cssText = `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 2147483647 !important;
        background: rgba(22, 22, 24, 0.95) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        color: #ffffff !important;
        padding: 10px 14px !important;
        border-radius: 16px !important;
        border: 1px solid rgba(255, 255, 255, 0.15) !important;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.6) !important;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        user-select: none !important;
        box-sizing: border-box !important;
        width: 320px !important;
    `;

    container.innerHTML = `
        <!-- Top Row: Logo, Title & Close -->
        <div id="recorder-header" style="display: flex; align-items: center; justify-content: space-between; cursor: move; width: 100%;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <img id="jsl-logo-img" alt="JSL Logo" style="width: 22px; height: 25px; object-fit: contain; border-radius: 4px;">
                <div>
                    <div style="font-size: 12px; font-weight: 700; color: #ffffff; letter-spacing: 0.3px;">JSL WORKS <span style="font-size: 9px; color: #3b82f6; font-weight: 500;">Meet Recorder</span></div>
                </div>
            </div>
            <button id="recorder-close-btn" style="background: none; border: none; font-size: 14px; cursor: pointer; color: #a1a1aa; padding: 2px 6px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: color 0.2s;">
                ✕
            </button>
        </div>

        <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1);"></div>

        <!-- Controls Row: Status, Record/Pause & Stop -->
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <!-- Status Pill -->
            <div id="recorder-status" style="font-size: 11px; font-weight: 500; color: #4ade80; background: rgba(74, 222, 128, 0.12); padding: 4px 10px; border-radius: 20px; display: flex; align-items: center; gap: 6px; border: 1px solid rgba(74, 222, 128, 0.25);">
                <span id="status-dot" style="width: 6px; height: 6px; border-radius: 50%; background-color: #4ade80; display: inline-block;"></span>
                <span id="status-text">Ready</span>
            </div>

            <!-- Buttons Group -->
            <div style="display: flex; gap: 6px; align-items: center;">
                <!-- Pause/Resume Button (Hidden initially) -->
                <button id="recorder-pause-btn" style="background: #3f3f46; color: #ffffff; border: none; padding: 6px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; cursor: pointer; display: none; align-items: center; gap: 4px; transition: background 0.2s;">
                    <span id="pause-btn-text">Pause</span>
                </button>

                <!-- Record / Stop Toggle Button -->
                <button id="recorder-toggle-btn" style="background: #2563eb; color: #ffffff; border: none; padding: 6px 14px; border-radius: 12px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;">
                    <svg id="btn-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>
                    </svg>
                    <span id="btn-text">Record</span>
                </button>
            </div>
        </div>

        <!-- Footer / Watermark Row -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 9px; color: #71717a; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 4px; margin-top: 2px;">
            <span>© JSL WORKS • Proprietary</span>
            <span style="color: #f97316; font-weight: 600;">🇮🇳 Made in India</span>
        </div>
    `;

    document.body.appendChild(container);

    // Safely assign logo source and error handler via JavaScript
    const logoImg = document.getElementById('jsl-logo-img');
    if (logoImg) {
        logoImg.src = "https://yt3.googleusercontent.com/ez9cd366O3ArqsrekYPjArl0INAzQZ1cYr5hBGh45wSO2-2gi-qL3VvFdL8MtvmG18OM6NN5=s900-c-k-c0x00ffffff-no-rj";
        logoImg.onerror = () => {
            logoImg.style.display = 'none';
        };
    }

    // --- DRAG LOGIC ---
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    const header = container.querySelector('#recorder-header');

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        container.style.cursor = 'grabbing';
        offsetX = e.clientX - container.getBoundingClientRect().left;
        offsetY = e.clientY - container.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        container.style.bottom = 'auto';
        container.style.right = 'auto';
        container.style.left = `${e.clientX - offsetX}px`;
        container.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        container.style.cursor = 'default';
    });

    // --- RECORDING & PAUSE LOGIC ---
    let mediaRecorder;
    let recordedChunks = [];
    let isRecording = false;
    let isPaused = false;
    let timerInterval;
    let seconds = 0;

    const statusEl = document.getElementById('recorder-status');
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    const toggleBtn = document.getElementById('recorder-toggle-btn');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const pauseBtn = document.getElementById('recorder-pause-btn');
    const pauseBtnText = document.getElementById('pause-btn-text');
    const closeBtn = document.getElementById('recorder-close-btn');

    closeBtn.onclick = () => {
        if (isRecording && mediaRecorder) mediaRecorder.stop();
        container.remove();
    };

    // Pause / Resume handler
    pauseBtn.onclick = () => {
        if (!mediaRecorder) return;
        if (!isPaused) {
            mediaRecorder.pause();
            isPaused = true;
            clearInterval(timerInterval);
            pauseBtnText.innerText = "Resume";
            pauseBtn.style.backgroundColor = "#d97706";

            statusText.innerText = "Paused";
            statusEl.style.color = "#fbbf24";
            statusEl.style.backgroundColor = "rgba(251, 191, 36, 0.12)";
            statusEl.style.borderColor = "rgba(251, 191, 36, 0.3)";
            statusDot.style.backgroundColor = "#fbbf24";
        } else {
            mediaRecorder.resume();
            isPaused = false;
            pauseBtnText.innerText = "Pause";
            pauseBtn.style.backgroundColor = "#3f3f46";

            statusEl.style.color = "#ef4444";
            statusEl.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
            statusEl.style.borderColor = "rgba(239, 68, 68, 0.3)";
            statusDot.style.backgroundColor = "#ef4444";

            timerInterval = setInterval(() => {
                seconds++;
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                statusText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
            }, 1000);
        }
    };

    toggleBtn.onclick = async () => {
        if (!isRecording) {
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({
                    video: { width: 1920, height: 1080, frameRate: 60 },
                    audio: true
                });

                const micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
                
                const audioContext = new AudioContext();
                const destination = audioContext.createMediaStreamDestination();
                
                if (screenStream.getAudioTracks().length > 0) {
                    const tabSource = audioContext.createMediaStreamSource(new MediaStream([screenStream.getAudioTracks()[0]]));
                    tabSource.connect(destination);
                }

                if (micStream && micStream.getAudioTracks().length > 0) {
                    const micSource = audioContext.createMediaStreamSource(micStream);
                    micSource.connect(destination);
                }
                
                const combinedStream = new MediaStream([
                    ...screenStream.getVideoTracks(),
                    ...destination.stream.getAudioTracks()
                ]);

                recordedChunks = [];
                mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
            
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunks, { type: "video/webm" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `JSL_Meet_Recording_${Date.now()}.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                };

                screenStream.getVideoTracks()[0].onended = () => {
                    stopRecording();
                };

                mediaRecorder.start(1000);
                isRecording = true;
                isPaused = false;

                // UI updates for Recording state
                btnText.innerText = "Stop";
                toggleBtn.style.backgroundColor = "#dc2626";
                btnIcon.innerHTML = `<rect x="6" y="6" width="12" height="12" fill="currentColor" rx="2"></rect>`;
                
                pauseBtn.style.display = "flex";
                pauseBtnText.innerText = "Pause";
                pauseBtn.style.backgroundColor = "#3f3f46";

                statusEl.style.color = "#ef4444";
                statusEl.style.backgroundColor = "rgba(239, 68, 68, 0.12)";
                statusEl.style.borderColor = "rgba(239, 68, 68, 0.3)";
                statusDot.style.backgroundColor = "#ef4444";

                seconds = 0;
                timerInterval = setInterval(() => {
                    seconds++;
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    statusText.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                }, 1000);

            } catch (err) {
                if (err.name !== "NotAllowedError") {
                    console.error("Capture failed:", err);
                }
                statusText.innerText = 'Cancelled';
            }
        } else {
            stopRecording();
        }
    };

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
        }
        isRecording = false;
        isPaused = false;
        clearInterval(timerInterval);

        btnText.innerText = "Record";
        toggleBtn.style.backgroundColor = "#2563eb";
        btnIcon.innerHTML = `<circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon>`;
        
        pauseBtn.style.display = "none";

        statusText.innerText = "Ready";
        statusEl.style.color = "#4ade80";
        statusEl.style.backgroundColor = "rgba(74, 222, 128, 0.12)";
        statusEl.style.borderColor = "rgba(74, 222, 128, 0.3)";
        statusDot.style.backgroundColor = "#4ade80";
    }
}