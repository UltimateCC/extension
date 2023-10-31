import { getData } from "./utils.js";
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
    setTimeout(function() {
        loadExtension();
    }, 200);
});

function loadExtension() {
    let notStarted = true;
    
    initPosition();
    initSettings();
    
    const captionContent = document.getElementById("caption-content");
    const captionsContainer = document.getElementById("caption-container");
    const toggleCaptionBtn = document.getElementById("toggle-captions");
    const toggleSettingsBtn = document.getElementById("toggle-settings");

    let content = "";
    let lastAllCaptions;

    // We listen for the Twitch pubsub event
    window.Twitch.ext.listen('broadcast', (_, contentType, rawBody) => {
        if (contentType !== 'application/json') {
            console.error('Ultimate CC : Received broadcast message but content-type is not JSON');
            return;
        }

        const body = JSON.parse(rawBody);
        const allCaptions = body.captions;

        // On the first message, we get the list of languages
        if(notStarted) {
            notStarted = false;
            content = "";
            setSelectOptions(allCaptions.map(caption => caption.lang).sort()); // Set select options from the list of languages translated
            if (toggleCaptionBtn.classList.contains("isShow")) {
                toggleCaptions(true); // Show the captions on the first message
            }
        }

        if(allCaptions) {
            const newLanguageCode = (currentLanguageCode !== "stt") ? currentLanguageCode : allCaptions[0].lang;
            const caption = allCaptions.find(caption => caption.lang == newLanguageCode);
            if (caption && caption.text) content += " " + caption.text;
            captionContent.innerText = content;

            // We limit the number of words to 400
            content = content.split(" ").slice(-400).join(" ");
            lastAllCaptions = allCaptions;
        } else {
            console.error("Ultimate CC : No captions found");
        }
    });

    window.addEventListener('languageChanged', function() {
        if(lastAllCaptions == null) return;
        const newLanguageCode = (currentLanguageCode !== "stt") ? currentLanguageCode : lastAllCaptions[0].lang;
        const caption = lastAllCaptions.find(caption => caption.lang == newLanguageCode);
        if (caption && caption.text) content = caption.text;
        captionContent.innerText = content;
    });

    // We check if arePlayerControlsVisible
    window.Twitch.ext.onContext((context, changed) => {
        if (changed.includes('arePlayerControlsVisible')) {
            toggleButtons(context.arePlayerControlsVisible === true);
        }
    });

    function toggleButtons(willBeShow) {
        const captionBtnContainer = document.getElementById("buttons-container");
        // if(!willBeShow) toggleSettings(false);
        captionBtnContainer.style.display = willBeShow ? "flex" : "none";
    }
    
    // == Buttons container ==
    function toggleCaptions(willBeShow = null) {
        if(willBeShow == null) willBeShow = !toggleCaptionBtn.classList.contains("isShow");
        if(!toggleSettingsBtn.classList.contains("isOpen")) captionsContainer.style.display = willBeShow ? "block" : "none";
        toggleCaptionBtn.classList.toggle("isShow", willBeShow);
    }
    toggleCaptionBtn.addEventListener("click", function() {
        toggleCaptions();
    });

    toggleSettingsBtn.addEventListener("click", function() {
        toggleSettings();
    });
}