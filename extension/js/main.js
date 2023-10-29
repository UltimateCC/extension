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

    // We listen for the Twitch pubsub event
    window.Twitch.ext.listen('broadcast', (target, contentType, rawBody) => {
        console.log('Received broadcast message');
        if (contentType === 'application/json') {
            const body = JSON.parse(rawBody);

            // On the first message, we get the list of languages
            if(notStarted) {
                notStarted = false;

                const jsonLangPath = "../storage/languages.json";
                fetch(jsonLangPath)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data);

                        const languagesCodes = body.languages;
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

            const allCaptions = body.message;
            if(allCaptions) {
                if (currentLanguageCode === "") currentLanguageCode = body[0]; // TODO: prendre la première langue de la liste
                const caption = allCaptions[currentLanguageCode];
                if (caption) captionContent.innerHTML = caption;
            }
        }
    });

    window.Twitch.ext.onAuthorized((auth) => {
        console.log('got auth', auth);
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
