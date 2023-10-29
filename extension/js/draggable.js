import { getCookie, setCookie } from "./utils.js";

const captionBox = document.getElementById("caption-box");

export function saveIfLocked(isLocked) {
    saveCookiePosition(null, null, isLocked);
}

function saveCookiePosition(top = null, left = null, isLocked = null) {
    const cookieSettingsPosition = getCookie("captionSettingsPosition"); // Get cookie
    if (cookieSettingsPosition) {
        const cookieContent = JSON.parse(cookieSettingsPosition);
        if (top == null) top = cookieContent.top;
        if (left == null) left = cookieContent.left;
        if (isLocked == null) isLocked = cookieContent.locked;
    } else {
        if (top == null) top = captionBox.offsetTop;
        if (left == null) left = captionBox.offsetLeft;
        if (isLocked == null) isLocked = false;
    }

    // Save the new position
    setCookie("captionSettingsPosition", JSON.stringify({ top: top, left: left, locked: isLocked }), 365);
}

export function initPosition() {
    const cookieSettingsPosition = getCookie("captionSettingsPosition");
    var newTop = 0, newLeft = 0, positionLocked = false;
    if (cookieSettingsPosition) {
        const settingsPosition = JSON.parse(cookieSettingsPosition);
        newTop = settingsPosition.top;
        newLeft = settingsPosition.left;
        positionLocked = settingsPosition.locked;
    } else {
        const bodyDOM = document.getElementById("ultimate-closed-caption");

        /*
        The idea of the following block is to center it on the X-axis and place it at the bottom of the screen - 100px on the Y-axis.
        To achieve this, we need to temporarily set the body's display property to "block" to calculate its width, then set it back to "none". 
        We also set the opacity to 0 to avoid the user seeing the body hide and show.
        */
        const bodyWasHidden = bodyDOM.style.display === "none";
        if (bodyWasHidden) {
            bodyDOM.style.opacity = 0;
            bodyDOM.style.display = "block";
        
            newLeft = (window.innerWidth - captionBox.offsetWidth) / 2;
            newTop = window.innerHeight < 100 ? window.innerHeight : window.innerHeight - 100;
        
            bodyDOM.style.display = "none";
            bodyDOM.style.opacity = "";
        } else {
            // Center
            newLeft = (window.innerWidth - captionBox.offsetWidth) / 2;
            newTop = window.innerHeight < 100 ? window.innerHeight : window.innerHeight - 100;
        }        
    }

    setNewPosition(newTop, newLeft);
    toggleLockPosition(positionLocked);
}

export function startDraggable() {
    var mouseX = 0, mouseY = 0;

    captionBox.onmousedown = dragMouseDown;

    // Credits: W3Schools how to make a draggable element
    function dragMouseDown(e) {
        e.preventDefault();
        mouseX = e.clientX;
        mouseY = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        // Calculate the new cursor position
        const deltaX = mouseX - e.clientX;
        const deltaY = mouseY - e.clientY;
        // Update the cursor position
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Check if the mouse is click
        if (e.buttons !== 1) return closeDragElement();
        setNewPosition(captionBox.offsetTop - deltaY, captionBox.offsetLeft - deltaX);
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Save the new position when the user stops dragging
        saveCookiePosition(captionBox.offsetTop, captionBox.offsetLeft);
    }
}

export function stopDraggable() {
    captionBox.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}

export function setNewPosition(newTop = null, newLeft = null) {
    const captionMovableArea = document.getElementById("caption-movable-area");
    
    // Check if we need to save the new position if its just a check of the position
    var mustSave = false;
    if(newTop == null && newLeft == null) {
        newTop = captionBox.offsetTop;
        newLeft = captionBox.offsetLeft;
        mustSave = true;
    }

    // Get information about the element and the box
    var captionMovableAreaRect, captionBoxRect
    const bodyDOM = document.getElementById("ultimate-closed-caption");
    const bodyWasHidden = bodyDOM.style.display === "none";
    // If the body is hidden, we need to temporarily set the display 
    // property to "block" to calculate the element's position, then set it back to "none".
    if (bodyWasHidden) {
        bodyDOM.style.opacity = 0;
        bodyDOM.style.display = "block";

        captionMovableAreaRect = captionMovableArea.getBoundingClientRect();
        captionBoxRect = captionBox.getBoundingClientRect();

        bodyDOM.style.display = "none";
        bodyDOM.style.opacity = "";
    } else {
        captionMovableAreaRect = captionMovableArea.getBoundingClientRect();
        captionBoxRect = captionBox.getBoundingClientRect();
    }

    // Check if the new position is inside the container 
    if (newTop < 0) {
        newTop = 0;
    } else if (newTop > captionMovableAreaRect.height - captionBoxRect.height) {
        newTop = captionMovableAreaRect.height - captionBoxRect.height;
    }

    // Check if the new position is inside the container
    if (newLeft < 0) {
        newLeft = 0;
    } else if (newLeft > captionMovableAreaRect.width - captionBoxRect.width) {
        newLeft = captionMovableAreaRect.width - captionBoxRect.width;
    }

    // Set the new position
    captionBox.style.top = newTop + "px";
    captionBox.style.left = newLeft + "px";

    // Update the cookie
    if(mustSave) saveCookiePosition(newTop, newLeft);
}

// On resize, reposition the caption box
window.addEventListener("resize", () => {
    setNewPosition();
});

export function toggleLockPosition(isLocked = false) {
    const lockPosition = document.getElementById("caption-lock-position");

    if (isLocked) {
        captionBox.classList.add("locked");
        lockPosition.innerText = "Unlock position";
        stopDraggable();
    } else {
        captionBox.classList.remove("locked");
        lockPosition.innerText = "Lock position";
        startDraggable();
    }
}