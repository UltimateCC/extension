import { setCookie, getCookie, deleteCookie, convertHexToRGB, setSettingProperty } from "./utils.js";
import { initPosition, saveIfLocked, startDraggable, stopDraggable, setNewPosition } from "./draggable.js";
import { updateCaptionLanguage, closeAllMenu } from "./main.js";

export function loadSettings() {
    // Buttons to open and close the settings menu
    const settingsBtn = document.getElementById("caption-settings-btn");
    const settingsCloseBtn = document.getElementById("caption-settings-close-btn");

    // == Input fields ==
    // Language
    const languageInput = document.getElementById("language-input");

    // Text
    const fontColorInput = document.getElementById("font-color-input");
    const fontSizeInput = document.getElementById("font-size-input");
    const fontFamilyInput = document.getElementById("font-family-input");
    const maxLinesInput = document.getElementById("max-lines-input");
    const strokeColorInput = document.getElementById("stroke-color-input");
    const strokeSizeInput = document.getElementById("stroke-size-input");

    // Background
    const bgColorInput = document.getElementById("bg-color-input");
    const bgOpacityNumberInput = document.getElementById("bg-opacity-number-input");
    const bgOpacityRangeInput = document.getElementById("bg-opacity-range-input");

    // Units
    const unitFontSize = document.getElementById("font-size-unit");
    const unitStrokeSize = document.getElementById("stroke-size-unit");
    const unitBgOpacity = document.getElementById("bg-opacity-unit");

    // Buttons
    const resetSettings = document.getElementById("caption-reset-settings");
    const resetPosition = document.getElementById("caption-reset-position");
    const lockPosition = document.getElementById("caption-lock-position");

    // == Container ==
    const mainContainer = document.getElementById("caption-movable-area");
    const settingsContainer = document.getElementById("caption-settings");
    const captionBox = document.getElementById("caption-box");

    // Setting menu open or closed
    let settingsIsOpen = false;

    initSettings();

    function initSettings() {
        const cookieSettingsContent = getCookie("captionSettingsContent");
        var settingsContent;
        if (cookieSettingsContent) {
            settingsContent = JSON.parse(cookieSettingsContent);
        } else {
            // Default settings
            settingsContent = {
                "fontColor": "#ffffff",
                "fontSize": 16,
                "fontFamily": "Arial",
                "maxLines": 2,
                "backgroundColor": "#37373E",
                "backgroundOpacity": 50,
                "strokeColor": "#000000",
                "strokeSize": 0
            };
        }
        if (settingsContent) {
            // Set CSS variables
            setSettingProperty("font-color", convertHexToRGB(settingsContent.fontColor));
            setSettingProperty("font-size", settingsContent.fontSize + "px");
            setSettingProperty("font-family", settingsContent.fontFamily);
            setSettingProperty("max-lines", settingsContent.maxLines);
            setSettingProperty("background-color", convertHexToRGB(settingsContent.backgroundColor));
            setSettingProperty("background-opacity", (settingsContent.backgroundOpacity * 0.01).toFixed(2));
            setSettingProperty("stroke-color", settingsContent.strokeColor);
            setSettingProperty("stroke-size", settingsContent.strokeSize + "px");

            // Set input values
            if (settingsContent.language) languageInput.value = settingsContent.language;
            
            fontColorInput.value = settingsContent.fontColor;
            fontSizeInput.value = settingsContent.fontSize;
            fontFamilyInput.value = settingsContent.fontFamily;
            fontFamilyInput.style.fontFamily = settingsContent.fontFamily;
            maxLinesInput.value = settingsContent.maxLines;
            bgColorInput.value = settingsContent.backgroundColor;
            bgOpacityNumberInput.value = settingsContent.backgroundOpacity;
            bgOpacityRangeInput.value = settingsContent.backgroundOpacity;
            strokeColorInput.value = settingsContent.strokeColor;
            strokeSizeInput.value = settingsContent.strokeSize;

            // Number for units
            unitFontSize.innerText = settingsContent.fontSize;
            unitStrokeSize.innerText = settingsContent.strokeSize;
            unitBgOpacity.innerText = settingsContent.backgroundOpacity;

            // Set blur with opacity
            captionBox.style.backdropFilter = "blur(" + (settingsContent.backgroundOpacity * 0.1) + "px)";
        }
    }

    // Handle root variables on input change
    function handleLanguageInput() {
        updateCaptionLanguage(languageInput.value);
        setCookie("captionSettingsLanguage", languageInput.value, 365); // Save language for 1 year
    }

    function handleFontColorInput() {
        updateSetting("font-color", convertHexToRGB(fontColorInput.value));
    }

    function handleFontSizeInput() {
        if (fontSizeInput.value < 8) fontSizeInput.value = 8;
        if (fontSizeInput.value > 100) fontSizeInput.value = 100;
        updateSetting("font-size", fontSizeInput.value + "px", true);
        unitFontSize.innerText = fontSizeInput.value;
    }

    function handleFontFamilyInput() {
        updateSetting("font-family", fontFamilyInput.value, true);
        fontFamilyInput.style.fontFamily = fontFamilyInput.value;
    }

    function handleMaxLinesInput() {
        if (maxLinesInput.value < 1) maxLinesInput.value = 1;
        if (maxLinesInput.value > 20) maxLinesInput.value = 20;
        updateSetting("max-lines", maxLinesInput.value, true);
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
        captionBox.style.backdropFilter = "blur(" + (bgOpacityNumberInput.value * 0.1) + "px)";
        updateSetting("background-opacity", (bgOpacityNumberInput.value * 0.01).toFixed(2));
        unitBgOpacity.innerText = bgOpacityNumberInput.value;
    }

    function handleStrokeColorInput() {
        updateSetting("stroke-color", strokeColorInput.value);
    }

    function handleStrokeSizeInput() {
        updateSetting("stroke-size", strokeSizeInput.value + "px");
        unitStrokeSize.innerText = strokeSizeInput.value;
    }

    function updateSetting(variableName, newValue, updatePosition = false) {
        setSettingProperty(variableName, newValue);
        updateSettingData();
        if (updatePosition) setNewPosition();
    }

    // Update cookie with new settings
    function updateSettingData() {
        const settings = {
            "fontColor": fontColorInput.value,
            "fontSize": fontSizeInput.value,
            "fontFamily": fontFamilyInput.value,
            "maxLines": maxLinesInput.value,
            "backgroundColor": bgColorInput.value,
            "backgroundOpacity": bgOpacityNumberInput.value,
            "strokeColor": strokeColorInput.value,
            "strokeSize": strokeSizeInput.value
        };

        setCookie("captionSettingsContent", JSON.stringify(settings), 365); // Save settings for 1 year
    }

    function handleResetSettings() {
        deleteCookie("captionSettingsContent");
        initSettings();
    }

    function handleResetPosition() {
        deleteCookie("captionSettingsPosition");
        initPosition();
    }

    function handleLockPosition() {
        var isLocked;
        if (captionBox.classList.contains("locked")) {
            // Stop locked
            captionBox.classList.remove("locked");
            lockPosition.innerText = "Lock position";
            startDraggable();
            isLocked = false;
        } else {
            // Start locked
            captionBox.classList.add("locked");
            lockPosition.innerText = "Unlock position";
            stopDraggable();
            isLocked = true;
        }
        saveIfLocked(isLocked);
    }

    function handleSettingsContainerClick(event) {
        if (event.target === mainContainer) closeSettings();
    }


    // Open and close settings menu
    settingsBtn.addEventListener("click", function () {
        (settingsIsOpen) ? closeSettings() : openSettings();
    });
    
    function openSettings() {
        settingsIsOpen = true;

        languageInput.addEventListener("change", handleLanguageInput);

        fontColorInput.addEventListener("input", handleFontColorInput);
        fontSizeInput.addEventListener("change", handleFontSizeInput);
        fontFamilyInput.addEventListener("change", handleFontFamilyInput);
        maxLinesInput.addEventListener("change", handleMaxLinesInput);
        bgColorInput.addEventListener("input", handleBgColorInput);
        bgOpacityNumberInput.addEventListener("input", handleBgOpacityInput);
        bgOpacityRangeInput.addEventListener("input", handleBgOpacityRange);
        strokeColorInput.addEventListener("input", handleStrokeColorInput);
        strokeSizeInput.addEventListener("input", handleStrokeSizeInput);

        resetSettings.addEventListener("click", handleResetSettings);
        resetPosition.addEventListener("click", handleResetPosition);
        lockPosition.addEventListener("click", handleLockPosition);

        // Open and close settings menu
        mainContainer.addEventListener("click", handleSettingsContainerClick);
        settingsCloseBtn.addEventListener("click", closeSettings);
        
        // Show settings
        settingsContainer.style.display = "flex";
        settingsBtn.classList.add("isOpen");
    }

    function closeSettings() {
        settingsIsOpen = false;

        languageInput.removeEventListener("change", handleLanguageInput);

        fontColorInput.removeEventListener("input", handleFontColorInput);
        fontSizeInput.removeEventListener("change", handleFontSizeInput);
        fontFamilyInput.removeEventListener("change", handleFontFamilyInput);
        maxLinesInput.removeEventListener("change", handleMaxLinesInput);
        bgColorInput.removeEventListener("input", handleBgColorInput);
        bgOpacityNumberInput.removeEventListener("input", handleBgOpacityInput);
        bgOpacityRangeInput.removeEventListener("input", handleBgOpacityRange);
        strokeColorInput.removeEventListener("input", handleStrokeColorInput);
        strokeSizeInput.removeEventListener("input", handleStrokeSizeInput);

        resetSettings.removeEventListener("click", handleResetSettings);
        resetPosition.removeEventListener("click", handleResetPosition);
        lockPosition.removeEventListener("click", handleLockPosition);
        
        //Hide settings
        closeAllMenu();
        settingsContainer.style.display = "none";
        settingsBtn.classList.remove("isOpen");
    }
}

