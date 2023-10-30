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
    var newTop = 0, newLeft = 0;
    if (rawPosition) {
        const settingsPosition = rawPosition.split(",");
        newTop = settingsPosition[0];
        newLeft = settingsPosition[1];
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
        }

        // Center
        newLeft = (window.innerWidth - captionBox.offsetWidth) / 2;
        newTop = window.innerHeight < 100 ? window.innerHeight : window.innerHeight - 100;
        
        if (bodyWasHidden) {
            bodyDOM.style.display = "none";
            bodyDOM.style.opacity = "";
        }     
    }

    setNewPosition(newTop, newLeft);

    (getData("isLocked") == "true") ? handleLockPosition() : startDraggable();
}

export function startDraggable() {
    var mouseX = 0, mouseY = 0;

    captionBox.onmousedown = dragMouseDown;

    // Credits: W3Schools how to make a draggable element
    function dragMouseDown(e) {
        e.preventDefault();
        toggleSettings(false);
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

    // Update the data
    if(mustSave) saveDataPosition(newTop, newLeft);
}

// On resize, reposition the caption box
window.addEventListener("resize", () => {
    setNewPosition();
});