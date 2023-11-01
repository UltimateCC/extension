import { getData, setData } from "./utils.js";
import { handleLockPosition } from "./settings.js";

const captionBox = document.getElementById("caption-container");
const captionMovableArea = document.getElementById("caption-movable-area");

function getBottom() {
    return captionBox.style.bottom ? parseFloat(captionBox.style.bottom) : 0;
}

function getLeft() {
    return captionBox.style.left ? parseFloat(captionBox.style.left) : 0;
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

        const captionBoxIsHidden = captionBox.style.display == "none";
        const captionMovableAreaIsHidden = captionMovableArea.style.display == "none";
        if(captionBoxIsHidden || captionMovableAreaIsHidden) {
            captionBox.style.opacity = 0;
            captionBox.style.display = "block";
            captionMovableAreaIsHidden.style.opacity = 0;
            captionMovableAreaIsHidden.style.display = "block";
        }

        // Center
        newLeft = 50  - captionBox.offsetWidth * 50 / captionMovableArea.offsetWidth;
        newBottom = 10;

        if(captionBoxIsHidden || captionMovableAreaIsHidden) {
            captionBox.style.display = "none";
            captionBox.style.opacity = 1;
            captionMovableAreaIsHidden.style.display = "none";
            captionMovableAreaIsHidden.style.opacity = 1;
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
    captionBox.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;
}

export function setNewPosition(newBottom = null, newLeft = null) {
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

    const maxBottom = 100 - captionBoxRect.height * 100 / captionMovableAreaRect.height;
    const maxLeft = 100 - captionBoxRect.width * 100 / captionMovableAreaRect.width;
    newBottom = (newBottom < 0) ? 0 : (newBottom < maxBottom) ? newBottom : maxBottom;
    newLeft = (newLeft < 0) ? 0 : (newLeft < maxLeft) ? newLeft : maxLeft;


    // Set the new position
    captionBox.style.bottom = newBottom + "%";
    captionBox.style.left = newLeft + "%";
}

// On resize, reposition the caption box
window.addEventListener("resize", () => {
    setNewPosition();
});