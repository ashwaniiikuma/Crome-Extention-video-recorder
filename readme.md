{
    "manifest_version": 3,
    "name": "Google Meet Free Recorder",
    "version": "1.0",
    "description": "Record Google Meet sessions with tab and microphone audio without limits.",
    "permissions": [
        "activeTab",
        "tabCapture",
        "downloads",
        "storage"
    ],
    "content_scripts": [
        {
            "matches": ["https://meet.google.com/*"],
            "js": ["content.js"]
        }
    ],
    "action": {
        "default_popup": "popup.html"
    },
    "background": {
        "service_worker": "background.js"
    }
}