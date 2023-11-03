import { getData, setData } from "./utils.js";
import { handleLockPosition } from "./settings.js";

const captionContainer = document.getElementById("caption-container");
const captionMovableArea = document.getElementById("caption-movable-area");

function getBottom() {
    return captionContainer.style.bottom ? parseFloat(captionContainer.style.bottom) : 0;
}

function getLeft() {
    return captionContainer.style.left ? parseFloat(captionContainer.style.left) : 0;
}

function saveDataPosition(bottom = null, left = null) {
    bottom = (bottom == null) ? getBottom() : bottom;
    left = (left == null) ? getLeft() : left;

    // Save the new position
    setData("position", bottom + "," + left);
}

export function initPosition() {
    console.log("Init position");
    const rawPosition = getData("position");

    var newBottom = 0, newLeft = 0;
    if (rawPosition) {
        const settingsPosition = rawPosition.split(",");
        newBottom = parseFloat(settingsPosition[0]);
        newLeft = parseFloat(settingsPosition[1]);
    } else {

        const captionContainerIsHidden = captionContainer.style.display == "none" || !captionContainer.classList.contains("show");
        const captionMovableAreaIsHidden = captionMovableArea.style.display == "none" || !captionMovableArea.classList.contains("show");
        if(captionContainerIsHidden || captionMovableAreaIsHidden) {
            captionContainer.style.opacity = 0;
            captionContainer.style.display = "block";
            captionMovableArea.style.opacity = 0;
            captionMovableArea.style.display = "block";
        }

        // Center
        newLeft = 50  - captionContainer.offsetWidth * 50 / captionMovableArea.offsetWidth;
        newBottom = 10;

        if(captionContainerIsHidden || captionMovableAreaIsHidden) {
            captionContainer.style.display = "";
            captionContainer.style.opacity = "";
            captionMovableArea.style.display = "";
            captionMovableArea.style.opacity = "";
        }
    }


    setNewPosition(newBottom, newLeft);

    (getData("isLocked") == "true") ? handleLockPosition() : startDraggable();

    // Save the new position
    saveDataPosition(newBottom, newLeft);
}

export function startDraggable() {
    var mouseX = 0, mouseY = 0;

    captionContainer.onmousedown = dragMouseDown;

    // Credits: W3Schools how to make a draggable element
    function dragMouseDown(e) {
        e.preventDefault();
        // toggleSettings(false);
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

        const newBottom = getBottom() + (deltaY * 100 / captionMovableArea.offsetHeight);
        const newLeft = getLeft() - (deltaX * 100 / captionMovableArea.offsetWidth);

        // Check if the mouse is click
        if (e.buttons !== 1) return closeDragElement();
        setNewPosition(newBottom, newLeft);
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Save the new position when the user stops dragging
        saveDataPosition();
    }
}

export function stopDraggable() {
    captionContainer.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}

export function setNewPosition(newBottom = null, newLeft = null) {
    if(newBottom == null || newLeft == null) {
        if(captionContainer.style.bottom == null || captionContainer.style.left == null) {
            initPosition();
        } else {
            if(newBottom == null) newBottom = getBottom();
            if(newLeft == null) newLeft = getLeft();
        }
    }

    // Get information about the element and the box
    const captionMovableAreaRect = captionMovableArea.getBoundingClientRect();

    const captionContainerIsHidden = captionContainer.style.display == "none";
    if(captionContainerIsHidden) {
        captionContainer.style.opacity = 0;
        captionContainer.style.display = "block";
    }

    const captionContainerRect = captionContainer.getBoundingClientRect();

    if(captionContainerIsHidden) {
        captionContainer.style.display = "";
        captionContainer.style.opacity = "";
    }

    const maxBottom = 100 - captionContainerRect.height * 100 / captionMovableAreaRect.height;
    const maxLeft = 100 - captionContainerRect.width * 100 / captionMovableAreaRect.width;
    newBottom = (newBottom < 0) ? 0 : (newBottom < maxBottom) ? newBottom : maxBottom;
    newLeft = (newLeft < 0) ? 0 : (newLeft < maxLeft) ? newLeft : maxLeft;

    // Set the new position
    captionContainer.style.bottom = newBottom + "%";
    captionContainer.style.left = newLeft + "%";
}