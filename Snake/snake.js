hud = document.getElementById("heading");

var sampleLevel = [];

var tileSize;

var snakeId;
var initSize;
var startX;
var startY;
var initDx;
var initDy;
var snakeColor;
var headColor;
var deadColor;
var shadeDepth;
var speed;
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

class Snake extends Sprite {
    constructor(id, size = initSize, x = startX, y = startY, dx = initDx, dy = initDy, sp = speed, sc = snakeColor, hc = headColor) {
        super(id);
        super.setBasicColor(sc);
        super.makeKnown();

        // add the head pic
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
        this.speed = sp; // pixels per second
        this.offset = 0;
    }

    update() {
        if (systemTime.currentTime - this.lastMove >= tileSize / this.speed * 1000) {
            // advance segments forward
            for (var i = this.pics.length - 1; i > 0; i--) this.pics[i].updateLoc(this.pics[i - 1].x, this.pics[i - 1].y);

            // update the head
            this.pics[0].addLoc((this.currentdx) * tileSize, (this.currentdy) * tileSize);
            this.currentdx = this.wanteddx;
            this.currentdy = this.wanteddy;

            //rotate around the periphery
            this.pics[0].rotateAround(0, canvas.width - (canvas.width % tileSize) - tileSize, 0, canvas.height - (canvas.height % tileSize) - tileSize);

            collisionCandidates.push([0, 0]);

            this.lastMove = systemTime.currentTime;
            this.offset = 0;
        } else this.offset = (systemTime.currentTime - this.lastMove) * this.speed / 1000;
    }

    grow(numSegments = 1) {
        for (var i = 0; i < numSegments; ++i) super.clonePic(this.pics.length - 1);
    }

    shrink(numSegments = 1) {
        for (var i = 0; i < numSegments && this.pics.length > 1; ++i) super.deletePic(this.pics.length - 1);
    }

    tryMove(keyCode) {
        switch (keyCode) {
            case 32:
                if (!simpleMovement) simpleMovement = true;
                else simpleMovement = false;
                break;

            case 37:
                if (this.currentdx == 0 || this.pics.length == 1) this.wanteddx = -1, this.wanteddy = 0;
                break;

            case 38:
                if (this.currentdy == 0 || this.pics.length == 1) this.wanteddx = 0, this.wanteddy = -1;
                break;

            case 39:
                if (this.currentdx == 0 || this.pics.length == 1) this.wanteddx = 1, this.wanteddy = 0;
                break;

            case 40:
                if (this.currentdy == 0 || this.pics.length == 1) this.wanteddx = 0, this.wanteddy = 1;
                break;

            default:
                break;
        }
    }

    die(dc = deadColor) {
        this.pics[0].addColor(dc);
        endGame();
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
    constructor(id, fc = foodColor) {
        super(id);
        super.setBasicColor(fc);
        super.makeKnown();
    }

    spawnFood(val, scoreVal, timerInterval = -1, color = null) {
        // Select a new random location on the grid
        var randLoc = scalarCoordRand((canvas.width / tileSize) - 1, (canvas.height / tileSize) - 1, tileSize);

        // Add a food
        var p = new TransientPicture(this.id);
        p.setSize(tileSize, tileSize);
        p.updateLoc(randLoc[0], randLoc[1]);
        p.setValue(val);
        p.setScore(scoreVal);
        if (color != null) p.addColor(color);
        if (timerInterval != -1) p.addTimer(timerInterval);
        else p.setNoTimer();
        super.addNewPic(p);

        // Check for collisions to make sure that location is empty
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

    if (s == snakeId) {
        if (rs == foodId) {
            var pic = sprites[rs].pics[rp];

            if (pic.value > 0) {
                scores[scoreId[0]].updateScore(pic.scoreVal);
                sprites[snakeId].grow(pic.value);
                if (++currentStreak >= spoilGenDiff) {
                    currentStreak = 0;
                    spoilTrigger = true;
                }
                foodTrigger = true;
            } else {
                scores[scoreId[0]].updateScore(pic.scoreVal * pic.timer.getRemainingTime());
                sprites[snakeId].shrink(-pic.value);
            }

            sprites[rs].deletePic(rp);
        } else sprites[snakeId].die();
    } else if (s == foodId) {
        if (sprites[s].pics[p].value >= 0) foodTrigger = true;
        else spoilTrigger = true;

        sprites[s].deletePic(p);
    }
}

class MyScore extends Score {
    draw(context = ctx) {
        hud.innerText = "Yours: " + scores[scoreId[0]].getText();
        hud.innerText += "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
        hud.innerText += "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0";
        hud.innerText += "Highest: " + scores[highScoreId].getText();
    }
}

class MyMouseActions extends MouseActions {

}

class MyKeyActions extends KeyActions {
    onKeyDown() {
        super.onKeyDown();

        sprites[snakeId].tryMove(keyStat.code);
    }
}

function contentUpdate() {
    // update canvas
    if (canvas.width != canvas.offsetWidth || canvas.height != canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        initQuad();

        //update level and food
        sprites[levelId].clr();
        sprites[levelId].populate();
        sprites[foodId].clr();
        foodTrigger = true;
    }

    // update snake
    sprites[snakeId].update();

    // update food
    if (foodTrigger) {
        foodTrigger = false;
        sprites[foodId].spawnFood(growSize, growScore);
    }

    // update spoil
    if (spoilTrigger) {
        spoilTrigger = false;
        sprites[foodId].spawnFood(-shrinkSize, shrinkScore, spoilInterval, spoilColor);
    }
}

function contentShade() {
    sprites[snakeId].shade(shadeDepth / sprites[snakeId].pics.length);
}

function contentDraw(context = ctx) {
    // fill background
    var grd = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    grd.addColorStop(0, "#154515");
    grd.addColorStop(1, "#003300");
    context.fillStyle = grd;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // draw level, food, and snake
    for (var i = sprites.length - 1; i >= 0; --i) sprites[i].drawAll();

    // draw border where snake can't go
    context.fillStyle = "slategrey";
    context.fillRect(canvas.width - (canvas.width % tileSize), 0, tileSize, canvas.height);
    context.fillRect(0, canvas.height - (canvas.height % tileSize), canvas.width, tileSize);
}

function contentInit() {
    initScores(1);

    tileSize = 20;

    snakeId = 0;
    initSize = 4;
    startX = 0;
    startY = 0;
    initDx = 1;
    initDy = 0;
    snakeColor = "green";
    headColor = "yellow";
    deadColor = "black";
    shadeDepth = 0.8;
    speed = 250;
    simpleMovement = false;

    foodId = 1;
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

    levelId = 2;
    levelColor = "darkcyan";

    sprites.push(new Snake(snakeId));
    sprites.push(new Food(foodId));
    sprites.push(new Level(levelId));

    sampleLevel = [
        [.5, .4, .15, .05],
        [.5, .6, .15, .05],
        [.15, .5, .02, .35],
        [.85, .5, .02, .35]
    ];

    sprites[levelId].populate();
}