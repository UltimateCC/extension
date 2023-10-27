import { initPosition, toggleLockPosition } from "./draggable.js";
import { loadSettings, loadLanguageOptions } from "./settings.js";

// We wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // We listen for the Twitch API to be ready
    // window.Twitch.ext.onAuthorized((auth) => {
    //     if(streamerId) return;
    //     console.log('got auth');
    //     // Get the channel ID
    //     const streamerId = auth.channelId;
    //     loadLanguage(streamerId); // Load the language for settings
    // });

    // loadLanguageOptions(246852061)
    //     .then(currentLanguage => {
    //         if(currentLanguage == "empty") return;
    //         updateCaptionLanguage(currentLanguage);
    //     })
    //     .catch(error => {
    //         console.log(error);
    //         return;
    //     });

    initPosition();
    loadSettings();
    
    showExtension();
});

function showExtension() {
    // Show the extension body
    const extension = document.getElementById("ultimate-closed-caption");
    extension.style.display = "block";
}

class CaptionWebSocketManager {
    constructor() {
        this.currentWebSocket = null;
    }

    // Public methods
    startWebSocket(languageCode) {
        console.log("Connecting to WebSocket...");
        if (this.currentWebSocket) {
            this.currentWebSocket.close();
            console.log("Connection closed. New connection in progress...");
        }

        const newWebSocket = new WebSocket("ws://127.0.0.1:8080/?lang=" + languageCode);

        newWebSocket.onopen = () => {
            console.log("Connected to WebSocket");
            this.currentWebSocket = newWebSocket;
        }

        newWebSocket.onmessage = (event) => {
            this._updateContent(JSON.parse(event.data));
        }

        newWebSocket.onerror = (event) => {
            console.error("Error WebSocket :", event);
        }

        newWebSocket.onclose = (event) => {
            console.log("Connection WebSocket closed :", event);
            this.currentWebSocket = null;
        }
    }

    // Private methods
    _updateContent(newContent) {
        const newMsg = newContent.message;
        document.getElementById("second-caption").innerHTML = newMsg;
    }
}

// A global instance of the WebSocket manager
const captionWebSocketManager = new CaptionWebSocketManager();
export function updateCaptionLanguage(language) {
    captionWebSocketManager.startWebSocket(language);
}

// Menu
const textMenu = document.getElementById("group-text");
const textMenuHeader = textMenu.getElementsByClassName("caption-group-header")[0];

const backgroundMenu = document.getElementById("group-background");
const backgroundMenuHeader = backgroundMenu.getElementsByClassName("caption-group-header")[0];

textMenuHeader.addEventListener("click", () => {
    textMenu.classList.toggle("isOpen");
    backgroundMenu.classList.remove("isOpen");
});

backgroundMenuHeader.addEventListener("click", () => {
    backgroundMenu.classList.toggle("isOpen");
    textMenu.classList.remove("isOpen");
});

export function closeAllMenu() {
    textMenu.classList.remove("isOpen");
    backgroundMenu.classList.remove("isOpen");
}
