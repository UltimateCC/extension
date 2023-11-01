import { getData, setData } from "./utils.js";
import { handleLockPosition } from "./settings.js";

const captionBox = document.getElementById("caption-container");

function getBottom() {
    return captionBox.style.bottom ? parseInt(captionBox.style.bottom) : 0;
}

function getLeft() {
    return captionBox.style.left ? parseInt(captionBox.style.left) : 0;
}

function saveDataPosition(bottom = null, left = null) {
    bottom = (bottom == null) ? getBottom() : bottom;
    left = (left == null) ? getLeft() : left;

    // Save the new position
    setData("position", bottom + "," + left);
}

export function initPosition() {
    const rawPosition = getData("position");

    var newBottom = 0, newLeft = 0;
    if (rawPosition) {
        const settingsPosition = rawPosition.split(",");
        newBottom = settingsPosition[0];
        newLeft = settingsPosition[1];
    } else {
        const captionMovableArea = document.getElementById("caption-movable-area");

        const captionBoxIsHidden = captionBox.style.display == "none";
        if(captionBoxIsHidden) {
            captionBox.style.opacity = 0;
            captionBox.style.display = "block";
        }

        // Center
        newLeft = (captionMovableArea.offsetWidth - captionBox.offsetWidth) / 2;
        newBottom = captionMovableArea.offsetHeight < 100 ? captionMovableArea.offsetHeight : captionMovableArea.offsetHeight - 100;
        newBottom -= captionBox.offsetHeight;

        if(captionBoxIsHidden) {
            captionBox.style.display = "none";
            captionBox.style.opacity = 1;
        }
    }

    setNewPosition(newBottom, newLeft);

    (getData("isLocked") == "true") ? handleLockPosition() : startDraggable();
}

export function startDraggable() {
    var mouseX = 0, mouseY = 0;

    captionBox.onmousedown = dragMouseDown;

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

        // Check if the mouse is click
        if (e.buttons !== 1) return closeDragElement();
        setNewPosition(getBottom() + deltaY, getLeft() - deltaX);
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
        
        // Save the new position when the user stops dragging
        saveDataPosition();
    }
}

export function stopDraggable() {
    captionBox.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}

export function setNewPosition(newBottom = null, newLeft = null) {
    const captionMovableArea = document.getElementById("caption-movable-area");

    if(newBottom == null) newBottom = getBottom();
    if(newLeft == null) newLeft = getLeft();

    // Get information about the element and the box
    const captionMovableAreaRect = captionMovableArea.getBoundingClientRect();

    const captionBoxIsHidden = captionBox.style.display == "none";
    if(captionBoxIsHidden) {
        captionBox.style.opacity = 0;
        captionBox.style.display = "block";
    }

    const captionBoxRect = captionBox.getBoundingClientRect();

    if(captionBoxIsHidden) {
        captionBox.style.display = "none";
        captionBox.style.opacity = 1;
    }

    // Check if the new position is inside the container 
    if (newBottom < 0) {
        newBottom = 0;
    } else if (newBottom > captionMovableAreaRect.height - captionBoxRect.height) {
        newBottom = captionMovableAreaRect.height - captionBoxRect.height;
    }

    // Check if the new position is inside the container
    if (newLeft < 0) {
        newLeft = 0;
    } else if (newLeft > captionMovableAreaRect.width - captionBoxRect.width) {
        newLeft = captionMovableAreaRect.width - captionBoxRect.width;
    }

    // Set the new position
    captionBox.style.bottom = newBottom + "px";
    captionBox.style.left = newLeft + "px";
}

// On resize, reposition the caption box
window.addEventListener("resize", () => {
    setNewPosition();
});