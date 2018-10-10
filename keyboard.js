var keyStat = {
    str: "",
    code: null,
    down: false,
    up: false
};

function handleKeyDown(e) {
    keyStat.str += String.fromCharCode(e.keyCode);
    keyStat.code = e.keyCode;
    keyStat.down = true;
}

function handleKeyUp(e) {
    keyStat.str = "";
    keyStat.code = e.keyCode;
    keyStat.up = true;
}

class KeyActions {
    constructor() {}
    onKeyDown() {
        keyStat.down = false;
    }
    onKeyUp() {
        keyStat.up = false;
    }
}

var keyDeal = new KeyActions();