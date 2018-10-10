var bubbleImages = [
    "images/bubble_red.png",
    "images/bubble_green.png",
    "images/bubble_blue.png",
    "images/bubble_yellow.png",
    "images/bubble_purple.png",
    "images/bubble_cyan.png"
]

function randomColor(numColors) {
    return bubbleImages[Math.floor(Math.random() * numColors)];
}

var sheetFrameWidth;
var sheetFrameHeight;

var bubbleSpriteId;
var movingBubbleId;
var bubbleSpeed;
var bubbleDiameter;

var bubblesNeededToPop;
var bubblePopDelay;
var popCountDown;

var willPop;
var secondPop;

var checkBubble;

var level;

var dir;

class Level {
    constructor(totRows = 5, initRows = 3, numColors = 2, timeInterval = 20, inventorySize = 3) {
        this.totRows = totRows;
        this.initRows = initRows;
        this.numColors = numColors;
        this.timeInterval = timeInterval;
        this.inventorySize = inventorySize;
        this.populate();
    }

    update() {
        for (var i = timers.length - 1; i >= 0; --i) timers[i].deleteTimer();

        this.totRows += 2;

        this.initRows += 1;
        if (this.initRows > 6) this.initRows = 6;

        this.numColors += 1;
        if (this.numColors > 6) this.numColors = 6;

        this.timeInterval -= 2;
        if (this.timeInterval < 10) this.timeInterval = 10;

        if (this.totRows >= 11) this.inventorySize = 2;

        this.populate();
    }

    populate() {
        sprites[bubbleSpriteId].init(this.timeInterval, this.numColors, this.initRows, this.totRows);
        sprites[movingBubbleId].init(this.inventorySize, this.numColors);
    }
}

class BubbleSprite extends GridSprite {
    init(timeInterval, numColors, rowsInitiallyShown, rows, columns = Math.floor(canvas.width / bubbleDiameter)) {
        super.init(bubbleDiameter, rows, columns,
            (canvas.width - columns * bubbleDiameter) / 2, (rowsInitiallyShown - rows) * bubbleDiameter);

        this.timeInterval = timeInterval;
        this.numColors = numColors;

        for (var i = 0; i < rows; ++i) {
            for (var j = 0; j < columns; ++j) {
                this.placeInGrid(newBubble(this.id, randomColor(this.numColors)), i, j);
            }
        }

        new Timer(this.timeInterval, this.timerFunction.bind(this));
    }

    timerFunction() {
        this.update();
        new Timer(this.timeInterval, this.timerFunction.bind(this));
    }

    update() {
        if (this.gridY + this.tileSize > 0) return;
        checkBubble = this.translate(0, 1);
    }
}

class MovingBubbleSprite extends Sprite {
    init(inventorySize, numColors) {
        this.clr();
        this.inventory = [];

        this.inventorySize = inventorySize;
        this.numColors = numColors;

        for (var i = 0; i < this.inventorySize; ++i) {
            this.inventory.push(newBubble(this.id, randomColor(this.numColors)));
            this.inventory[i].updateLoc((canvas.width - bubbleDiameter) / 2 - bubbleDiameter * i * 1.5,
                canvas.height - 1 * bubbleDiameter);
        }
    }

    update(delT) {
        for (var i = 0; i < this.pics.length; ++i) {
            var bubble = this.pics[i];
            if (bubble.vx == 0 && bubble.vy == 0) continue;

            bubble.addLoc(bubble.vx * delT, bubble.vy * delT);

            if (bubble.x < 0) {
                bubble.updateLoc(-bubble.x, bubble.y);
                bubble.vx *= -1;
            } else if (bubble.x > canvas.width - bubble.width) {
                bubble.updateLoc(2 * (canvas.width - bubble.width) - bubble.x, bubble.y);
                bubble.vx *= -1;
            }

            collisionCandidates.push([bubble.id, bubble.pid]);
        }

        for (var i = this.pics.length - 1; i >= 0; --i) {
            if (this.pics[i].y < -bubbleDiameter) {
                this.deletePic(i);

                scores[scoreId[0]].updateScore(-2);
            }
        }
    }

    shoot(mouseX, mouseY) {
        if (this.pics.length > this.inventorySize || !willPop.isEmpty()) return;

        var bubble = this.inventory[0];
        if (bubble.y <= mouseY) return;

        var dist = Math.hypot(bubble.x - mouseX, bubble.y - mouseY);
        bubble.updateVelocity((mouseX - bubble.x) / dist * bubbleSpeed, (mouseY - bubble.y) / dist * bubbleSpeed);

        this.inventory.shift();
        this.inventory.push(newBubble(this.id, randomColor(this.numColors)));
        for (var i = 0; i < this.inventory.length; ++i) {
            this.inventory[i].updateLoc((canvas.width - bubbleDiameter) / 2 - bubbleDiameter * i * 1.5,
                canvas.height - 1 * bubbleDiameter);
        }
    }
}

function newBubble(id, color = null) {
    var bubble = (id == movingBubbleId) ? new Picture(id, false) : new Picture(id);

    bubble.setSize(bubbleDiameter, bubbleDiameter);
    bubble.setShape("ellipse");
    bubble.updateVelocity(0, 0);

    bubble.setSpriteSheet(color, sheetFrameWidth, sheetFrameHeight, 5, 3, 3, false);

    bubble.animationEnd = function() {
        sprites[bubble.id].deletePic(bubble.pid);
        if (bubble.pid < sprites[bubble.id].pics.length) sprites[bubble.id].pics[bubble.pid].draw();
    }

    sprites[id].addNewPic(bubble);
    return bubble;
}

