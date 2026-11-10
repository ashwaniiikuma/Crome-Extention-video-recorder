let mediaRecorder;
let recordedChunks = [];
let isRecordingActive = false;

// Listen for message from popup.jsx
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "GET_STATUS") {
        sendResponse({ isRecording: isRecordingActive });
    } else if (request.action === "START_RECORDING") {
        startCapture();
        sendResponse({ status: "Started" });
    } else if (request.action === "STOP_RECORDING") {
        stopCapture();
        sendResponse({ status: "Stopped" });
    }
    return true;
});

// 1. Start Capture Function (Ensure this name is exact)
async function startCapture() {
    try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: "tab", width: 1920, height: 1080, frameRate: 30 },
            audio: true
        });

        // 2. Capture user microphone audio
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // 3. Mix tab audio + microphone audio using Web Audio API
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        if (stream.getAudioTracks().length > 0) {
            const tabAudioSource = audioContext.createMediaStreamSource(new MediaStream([stream.getAudioTracks()[0]]));
            tabAudioSource.connect(destination);
        }

        if (micStream.getAudioTracks().length > 0) {
            const micAudioSource = audioContext.createMediaStreamSource(micStream);
            micAudioSource.connect(destination);
        }

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes("meet.google.com")) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ["content.js"]
        }).catch((err) => console.log("Injection error: ", err));
    }
});

        // Combine video track and mixed audio track into a single stream
        const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
        ]);

        // Initialize MediaRecorder
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm;codecs=vp9,opus' });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        chrome.action.onClicked.addListener(() => {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        width: 280,
        height: 220,
        focused: true
    });
});
        mediaRecorder.onstop = () => {
            isRecordingActive = false;
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);

            // Automatically download the recorded video to local hardware
            chrome.downloads.download({
                url: url,
                filename: `Google_Meet_Recording_${Date.now()}.webm`
            });
        };

        mediaRecorder.start(1000);
        isRecordingActive = true;
        console.log("Recording started successfully.");

    } catch (error) {
        isRecordingActive = false;
        console.log("Error starting capture:", error);
    }
}

// 4. Stop Capture Function
function stopCapture() {
    if (mediaRecorder && isRecordingActive) {
        mediaRecorder.stop();
        isRecordingActive = false;
        console.log("Recording stopped.");
    }
}