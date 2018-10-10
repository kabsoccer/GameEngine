var mouseStat = {
    x: null,
    y: null,
    leftClick: false,
    rightClick: false,
    leftDown: false,
    leftUp: false,
    rightDown: false,
    rightUp: false,
    drag: false,
    move: false
};

function handleClick(e) {
    if (e.which == 1) mouseStat.leftClick = true;
    else mouseStat.rightClick = true;
}

function handleMouseDown(e) {
    if (e.which == 1) mouseStat.leftDown = true;
    else mouseStat.rightDown = true;
    mouseStat.drag = true;
}

function handleMouseUp(e) {
    if (e.which == 1) mouseStat.leftUp = true;
    else mouseStat.rightUp = true;
    mouseStat.drag = false;
}

function handleMouseMove(e) {
    mouseStat.x = e.clientX;
    mouseStat.y = e.clientY;
    mouseStat.move = true;
}

class MouseActions {
    constructor() {}

    onLeftClick() {
        mouseStat.leftClick = false;
    }

    onRightClick() {
        mouseStat.rightClick = false;
    }

    onLeftDown() {
        mouseStat.leftDown = false;
    }

    onLeftUp() {
        mouseStat.leftUp = false;
    }

    onRightDown() {
        mouseStat.rightDown = false;
    }

    onRightUp() {
        mouseStat.rightUp = false;
    }

    onDrag() {

    }
    
    onMove() {
    	mouseStat.move = false;
    }
}

var mouseDeal = new MouseActions();