function removeDisconnected() {
    while (!secondPop.isEmpty()) {
        var dr = [0, 1, 0, -1];
        var dc = [1, 0, -1, 0];

        var r = secondPop.peek().gridRow;
        var c = secondPop.peek().gridColumn;
        secondPop.dequeue();

        var i, j;
        for (i = 0; i < 4; ++i) {
            var sr = r + dr[i];
            var sc = c + dc[i];

            var S = sprites[bubbleSpriteId].bfs(sr, sc);

            for (j = S.a; j < S.b; ++j) {
                if (S.arr[j].y == 0) break;
            }

            if (j == S.b) willPop.group_enqueue(S);
        }
    }

    secondPop.clr();
}

function removeBubbles(sp, new_pic) {
    ++sprites[sp].True;

    willPop = sprites[sp].bfs(new_pic.gridRow, new_pic.gridColumn, function(sr, sc, r, c, nr, nc) {
        if (this.grid[nr][nc].img.src != this.grid[sr][sc].img.src) return false;
        return true;
    }.bind(sprites[sp]));

    if (willPop.getLength() < bubblesNeededToPop) {
        willPop.clr();
        checkBubble = new_pic;
    } else secondPop.group_enqueue(willPop);
}

function selectMousePics(x, y, c) {

}

function resolveCollisions(s, p, c) {
    if (c.length == 0) return;

    var old_pic = sprites[s].pics[p];
    var new_pic = newBubble(bubbleSpriteId, old_pic.img.src);
    var pre_pic = sprites[c[0][0]].pics[c[0][1]];

    if (sprites[c[0][0]].grid[pre_pic.gridRow][pre_pic.gridColumn] == null)
        sprites[c[0][0]].grid[pre_pic.gridRow][pre_pic.gridColumn] = pre_pic;

    if (Math.abs(old_pic.x - pre_pic.x) < Math.abs(old_pic.y - pre_pic.y)) {
        if (old_pic.y > pre_pic.y) sprites[bubbleSpriteId].placeInGrid(new_pic, pre_pic.gridRow + 1, pre_pic.gridColumn);
        else sprites[bubbleSpriteId].placeInGrid(new_pic, pre_pic.gridRow - 1, pre_pic.gridColumn);
    } else {
        if (old_pic.x > pre_pic.x) sprites[bubbleSpriteId].placeInGrid(new_pic, pre_pic.gridRow, pre_pic.gridColumn + 1);
        else sprites[bubbleSpriteId].placeInGrid(new_pic, pre_pic.gridRow, pre_pic.gridColumn - 1);
    }

    sprites[s].deletePic(p);

    removeBubbles(c[0][0], new_pic);
}

class MyScore extends Score {
    extraText(pre) {
        this.pre = pre;
    }

    draw(context = ctx) {
        if (this.isDrawable && this.x != -1 && this.y != -1) {
            context.font = this.font;
            context.fillText(this.pre + this.str, this.x, this.y);
        }
    }
}

class MyMouseActions extends MouseActions {
    onLeftDown() {
        super.onLeftDown();
        sprites[movingBubbleId].shoot(mouseStat.x - bubbleDiameter / 2.0, mouseStat.y - bubbleDiameter / 2.0);
    }
}

class MyKeyActions extends KeyActions {
    onKeyDown() {
        super.onKeyDown();
        if (keyStat.code == 40) sprites[bubbleSpriteId].update();
    }
}

function contentUpdate() {
    sprites[movingBubbleId].update(systemTime.delT / 1000);

    if (!willPop.isEmpty()) {
        if (popCountDown == 0) {
            scores[scoreId[0]].updateScore();
            willPop.dequeue().startAnimation();
            popCountDown = bubblePopDelay;
        } else --popCountDown;
    } else if (!secondPop.isEmpty()) {
        removeDisconnected();
        popCountDown = 0;
    } else popCountDown = 0;

    if (sprites[bubbleSpriteId].pics.length == 0) level.update();

    if (checkBubble != null && checkBubble.y + bubbleDiameter > canvas.height - 10) endGame();
    else checkBubble = null;
}

function contentShade() {}

function contentDraw(context = ctx) {
    for (var i = 0; i < sprites.length; ++i) sprites[i].drawAll();

    context.fillStyle = "black";
    context.lineWidth = 5;
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    dir.draw(bubbleDiameter / 2.0, bubbleDiameter * 3.0 / 2.0);
}

function contentInit() {
    initScores(1);

    sheetFrameWidth = 30;
    sheetFrameHeight = 30;

    bubbleSpriteId = 0;
    movingBubbleId = 1;
    bubbleSpeed = 1000;
    bubbleDiameter = 50;

    bubblesNeededToPop = 3;
    bubblePopDelay = 5;
    popCountDown = 0;

    willPop = new Queue();
    secondPop = new Queue();

    checkBubble = null;

    sprites.push(new BubbleSprite(bubbleSpriteId));
    sprites.push(new MovingBubbleSprite(movingBubbleId));

    level = new Level();

    dir = new Direction(sprites[movingBubbleId].inventory[0].x + bubbleDiameter / 2.0,
        sprites[movingBubbleId].inventory[0].y + bubbleDiameter / 2.0);

    scores[scoreId[0]].setLoc(10, canvas.height - 12);
    scores[highScoreId].setLoc(canvas.width - 230, canvas.height - 12);

    scores[scoreId[0]].extraText("Yours: ");
    scores[highScoreId].extraText("High: ");
}