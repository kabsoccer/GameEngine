canvas = document.getElementById("viewport");
ctx = canvas.getContext('2d');

var fps = 60;

var gameOver = false;
var defaultGameOverText = "Game Over";

var defaultFont = "40px Comic Sans MS";

window.onbeforeunload = function() {
    return "Are you sure you want to refresh? You may lose all your data!";
}

function init() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    mouseDeal = new MyMouseActions();
    keyDeal = new MyKeyActions();

    quadCapacity = 4;
    quadDepth = 10;
    initQuad();

    contentInit();

    if (sessionStorage.length > 0) scores[highScoreId].updateHighScore(parseInt(sessionStorage.getItem(this.hs)));

    systemTime = new SystemDelT();
}

function update() {
    if (gameOver) return;

    if (mouseStat.leftClick) mouseDeal.onLeftClick();
    if (mouseStat.rightClick) mouseDeal.onRightClick();
    if (mouseStat.leftDown) mouseDeal.onLeftDown();
    if (mouseStat.leftUp) mouseDeal.onLeftUp();
    if (mouseStat.rightDown) mouseDeal.onRightDown();
    if (mouseStat.rightUp) mouseDeal.onRightUp();
    if (mouseStat.drag) mouseDeal.onDrag();
    if (mouseStat.move) mouseDeal.onMove();

    if (keyStat.down) keyDeal.onKeyDown();
    if (keyStat.up) keyDeal.onKeyUp();

    if (mouseCandidate) handleMouseCollisions();
    if (collisionCandidates.length > 0) handleCollisions();

    for (var i = 0; i < timers.length; ++i) timers[i].updateTimer();

    contentUpdate();

    systemTime.update();
}

function draw(context = ctx) {
    if (gameOver) {
        context.textAlign = "center";
        context.font = "100px Comic Sans MS";
        context.fillStyle = "red";
        context.fillText(defaultGameOverText, canvas.width / 2, canvas.height / 2);
        return;
    }

    canvas.width = canvas.width;

    contentShade();
    contentDraw();

    for (var i = 0; i < scores.length; ++i) scores[i].draw();
    for (var i = 0; i < timers.length; ++i) timers[i].draw();
}

function game_loop() {
    update();
    draw();
}

function main(hs) {
    this.hs = hs;
    init();
    setInterval(game_loop, 1000 / fps);
}

function endGame() {
    for (var i = 0; i < scoreId.length; ++i) {
        scores[highScoreId].updateHighScore(scores[scoreId[i]].score);
    }
    sessionStorage.setItem(this.hs, scores[highScoreId].getText());
    draw();
    gameOver = true;
}