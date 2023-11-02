import { setData, getData, fadeIn, fadeOut } from "./utils.js";
import { initPosition, setNewPosition } from "./draggable.js";
import { initSettings, toggleSettings, setSelectOptions } from "./settings.js";

let currentLanguageCode = getData("language") || "stt"; // Global variable to store the current language code

const body = document.getElementById("ultimate-closed-caption");

export function setCurrentLang(language) {
    currentLanguageCode = language;
}

export function getCurrentLang() {
    return currentLanguageCode;
}

// We wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // TODO: Find a better way to check if the dom is fully loaded
    setTimeout(function() {
        loadExtension();
        body.style.removeProperty("display");
    }, 500);
});

let notStarted = true;
function loadExtension() {
    const finishedContent = document.getElementById("finished-content");
    const unfinishedContent = document.getElementById("unfinished-content");
    
    const captionsContainer = document.getElementById("caption-container");
    const toggleCaptionBtn = document.getElementById("toggle-captions");
    const toggleSettingsBtn = document.getElementById("toggle-settings");

    let content = "";
    let notFinishedContent = "";
    let lastAllCaptions;
    let hlsLatencyBroadcaster = 0;

    initPosition();
    initSettings();
    initButtons();

    // We listen for the Twitch pubsub event
    window.Twitch.ext.listen('broadcast', (_, contentType, rawBody) => {
        if (contentType !== 'application/json') {
            console.error('Ultimate CC : Received broadcast message but content-type is not JSON');
            return;
        }

        const body = JSON.parse(rawBody);
        const allCaptions = body?.captions;
        if(!allCaptions) {
            console.error("Ultimate CC : No captions found");
            return;
        }

        const timeToWait = hlsLatencyBroadcaster * 1000 - body.delay;
        setTimeout(function() {
            updateContent();
        }, timeToWait);

        function updateContent() {
            // On the first message, we get the list of languages
            if(notStarted) {
                notStarted = false;
                content = "";
                finishedContent.content = "";
                setSelectOptions(allCaptions.map(caption => caption.lang).sort()); // Set select options from the list of languages translated
                if (toggleCaptionBtn.classList.contains("isShow")) {
                    toggleCaptions(true); // Show the captions on the first message
                }
            }

            const newLanguageCode = (currentLanguageCode !== "stt") ? currentLanguageCode : allCaptions[0].lang;
            if(body.final) {
                const caption = allCaptions.find(caption => caption.lang == newLanguageCode);
                if (caption && caption.text) content += " " + caption.text;
                finishedContent.innerText = content;
                notFinishedContent = "";
                unfinishedContent.innerText = notFinishedContent;
            } else {
                const notFinishedCaption = allCaptions.find(caption => caption.lang == newLanguageCode);
                if (notFinishedCaption && notFinishedCaption.text) notFinishedContent += " " + notFinishedCaption.text;
                unfinishedContent.innerText = notFinishedContent;
            }

            // We limit the number of words to approximately 400
            content = content.split(" ").slice(-400).join(" ");
            lastAllCaptions = allCaptions;
        }
    });

    window.addEventListener('languageChanged', function() {
        if(lastAllCaptions == null) return;
        const newLanguageCode = (currentLanguageCode !== "stt") ? currentLanguageCode : lastAllCaptions[0].lang;
        const caption = lastAllCaptions.find(caption => caption.lang == newLanguageCode);
        if (caption && caption.text) content = caption.text;
        finishedContent.innerText = content;
    });

    // We check if arePlayerControlsVisible
    window.Twitch.ext.onContext((context, changed) => {
        if (changed.includes('arePlayerControlsVisible')) {
            if(!toggleSettingsBtn.classList.contains("isOpen")) toggleButtons(context.arePlayerControlsVisible === true);
        } 
        if (changed.includes('hlsLatencyBroadcaster')) {
            hlsLatencyBroadcaster = context.hlsLatencyBroadcaster;
        }
    });

    function toggleButtons(willBeShow) {
        const captionBtnContainer = document.getElementById("buttons-container");
        // if(!willBeShow) toggleSettings(false);
        captionBtnContainer.classList.toggle("show", willBeShow);
    }
    
    // == Buttons container ==
    function toggleCaptions(willBeShow = null) {
        if(willBeShow == null) willBeShow = !toggleCaptionBtn.classList.contains("isShow");
        if(!toggleSettingsBtn.classList.contains("isOpen") && !notStarted) {
            // captionsContainer.classList.toggle("show", willBeShow);
            if(willBeShow) {
                fadeIn(captionsContainer);
            } else {
                fadeOut(captionsContainer);
            }
        }
        setData("isVisible", willBeShow);
        toggleCaptionBtn.classList.toggle("isShow", willBeShow);

        // Get svg from google icons Closed Caption (normal and disabled) Rounded
        const closedCaptioningSVG = '<svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 -960 960 960"><path d="M200-160q-33 0-56.5-23.5T120-240v-480q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v480q0 33-23.5 56.5T760-160H200Zm0-80h560v-480H200v480Zm80-120h120q17 0 28.5-11.5T440-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T400-600H280q-17 0-28.5 11.5T240-560v160q0 17 11.5 28.5T280-360Zm400-240H560q-17 0-28.5 11.5T520-560v160q0 17 11.5 28.5T560-360h120q17 0 28.5-11.5T720-400v-20q0-9-6-15t-15-6h-18q-9 0-15 6t-6 15h-80v-120h80q0 9 6 15t15 6h18q9 0 15-6t6-15v-20q0-17-11.5-28.5T680-600ZM200-240v-480 480Z"/></svg>'
        const closedCaptioningSlashSVG = '<svg xmlns="http://www.w3.org/2000/svg" height="1.2em" viewBox="0 -960 960 960"><path d="M275-800h485q33 0 56.5 23.5T840-720v485l-80-80v-405H355l-80-80Zm385 380q0-8 6-14t14-6h20q8 0 14 6t6 14v20q0 9-3.5 17.5T706-369l-51-51h5ZM560-600h120q17 0 28.5 11.5T720-560v25q0 8-6 14t-14 6h-20q-8 0-14-6t-6-14v-5h-80v45l-60-60v-5q0-17 11.5-28.5T560-600Zm-2 82Zm-154 74Zm-43-156 60 60H300v120h80v-5q0-8 6-14t14-6h20q8 0 14 6t6 14v25q0 17-11.5 28.5T400-360H280q-17 0-28.5-11.5T240-400v-160q0-17 11.5-28.5T280-600h81ZM168-793l73 73h-41v480h407L55-792q-12-12-12-28.5T55-849q12-12 28.5-12t28.5 12l736 736q12 12 12 28t-12 28q-12 12-28.5 12T791-57L687-160H200q-33 0-56.5-23.5T120-240v-480q0-25 13.5-44.5T168-793Z"/></svg>'
        if(willBeShow) {
            toggleCaptionBtn.innerHTML = closedCaptioningSlashSVG;
        } else {
            toggleCaptionBtn.innerHTML = closedCaptioningSVG;
        }
    }
    toggleCaptionBtn.addEventListener("click", function() {
        toggleCaptions();
    });

    toggleSettingsBtn.addEventListener("click", function() {
        toggleSettings();
    });

    function initButtons() {
        toggleCaptions(getData("isVisible") == "true");
        toggleButtons(true);
    }

    // On resize, reposition the caption box
    window.addEventListener("resize", () => {
        setNewPosition();
    });
}

export function getNotStarted() {
    return notStarted;
}