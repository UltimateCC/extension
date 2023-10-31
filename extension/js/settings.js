import { setData, getData, deleteData, convertHexToRGB, setSettingProperty } from "./utils.js";
import { initPosition, startDraggable, stopDraggable, setNewPosition } from "./draggable.js";
import { setCurrentLang, getCurrentLang } from "./main.js";

// Header
const closeSettingsButton = document.getElementById("close-settings-button");

// == Input fields ==
// Language
const languageInput = document.getElementById("language-input");

// Text
const fontColorInput = document.getElementById("font-color-input");
const fontSizeInput = document.getElementById("font-size-input");
const fontFamilyInput = document.getElementById("font-family-input");
const maxLinesInput = document.getElementById("max-lines-input");

// Background
const bgColorInput = document.getElementById("bg-color-input");
const bgOpacityNumberInput = document.getElementById("bg-opacity-number-input");
const bgOpacityRangeInput = document.getElementById("bg-opacity-range-input");

// Units
const unitFontSize = document.getElementById("font-size-unit");
const unitBgOpacity = document.getElementById("bg-opacity-unit");

// Buttons
const resetSettings = document.getElementById("caption-reset-settings");
const resetPosition = document.getElementById("caption-reset-position");
const lockPosition = document.getElementById("caption-lock-position");

// == Container ==
const mainContainer = document.getElementById("caption-movable-area");
const settingsContainer = document.getElementById("settings-container");
const captionsContainer = document.getElementById("caption-container");

// == Menu ==
const textMenu = document.getElementById("group-text");
const textMenuHeader = textMenu.getElementsByClassName("caption-group-header")[0];
const backgroundMenu = document.getElementById("group-background");
const backgroundMenuHeader = backgroundMenu.getElementsByClassName("caption-group-header")[0];

const defaultSettingsContent = {
    "font-color": "#ffffff",
    "font-size": 24,
    "font-family": "Arial",
    "max-lines": 2,
    "background-color": "#37373E",
    "background-opacity": 50
};

export function initSettings() {
    const settingsContent = {};
    // Get data from local storage or set default values
    for (const [key, value] of Object.entries(defaultSettingsContent)) {
        const data = getData(key);
        settingsContent[key] = data ? data : value;
    }

    // Set CSS variables
    setSettingProperty("font-color", convertHexToRGB(settingsContent["font-color"]));
    setSettingProperty("font-size", settingsContent["font-size"] + "px");
    setSettingProperty("font-family", settingsContent["font-family"]);
    setSettingProperty("max-lines", settingsContent["max-lines"]);
    setSettingProperty("background-color", convertHexToRGB(settingsContent["background-color"]));
    setSettingProperty("background-opacity", (settingsContent["background-opacity"] * 0.01).toFixed(2));
    setSettingProperty("background-blur", "blur(" + (settingsContent["background-opacity"] * 0.1).toFixed(1) + "px)");

    fontColorInput.value = settingsContent["font-color"];
    fontSizeInput.value = settingsContent["font-size"];
    fontFamilyInput.value = settingsContent["font-family"];
    fontFamilyInput.style.fontFamily = settingsContent["font-family"];
    maxLinesInput.value = settingsContent["max-lines"];
    bgColorInput.value = settingsContent["background-color"];
    bgOpacityNumberInput.value = settingsContent["background-opacity"];
    bgOpacityRangeInput.value = settingsContent["background-opacity"];

    // Number for units
    unitFontSize.innerText = settingsContent["font-size"];
    unitBgOpacity.innerText = settingsContent["background-opacity"];
}

// Menu
textMenuHeader.addEventListener("click", () => {
    textMenu.classList.toggle("isOpen");
    backgroundMenu.classList.remove("isOpen");
});

backgroundMenuHeader.addEventListener("click", () => {
    backgroundMenu.classList.toggle("isOpen");
    textMenu.classList.remove("isOpen");
});

function closeAllMenu() {
    textMenu.classList.remove("isOpen");
    backgroundMenu.classList.remove("isOpen");
}

// Handle root variables on input change
function handleLanguageInput() {
    setCurrentLang(languageInput.value);
    window.dispatchEvent(new Event('languageChanged'));
    setData("language", languageInput.value);
}

function handleFontColorInput() {
    updateSetting("font-color", convertHexToRGB(fontColorInput.value));
}

function handleFontSizeInput() {
    if (fontSizeInput.value < 8) fontSizeInput.value = 8;
    if (fontSizeInput.value > 100) fontSizeInput.value = 100;
    updateSetting("font-size", parseInt(fontSizeInput.value), true);
    unitFontSize.innerText = fontSizeInput.value;
}

function handleFontFamilyInput() {
    updateSetting("font-family", fontFamilyInput.value, true);
    fontFamilyInput.style.fontFamily = fontFamilyInput.value;
}

function handleMaxLinesInput() {
    if (maxLinesInput.value < 1) maxLinesInput.value = 1;
    if (maxLinesInput.value > 20) maxLinesInput.value = 20;
    updateSetting("max-lines", parseInt(maxLinesInput.value), true);
}

function handleBgColorInput() {
    updateSetting("background-color", convertHexToRGB(bgColorInput.value));
}

