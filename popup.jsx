import React, { useEffect, useState, useRef } from "react";
import { createRoot } from 'react-dom/client';

function App() {
    const [isRecording, setIsRecording] = useState(false);
    const [statusText, setStatusText] = useState("Ready to record");
    const [seconds, setSeconds] = useState(0);
    
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // Timer logic
    useEffect(() => {
        let interval = null;
        if (isRecording) {
            interval = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
            setSeconds(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (sec) => {
        const mins = Math.floor(sec / 60);
        const remainingSecs = sec % 60;
        return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
    };

    // Start Recording with Screen/Tab Selection Dialog
    const handleStart = async () => {
        try {
            // 1. Yeh browser ka native screen/tab selection dialog kholega!
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { width: 1920, height: 1080, frameRate: 30 },
                audio: true
            });

            // 2. Microphone audio capture (optional)
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);

            // 3. Web Audio API se Tab audio aur Mic audio ko mix karna
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

            // Video aur Mixed Audio ko combine karna
            const combinedStream = new MediaStream([
                ...screenStream.getVideoTracks(),
                ...destination.stream.getAudioTracks()
            ]);

            recordedChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);

                // Automatically download file
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Google_Meet_Recording_${Date.now()}.webm`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            };

            // Agar user screen share cancel kar de
            screenStream.getVideoTracks()[0].onended = () => {
                handleStop();
            };

            mediaRecorder.start(1000);
            setIsRecording(true);
            setStatusText('Recording in progress...');
        } catch (error) {
            console.error("Error starting screen capture:", error);
            setStatusText('Cancelled or Error');
        }
    };

    const handleStop = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        setStatusText('Recording stopped. Downloading...');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '240px', padding: '12px', fontFamily: 'sans-serif' }}>

       {/* Header with Icon and Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>Meet Recorder Pro</span>
                </div>
                <button
                    onClick={() => window.close()}
                    style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer', color: '#888', padding: '2px 6px', borderRadius: '4px' }}
                >
                    ✕
                </button>
            </div>
            
            <div style={{
                fontSize: '12px',
                fontWeight: '500',
                color: isRecording ? '#ef4444' : '#4ade80',
                backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.12)' : 'rgba(74, 222, 128, 0.12)',
                padding: '8px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: isRecording ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(74, 222, 128, 0.3)'
            }}>

                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isRecording ? '#ef4444' : '#4ade80', display: 'inline-block', boxShadow: isRecording ? '0 0 8px #ef4444' : 'none' }}></span>
                <span>{statusText}</span>
                {isRecording && <span style={{ fontWeight: '600' }}>({formatTime(seconds)})</span>}
            </div>

            {!isRecording ? (
                <button
                    onClick={handleStart}
                    style={{
                        backgroundColor: '#2563eb',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon></svg>
                    Start Recording
                </button>
            ) : (
                <button
                    onClick={handleStop}
                    style={{
                        backgroundColor: '#d93025',
                        color: '#ffffff',
                        border: 'none',
                        padding: '10px 18px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        width: '100%',
                        dispaly:'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6" fill="currentColor"></rect></svg>
                    Stop Recording
                </button>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);