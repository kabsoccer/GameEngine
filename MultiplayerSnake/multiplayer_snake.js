hud = document.getElementById("heading");

var sampleLevel = [];

var tileSize;

var snakeId = [];
var initSize = [];
var startX = [];
var startY = [];
var initDx = [];
var initDy = [];
var snakeColor = [];
var headColor = [];
var deadColor = [];
var speed = [];

var shadeDepth;
var simpleMovement;

var foodId;
var foodColor;
var spoilColor;
var spoilGenDiff;
var spoilInterval;
var foodTrigger;
var spoilTrigger;
var currentStreak;

var growSize;
var shrinkSize;
var growScore;
var shrinkScore;

var levelId;
var levelColor;

var message = {};
var gameStarted = false;

class Snake extends Sprite {
    constructor(id, size, x, y, dx, dy, sp, sc, hc) {
        super(id);
        super.setBasicColor(sc);
        super.makeKnown();

        var head = new Picture(this.id);
        head.setSize(tileSize, tileSize);
        head.updateLoc(x, y);
        head.addColor(hc);
        super.addNewPic(head);
        this.grow(size - 1);

        this.currentdx = dx;
        this.currentdy = dy;
        this.wanteddx = dx;
        this.wanteddy = dy;
        this.lastMove = 0;
        this.speed = sp;
        this.offset = 0;

        this.dead = false;
    }

    update() {
        if (this.dead) return;

        if (systemTime.currentTime - this.lastMove >= tileSize / this.speed * 1000) {
            for (var i = this.pics.length - 1; i > 0; i--) this.pics[i].updateLoc(this.pics[i - 1].x, this.pics[i - 1].y);

            this.pics[0].addLoc((this.currentdx) * tileSize, (this.currentdy) * tileSize);
            this.currentdx = this.wanteddx;
            this.currentdy = this.wanteddy;

            this.pics[0].rotateAround(0, canvas.width - (canvas.width % tileSize) - tileSize, 0, canvas.height - (canvas.height % tileSize) - tileSize);

            //collisionCandidates.push([this.id, 0]);

            this.lastMove = systemTime.currentTime;
            this.offset = 0;
        } else this.offset = (systemTime.currentTime - this.lastMove) * this.speed / 1000;
    }

    grow(numSegments = 1) {
        for (var i = 0; i < numSegments; ++i) super.clonePic();
    }

    shrink(numSegments = 1) {
        for (var i = 0; i < numSegments && this.pics.length > 1; ++i) super.deletePic(this.pics.length - 1);
    }

    tryLeft() {
        if (this.currentdx == 0 || this.pics.length == 1) this.wanteddx = -1, this.wanteddy = 0;
    }

    tryUp() {
        if (this.currentdy == 0 || this.pics.length == 1) this.wanteddx = 0, this.wanteddy = -1;
    }

    tryRight() {
        if (this.currentdx == 0 || this.pics.length == 1) this.wanteddx = 1, this.wanteddy = 0;
    }

    tryDown() {
        if (this.currentdy == 0 || this.pics.length == 1) this.wanteddx = 0, this.wanteddy = 1;
    }

    die(dc) {
        this.pics[0].addColor(dc);
        this.dead = true;
    }

    drawAll(oneStep = simpleMovement) {
        if (!this.isDrawable) return;

        for (var i = this.pics.length - 1; i > 0; --i) {
            if (oneStep) this.pics[i].draw();
            else this.pics[i].draw(sign(this.pics[i - 1].x - this.pics[i].x, true, 100) * this.offset, sign(this.pics[i - 1].y - this.pics[i].y, true, 100) * this.offset);
        }

        if (oneStep) this.pics[0].draw();
        else this.pics[0].draw((this.currentdx) * this.offset, (this.currentdy) * this.offset);
    }
}

class Food extends TransientSprite {
    constructor(id) {
        super(id);
        super.makeKnown();
    }

    spawnFood(val, scoreVal, timerInterval = -1, color = foodColor) {
        var randLoc = scalarCoordRand((canvas.width / tileSize) - 1, (canvas.height / tileSize) - 1, tileSize);

        var p = new TransientPicture(this.id);
        p.setSize(tileSize, tileSize);
        p.updateLoc(randLoc[0], randLoc[1]);
        p.setValue(val);
        p.setScore(scoreVal);

        if (color != null) p.addColor(color);
        if (timerInterval != -1) p.addTimer(timerInterval);
        else p.setNoTimer();

        super.addNewPic(p);

        collisionCandidates.push([this.id, this.pics.length - 1]);
        handleCollisions();
    }
}

class Level extends Sprite {
    constructor(id, lc = levelColor) {
        super(id);
        super.setBasicColor(lc);
        super.makeKnown();
    }