function handleBgOpacityInput() {
    bgOpacityRangeInput.value = bgOpacityNumberInput.value;
    changeBgOpacity();
}
function handleBgOpacityRange() {
    bgOpacityNumberInput.value = bgOpacityRangeInput.value;
    changeBgOpacity();
}
function changeBgOpacity() {
    if(bgOpacityNumberInput.value < 0) bgOpacityNumberInput.value = 0;
    if(bgOpacityNumberInput.value > 100) bgOpacityNumberInput.value = 100;
    captionsContainer.style.backdropFilter = "blur(" + (bgOpacityNumberInput.value * 0.1) + "px)";
    updateSetting("background-opacity", (bgOpacityNumberInput.value * 0.01).toFixed(2));
    unitBgOpacity.innerText = bgOpacityNumberInput.value;
}

function updateSetting(variableName, newValue, updatePosition = false) {
    setSettingProperty(variableName, newValue);
    setData(variableName, newValue);
    if (updatePosition) setNewPosition();
}

// Buttons
function handleResetSettings() {
    // Delete for each key of defaultSettingsContent
    for (const [key, _] of Object.entries(defaultSettingsContent)) {
        deleteData(key); // Delete all local storage
    }
    initSettings();
}

function handleResetPosition() {
    deleteData("position");
    initPosition();
}

export function handleLockPosition(event = null) {
    var isLocked;
    if (captionsContainer.classList.contains("locked")) {
        // Stop locked
        captionsContainer.classList.remove("locked");
        lockPosition.innerText = "Lock position";
        startDraggable();
        isLocked = false;
    } else {
        // Start locked
        captionsContainer.classList.add("locked");
        lockPosition.innerText = "Unlock position";
        stopDraggable();
        isLocked = true;
    }
    if(event != null) setData("isLocked", isLocked);
}

function handleSettingsContainerClick(event) {
    if (event.target === mainContainer) toggleSettings(false);
}

function openSettings() {
    languageInput.addEventListener("change", handleLanguageInput);

    fontColorInput.addEventListener("input", handleFontColorInput);
    fontSizeInput.addEventListener("change", handleFontSizeInput);
    fontFamilyInput.addEventListener("change", handleFontFamilyInput);
    maxLinesInput.addEventListener("change", handleMaxLinesInput);
    bgColorInput.addEventListener("input", handleBgColorInput);
    bgOpacityNumberInput.addEventListener("input", handleBgOpacityInput);
    bgOpacityRangeInput.addEventListener("input", handleBgOpacityRange);

    resetSettings.addEventListener("click", handleResetSettings);
    resetPosition.addEventListener("click", handleResetPosition);
    lockPosition.addEventListener("click", handleLockPosition);

    // Close settings menu with 2 methods
    mainContainer.addEventListener("click", handleSettingsContainerClick);
    closeSettingsButton.addEventListener("click", function () {
        toggleSettings(false);
    });

    // Show captions
    captionsContainer.style.display = "flex";

    // Show settings
    settingsContainer.style.display = "flex";
}

function closeSettings() {
    languageInput.removeEventListener("change", handleLanguageInput);

    fontColorInput.removeEventListener("input", handleFontColorInput);
    fontSizeInput.removeEventListener("change", handleFontSizeInput);
    fontFamilyInput.removeEventListener("change", handleFontFamilyInput);
    maxLinesInput.removeEventListener("change", handleMaxLinesInput);
    bgColorInput.removeEventListener("input", handleBgColorInput);
    bgOpacityNumberInput.removeEventListener("input", handleBgOpacityInput);
    bgOpacityRangeInput.removeEventListener("input", handleBgOpacityRange);

    resetSettings.removeEventListener("click", handleResetSettings);
    resetPosition.removeEventListener("click", handleResetPosition);
    lockPosition.removeEventListener("click", handleLockPosition);
    
    // Hide captions if is cc is disabled
    const toggleCaptionBtn = document.getElementById("toggle-captions");
    if(!toggleCaptionBtn.classList.contains("isShow")) captionsContainer.style.display = "none";

    //Hide settings
    closeAllMenu();
    settingsContainer.style.display = "none";
}

export function toggleSettings(willBeShow = null) {
    const toggleSettingsBtn = document.getElementById("toggle-settings");

    if(willBeShow == null) willBeShow = settingsContainer.style.display === "none";
    toggleSettingsBtn.classList.toggle("isOpen", willBeShow);
    (willBeShow ? openSettings : closeSettings)();
}

export async function setSelectOptions(languagesCodes) {
    const languageInput = document.getElementById("language-input");
    const jsonLangPath = "../storage/languages.json";

    let languageDictionary = null;

    try {
        const response = await fetch(jsonLangPath);
        if (!response.ok) throw new Error("Failed to fetch language data");

        languageDictionary = await response.json();
    } catch (error) {
        console.error("Ultimate CC: Error while fetching languages", error);
    }

    // Clear the select options
    languageInput.innerHTML = "";

    const optionElement = document.createElement("option");
    optionElement.value = "stt";
    optionElement.innerText = "Speech recognition";
    languageInput.appendChild(optionElement);

    for (let i = 0; i < languagesCodes.length; ++i) {
        const languageCode = languagesCodes[i];
        const languageName = languageDictionary[languageCode] ? languageDictionary[languageCode] : languageCode;

        const optionElement = document.createElement("option");
        optionElement.value = languageCode;
        optionElement.innerText = languageName;
        languageInput.appendChild(optionElement);
    }

    languageInput.value = getCurrentLang();
    languageInput.disabled = false;
}