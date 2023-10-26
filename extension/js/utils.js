// Set cookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    document.cookie = cname + "=" + cvalue.toString() + ";expires=" + d.toUTCString() + ";path=/";
}

// Get cookie by name
function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; ++i) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }

        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

// Delete cookie by name
function deleteCookie(cname) {
    document.cookie = cname + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Convert #ffffff to 255, 255, 255
function convertHexToRGB(hex) {
    if (!hex) return "";
    hex = hex.replace('#', '');
    return parseInt(hex.substring(0, 2), 16) + ", " + parseInt(hex.substring(2, 4), 16) + ", " + parseInt(hex.substring(4, 6), 16);
}

// Set CSS variable
function setSettingProperty(variableName, newValue = "") {
    if (newValue === "") {
        document.documentElement.style.removeProperty(`--caption-${variableName}`);
        return;
    }
    document.documentElement.style.setProperty(`--caption-${variableName}`, newValue);
}

export { setCookie, getCookie, deleteCookie, convertHexToRGB, setSettingProperty };