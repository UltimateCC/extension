import { getCookie } from "./utils.js";
import { initPosition } from "./draggable.js";
import { loadSettings, setSelectOptions } from "./settings.js";

let currentLanguageCode = getCookie("captionLanguage");

export function setCurrentLang(language) {
    currentLanguageCode = language;
}

export function getCurrentLang() {
    return currentLanguageCode;
}

// We wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    let notStarted = true;
    
    initPosition();
    loadSettings();
    
    const captionContent = document.getElementById("caption-content");

    let content = "";

    // We listen for the Twitch pubsub event
    window.Twitch.ext.listen('broadcast', (target, contentType, rawBody) => {
        console.log('Received broadcast message');
        
        if (contentType === 'application/json') {
            const body = JSON.parse(rawBody);
            const allCaptions = body.captions;

            // On the first message, we get the list of languages
            if(notStarted) {
                notStarted = false;
                content = "";

                const jsonLangPath = "../storage/languages.json";
                fetch(jsonLangPath)
                    .then(response => response.json())
                    .then(data => {
                        /*
                            rawBody = {
                                delay: 3101,
                                duration: 3101,
                                captions: [
                                    {
                                    text: "après ce que c'est dans le mail où est-ce que c'est dans settings j'hésite",
                                    lang: 'fr-FR'
                                    }
                                ]
                            }
                        */
                        // Get the list of languages from allCaptions
                        const languagesCodes = allCaptions.map(caption => caption.lang);
                        const languageOptions = [];
                        for (let i = 0; i < languagesCodes.length; ++i) {
                            const languageCode = languagesCodes[i];
                            
                            // Get the language name from the json file (if it exists) else use the language code
                            const languageName = data[languageCode] ? data[languageCode] : languageCode;
                            languageOptions.push({ value: languageCode, label: languageName });
                        }

                        setSelectOptions(languageOptions);
                    })
                    .catch(error => console.error("Error while fetching languages", error))
                    .finally(() => {
                        showExtension(); // Show the extension on the first message)
                    });
            }

            if(allCaptions) {
                if (currentLanguageCode === "") currentLanguageCode = allCaptions[0].lang;
                const caption = allCaptions.find(caption => caption.lang == currentLanguageCode);
                if (caption && caption.text) content += " " + caption.text;
                captionContent.innerHTML = content;
            }
        }
    });
});


function showExtension() {
    // Show the extension body
    const extension = document.getElementById("ultimate-closed-caption");
    extension.style.display = "block";
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
