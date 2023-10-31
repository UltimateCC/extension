import { getData, setData } from "./utils.js";
import { handleLockPosition, toggleSettings } from "./settings.js";

const captionBox = document.getElementById("caption-container");

function saveDataPosition(top = null, left = null) {
    top = (top == null) ? captionBox.offsetTop : top;
    left = (left == null) ? captionBox.offsetLeft : left;

    // Save the new position
    setData("position", top + "," + left);
}

export function initPosition() {
    const rawPosition = getData("position");
    console.log(rawPosition);

    var newTop = 0, newLeft = 0;
    if (rawPosition) {
        const settingsPosition = rawPosition.split(",");
        newTop = settingsPosition[0];
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
        newTop = captionMovableArea.offsetHeight < 100 ? captionMovableArea.offsetHeight : captionMovableArea.offsetHeight - 100;
        newTop -= captionBox.offsetHeight;
        console.log(newTop, captionMovableArea.offsetHeight, captionBox.offsetWidth, captionMovableArea.getBoundingClientRect());
        console.log(document.getElementById("ultimate-closed-caption").offsetHeight);

        if(captionBoxIsHidden) {
            captionBox.style.display = "none";
            captionBox.style.opacity = 1;
        }
    }

    console.log("Init at pos : ", newTop, newLeft);
    setNewPosition(newTop, newLeft);

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
        setNewPosition(captionBox.offsetTop - deltaY, captionBox.offsetLeft - deltaX);
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

export function setNewPosition(newTop, newLeft) {
    const captionMovableArea = document.getElementById("caption-movable-area");

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

    console.log("Rects : ", captionMovableAreaRect, captionBoxRect);

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
}

// On resize, reposition the caption box
window.addEventListener("resize", () => {
    console.log("resize");
    const newTop = captionBox.style.top;
    const newLeft = captionBox.style.left;
    setNewPosition(parseInt(newTop), parseInt(newLeft));
});