    populate(sm = sampleLevel) {
        for (var i = 0; i < sm.length; ++i) {
            var center = scalarCoord((canvas.width / tileSize) - 1, (canvas.height / tileSize) - 1, sm[i][0], sm[i][1], tileSize);
            var dim = scalarCoord((canvas.width / tileSize) - 1, (canvas.height / tileSize) - 1, sm[i][2], sm[i][3], tileSize);
            var pos = [center[0] - dim[0], center[1] - dim[1]];
            var size = [2 * dim[0], 2 * dim[1]];

            var p = new Picture(this.id);
            p.setSize(size[0], size[1]);
            p.updateLoc(pos[0], pos[1]);
            super.addNewPic(p);
        }
    }
}

function selectMousePics(x, y, c) {

}

function resolveCollisions(s, p, c) {
    if (c.length == 0) return;
    var latest = findLatestPic(c, s, p);
    var rs = latest[0];
    var rp = latest[1];
    if (rs == -1 && rp == -1) return;

    if (s < snakeId.length) {
        if (rs == foodId) {
            var pic = sprites[rs].pics[rp];
            var mul = 1;

            if (pic.value > 0) {
                scores[s].updateScore(pic.scoreVal);
                sprites[s].grow(pic.value);

                if (++currentStreak >= spoilGenDiff) {
                    currentStreak = 0;
                    spoilTrigger = true;
                }

                foodTrigger = true;
            } else {
                scores[s].updateScore(pic.scoreVal * pic.timer.getRemainingTime());
                mul = pic.timer.getRemainingTime();
                sprites[s].shrink(-pic.value);
            }

            if (s != playerId - 1) {
                message.snake_rev = sprites[snakeId[(3 ^ playerId) - 1]].pics.map(function(p) {
                    return { 'x': p.x, 'y': p.y, 'width': p.width, 'height': p.height, 'color': p.color };
                });

                message.p_rev = pic.scoreVal * mul;
            } else message.p = pic.scoreVal * mul;

            sprites[rs].deletePic(rp);
        } else {
            if (rs < snakeId.length && s != rs) {
                sprites[s].die(deadColor[s]);
                sprites[rs].die(deadColor[rs]);

                scores[s].updateScore(150);
                handleCollisions();
            } else if (s != rs || rp > 1) {
                sprites[s].die(deadColor[s]);
            }
        }
    } else if (s == foodId) {
        if (sprites[s].pics[p].value >= 0) foodTrigger = true;
        else spoilTrigger = true;

        sprites[s].deletePic(p);
    }
}

class MyScore extends Score {
    draw(context = ctx) {
        if (this.id == 0) hud.innerText = "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
        else {
            hud.innerText += "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
            hud.innerText += "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
        }
        if (this.id < highScoreId) hud.innerText += "P" + (this.id + 1) + ": " + scores[scoreId[this.id]].getText();
        else hud.innerText += "Highest: " + scores[highScoreId].getText();
    }
}

class MyMouseActions extends MouseActions {

}

class MyKeyActions extends KeyActions {
    onKeyDown() {
        super.onKeyDown();

        switch (keyStat.code) {
            case 32:
                if (!simpleMovement) simpleMovement = true;
                else simpleMovement = false;
                break;

            case 37:
                sprites[snakeId[playerId - 1]].tryLeft();
                break;

            case 38:
                sprites[snakeId[playerId - 1]].tryUp();
                break;

            case 39:
                sprites[snakeId[playerId - 1]].tryRight();
                break;

            case 40:
                sprites[snakeId[playerId - 1]].tryDown();
                break;

            default:
                break;
        }
    }
}

function updatePicFromMessage(obj, msg) {
    for (var i = obj.pics.length; i < msg.length; ++i) obj.clonePic(obj.pics.length - 1);
    for (var i = obj.pics.length; i > msg.length; --i) obj.deletePic(obj.pics.length - 1, false);

    for (var i = 0; i < msg.length; ++i) {
        obj.pics[i].updateLoc(msg[i].x, msg[i].y);
        obj.pics[i].setSize(msg[i].width, msg[i].height);
        obj.pics[i].color = msg[i].color;
    }
}

function receiveData(data) {
	if (data == "start") {
		if (!gameStarted) {
			gameStarted = true;
			connection.send(data); // reply to confirm
		}
		return;
	}
	
    if (data.snake != null) updatePicFromMessage(sprites[snakeId[(3 ^ playerId) - 1]], data.snake);
    if (data.snake_rev != null) updatePicFromMessage(sprites[snakeId[playerId - 1]], data.snake_rev);

    if (data.offset != null) sprites[snakeId[(3 ^ playerId) - 1]].offset = data.offset;
    if (data.currentdx != null) sprites[snakeId[(3 ^ playerId) - 1]].currentdx = data.currentdx;
    if (data.currentdy != null) sprites[snakeId[(3 ^ playerId) - 1]].currentdy = data.currentdy;

    if (data.p != null) scores[scoreId[(3 ^ playerId) - 1]].updateScore(data.p);
    if (data.p_rev != null) scores[scoreId[playerId - 1]].updateScore(data.p_rev);

    if (data.food != null && playerId == 2) updatePicFromMessage(sprites[foodId], data.food);
}