export async function loadLanguageOptions(streamerId) {
    const selectLanguage = document.getElementById("language-input");

    try {
        const response = await fetch(`http://localhost:5000/v1/user/languages/${streamerId}`, {
            method: "GET",
            headers: {
                "Content-Type": "text/plain",
            }
        });
        const languages = await response.json();

        if (!languages) throw new Error("No languages available");

        const availableLanguages = Object.values(languages)[0];

        if (!availableLanguages || availableLanguages.length === 0) {
            throw new Error("No languages available");
        }

        selectLanguage.innerHTML = ""; // Remove old content
        availableLanguages.forEach(language => {
            const option = document.createElement("option");
            option.text = language;
            option.value = language;
            selectLanguage.add(option);
        });

        // Select the option selected in the cookie
        const cookieLanguage = getCookie("captionSettingsLanguage");
        if (cookieLanguage) {
            selectLanguage.value = cookieLanguage;
            return cookieLanguage;
        } else {
            selectLanguage.value = availableLanguages[0];
            return availableLanguages[0];
        }
    } catch (error) {
        console.error(error);
        selectLanguage.innerHTML = ""; // Remove old content
        const option = document.createElement("option");
        option.text = "No languages available sorry :(";
        option.value = "empty";
        option.disabled = true;
        selectLanguage.add(option);
        selectLanguage.value = "empty";
        return "empty";
    }
}