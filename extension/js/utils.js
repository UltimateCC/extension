// Set local storage
function setData(cname, cvalue) {
    localStorage.setItem("ucc_" + cname, cvalue);
}

// Get local storage
function getData(cname) {
    return localStorage.getItem("ucc_" + cname);
}

// Delete local storage
function deleteData(cname) {
    localStorage.removeItem("ucc_" + cname);
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

const FADE_IN_OUT = 100;

function fadeIn(element) {
    if(element.classList.contains('show')) return;
    element.classList.add('show');
    element.classList.add('fade-in');
    setTimeout(() => {
        element.classList.remove('fade-in');
    }, FADE_IN_OUT);
}

function fadeOut(element) {
    if(!element.classList.contains('show')) return;
    element.classList.add('fade-out');
    setTimeout(() => {
        element.classList.remove('show');
        element.classList.remove('fade-out');
    }, FADE_IN_OUT);
}

export { setData, getData, deleteData, convertHexToRGB, setSettingProperty, fadeIn, fadeOut };