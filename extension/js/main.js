import { setData, getData, fadeIn, fadeOut } from "./utils.js";
import { initPosition } from "./draggable.js";
import { initSettings, toggleSettings, setSelectOptions } from "./settings.js";

let currentLanguageCode = getData("language") || "stt"; // Global variable to store the current language code

export function setCurrentLang(language) {
    currentLanguageCode = language;
}

export function getCurrentLang() {
    return currentLanguageCode;
}

// We wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    // TODO: Find a better way to check if the dom is fully loaded
    // setTimeout(function() {
        loadExtension();
    // }, 200);
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

        // Get svg from file '../img/closed-captioning.svg'
        const closedCaptioningSVG = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><path d="M512 80c8.8 0 16 7.2 16 16V416c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16H512zM64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM200 208c14.2 0 27 6.1 35.8 16c8.8 9.9 24 10.7 33.9 1.9s10.7-24 1.9-33.9c-17.5-19.6-43.1-32-71.5-32c-53 0-96 43-96 96s43 96 96 96c28.4 0 54-12.4 71.5-32c8.8-9.9 8-25-1.9-33.9s-25-8-33.9 1.9c-8.8 9.9-21.6 16-35.8 16c-26.5 0-48-21.5-48-48s21.5-48 48-48zm144 48c0-26.5 21.5-48 48-48c14.2 0 27 6.1 35.8 16c8.8 9.9 24 10.7 33.9 1.9s10.7-24 1.9-33.9c-17.5-19.6-43.1-32-71.5-32c-53 0-96 43-96 96s43 96 96 96c28.4 0 54-12.4 71.5-32c8.8-9.9 8-25-1.9-33.9s-25-8-33.9 1.9c-8.8 9.9-21.6 16-35.8 16c-26.5 0-48-21.5-48-48z"/></svg>'
        const closedCaptioningSlashSVG = '<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24"><path d="M24.01 22.59 22.6 24l-7.24-7.24c-1.4-.55-2.35-1.98-2.35-3.76v-2c0-2.28 1.56-4 3.62-4h.29c1.4 0 2.69.96 3.28 2.45l-1.86.74C18.05 9.47 17.49 9 16.92 9h-.29c-.96 0-1.62.82-1.62 2v2c0 1.18.67 2 1.62 2h.29c.57 0 1.11-.44 1.41-1.16l1.85.77c-.42 1.02-1.15 1.77-2.01 2.13l2.25 2.25h1.59V6c0-.55-.45-1-1-1H6.41l2.05 2.05c1.18.21 2.22 1.11 2.73 2.4l-1.86.74C9.04 9.47 8.48 9 7.91 9h-.29C6.66 9 6 9.82 6 11v2c0 1.18.67 2 1.62 2h.29c.57 0 1.11-.44 1.41-1.16l1.85.77C10.56 16.08 9.31 17 7.91 17h-.29C5.55 17 4 15.28 4 13v-2c0-1.62.79-2.96 1.99-3.6L0 1.41 1.41 0l3.01 3.01H21c1.65 0 3 1.35 3 3v15h-1.59L24 22.6zM2 19V6.24L.36 4.6C.14 5.02 0 5.49 0 6v15h16.76l-2-2z"></path></svg>'
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
}

export function getNotStarted() {
    return notStarted;
}