function contentUpdate() {
    if (!gameStarted) {
		if (connectedToPeer) connection.send("start");
        return;
    }

    for (var k = 0; k < snakeId.length; ++k) {
        if (!sprites[snakeId[k]].dead) break;
    }
    if (k == snakeId.length) endGame();

    sprites[snakeId[playerId - 1]].update();

    message.snake = sprites[snakeId[playerId - 1]].pics.map(function(p) {
        return { 'x': p.x, 'y': p.y, 'width': p.width, 'height': p.height, 'color': p.color };
    });

    message.offset = sprites[snakeId[playerId - 1]].offset;
    message.currentdx = sprites[snakeId[playerId - 1]].currentdx;
    message.currentdy = sprites[snakeId[playerId - 1]].currentdy;

    for (var i = 0; i < snakeId.length; ++i) collisionCandidates.push([snakeId[i], 0]);

    if (playerId == 1) {
        if (foodTrigger) {
            foodTrigger = false;
            sprites[foodId].spawnFood(growSize, growScore);
        }

        if (spoilTrigger) {
            spoilTrigger = false;
            sprites[foodId].spawnFood(-shrinkSize, shrinkScore, spoilInterval, spoilColor);
        }

        message.food = sprites[foodId].pics.map(function(p) {
            return { 'x': p.x, 'y': p.y, 'width': p.width, 'height': p.height, 'color': p.color };
        });
    }

    //console.log(message);
    connection.send(message);

    message.snake_rev = message.p = message.p_rev = null;
}

function contentShade() {
    for (var i = 0; i < snakeId.length; ++i) {
        sprites[snakeId[i]].shade(shadeDepth / sprites[snakeId[i]].pics.length);
    }
}

function contentDraw(context = ctx) {
    var grd = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    grd.addColorStop(0, "#154515");
    grd.addColorStop(1, "#003300");
    context.fillStyle = grd;
    context.fillRect(0, 0, canvas.width, canvas.height);
	
	if (!connectedToServer) {
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = defaultFont;

        context.fillText("Waiting to connect to peer server...", canvas.width / 2, canvas.height / 2);
	} else if (!connectedToPeer || !gameStarted) {
        context.fillStyle = "white";
        context.textAlign = "center";
        context.font = defaultFont;

        context.fillText("Welcome player " + playerId + ". Waiting for other player...", canvas.width / 2, canvas.height / 2);
    } else {
        for (var i = sprites.length - 1; i >= 0; --i) sprites[i].drawAll();
        for (var i = 0; i < snakeId.length; ++i)
            if (sprites[snakeId[i]].dead) sprites[snakeId[i]].pics[0].draw();
    }

    context.fillStyle = "slategrey";
    context.fillRect(canvas.width - (canvas.width % tileSize), 0, tileSize, canvas.height);
    context.fillRect(0, canvas.height - (canvas.height % tileSize), canvas.width, tileSize);
}

function contentInit() {
    initScores(2);

    tileSize = 20;

    snakeId = [0, 1];
    initSize = [4, 4];
    startX = [0, canvas.width - (canvas.width % tileSize) - tileSize];
    startY = [0, canvas.height - (canvas.height % tileSize) - tileSize];
    initDx = [1, -1];
    initDy = [0, 0];
    snakeColor = ["green", "lawngreen"];
    headColor = ["yellow", "deeppink"];
    deadColor = ["black", "black"];
    speed = [250, 250];

    shadeDepth = 0.8;
    simpleMovement = false;

    foodId = snakeId[snakeId.length - 1] + 1;
    foodColor = "red";
    spoilColor = "blue";
    spoilInterval = 7;
    spoilGenDiff = 3;
    foodTrigger = true;
    spoilTrigger = false;
    currentStreak = 0;

    growSize = 3;
    shrinkSize = 5;
    growScore = 1;
    shrinkScore = 5;

    levelId = foodId + 1;
    levelColor = "darkcyan";

    for (var i = 0; i < snakeId.length; ++i) {
        sprites.push(new Snake(snakeId[i], initSize[i], startX[i], startY[i], initDx[i], initDy[i], speed[i], snakeColor[i], headColor[i]));
    }
    sprites.push(new Food(foodId));
    sprites.push(new Level(levelId));

    sampleLevel = [
        [.5, .4, .15, .05],
        [.5, .6, .15, .05]
    ];

    sprites[levelId].populate();

    setDataListener(receiveData);
    connectToServer();
}