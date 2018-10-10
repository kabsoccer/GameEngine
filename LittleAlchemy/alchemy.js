var allSprites = [
    ["air", "images/air.png", true],
    ["earth", "images/earth.png", true],
    ["plant", "images/plant.png", false],
    ["ash", "images/ash.png", false],
    ["fire", "images/fire.png", true],
    ["water", "images/water.png", true],
    ["rain", "images/rain.ico", false],
    ["tornado", "images/tornado.png", false],
    ["tree", "images/tree.png", false]
];
var allRules = [
    ["water", "air", "rain"],
    ["rain", "earth", "plant"],
    ["plant", "fire", "ash"],
    ["tree", "fire", "ash"],
    ["plant", "water", "tree"],
    ["air", "air", "tornado"]
];

var panelPicWidth;
var panelPicHeight;
var cloneSizeFactor;
var dimAlp;

var panelX_;
var scoreX;
var scoreY_;

var curSprite;
var curPic;
var startP;

var posX;
var posY;

var newFound;
var updateRequired;

var rules = [];
var prodImages = [];

var fields = [];

class Field {
    constructor(x, y, w, h, isD = true) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.isDrawable = isD;
    }

    changeDim(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    setFieldColor(c) {
        this.fieldColor = c;
    }

    setBorderColor(c) {
        this.borderColor = c;
    }

    drawBorder(context = ctx) {
        if (!this.isDrawable) return;
        context.strokeStyle = this.borderColor;
        context.strokeRect(this.x, this.y, this.w, this.h);
    }

    drawField() {
        if (!this.isDrawable) return;
    }

    isPicInside(s, p) {
        var pic = sprites[s].pics[p];
        return doesRectRectIntersect(pic.x, pic.y, pic.width, pic.height, this.x, this.y, this.w, this.h);
    }
}

function selectMousePics(x, y, c) {
    if (c.length == 0) return;
    updateRequired = true;
    var latest = findLatestPic(c);
    curSprite = latest[0];
    curPic = latest[1];
    if (curSprite == -1 && curPic == -1) return;
    if (curPic == 0) {
        sprites[curSprite].clonePic(0, cloneSizeFactor, cloneSizeFactor);
        curPic = sprites[curSprite].pics.length - 1;
    } else {
        sprites[curSprite].pics[curPic].updateTimeStamp();
    }
    posX = x - sprites[curSprite].pics[curPic].x;
    posY = y - sprites[curSprite].pics[curPic].y;
}

function removePanelPic(s, p) {
    if (!sprites[s].pics[p].isContainedInRect(fields[0].x, fields[0].y, fields[0].w, fields[0].h)) {
        sprites[s].deletePic(p);
        return true;
    } else return false;
}

function resolveCollisions(s, p, c) {
    if (c.length == 0) return;
    var latest = findLatestPic(c, s, p);
    var rs = latest[0];
    var rp = latest[1];
    if (rs == -1 && rp == -1) return;
    if (mouseStat.drag) {
        if (fields[0].isPicInside(rs, rp)) sprites[rs].pics[rp].changeAlpha(dimAlp);
        return;
    }
    var fs = rules[s][rs];
    if (fs == -1) return;
    if (!sprites[fs].known) {
        sprites[fs].makeKnown();
        newFound = true;
        scores[scoreId[0]].updateScore();
    }
    sprites[fs].clonePic(0, cloneSizeFactor, cloneSizeFactor);
    sprites[fs].pics[sprites[fs].pics.length - 1].updateLoc(sprites[rs].pics[rp].x, sprites[rs].pics[rp].y);
    sprites[s].deletePic(p);
    sprites[rs].deletePic(rp);
}

function updateField() {
    prodImages = [];
    for (var i = 0; i < sprites.length; ++i) {
        if (sprites[i].known) {
            for (var j = 1; j < sprites[i].pics.length; ++j) {
                if (mouseStat.drag) prodImages.push(sprites[i].pics[j]);
                else if (!removePanelPic(i, j)) prodImages.push(sprites[i].pics[j]);
                else j--;
            }
        }
    }
    prodImages.sort(function(a, b) {
        return a.timeStamp > b.timeStamp ? 1 : -1;
    });
}

function updatePanel() {
    var curY = 20;
    var cnt = 0;
    for (var i = 0; i < sprites.length; ++i) {
        if (sprites[i].known && cnt++ >= startP) {
            sprites[i].pics[0].updateLoc(canvas.width - panelX_ + 15, curY);
            curY += sprites[i].pics[0].height + 10;
        }
    }
}

class MyScore extends Score {

}

class MyMouseActions extends MouseActions {
    onLeftDown() {
        mouseCandidate = true;
        mouseStat.leftDown = false;
    }

    onLeftUp() {
        if (curSprite != -1 && curPic != -1) {
            updateRequired = true;
            if (!removePanelPic(curSprite, curPic)) {
                collisionCandidates.push([curSprite, curPic]);
            }
            curSprite = curPic = -1;
        }
        mouseStat.leftUp = false;
    }

    onDrag() {
        if (curSprite != -1 && curPic != -1) {
            collisionCandidates.push([curSprite, curPic]);
            sprites[curSprite].pics[curPic].updateLoc(mouseStat.x - posX, mouseStat.y - posY);
        }
    }
}

class MyKeyActions extends KeyActions {
    onKeyDown() {
        if (keyStat.code == 'W'.charCodeAt(0)) {
            if (startP > 0) {
                --startP;
                newFound = true;
            }
        } else if (keyStat.code == 'S'.charCodeAt(0)) {
            if (startP < scores[scoreId[0]].score - 1) {
                ++startP;
                newFound = true;
            }
        }
        keyStat.down = false;
    }
}

function contentUpdate() {
    if (canvas.width != window.innerWidth || canvas.height != window.innerHeight) {
        newFound = true;
        updateRequired = true;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        initQuad();

        scores[scoreId[0]].setLoc(scoreX, canvas.height - scoreY_);
        fields[0].changeDim(0, 0, canvas.width - panelX_, canvas.height);
        fields[1].changeDim(canvas.width - panelX_, 0, panelX_, canvas.height);
    }

    if (newFound) {
        updatePanel();
        newFound = false;
    }

    if (updateRequired) {
        updateField();
        updateRequired = false;
    }

    if (scores[scoreId[0]].score == allSprites.length) endGame();
}

function contentShade() {

}

function contentDraw(context = ctx) {
    context.fillStyle = "blue";
    context.font = "20px Comic Sans MS";
    context.textAlign = "left";

    var cnt = 0;

    for (var i = 0; i < sprites.length; ++i) {
        if (sprites[i].known && cnt++ >= startP) {
            sprites[i].pics[0].draw();
            sprites[i].pics[0].drawText(sprites[i].pics[0].width + 10, sprites[i].pics[0].height / 2);
        }
    }

    context.textAlign = "center";

    for (var i = 0; i < prodImages.length; ++i) {
        prodImages[i].draw();
        prodImages[i].drawText(prodImages[i].width / 2, prodImages[i].height + 20);
    }

    for (var i = 0; i < fields.length; ++i) {
        fields[i].drawBorder();
        fields[i].drawField();
    }
}

function getSpriteIndex(s) {
    for (var i = 0; i < sprites.length; ++i)
        if (sprites[i].isMe(s)) return i;
    return -1;
}

function contentInit() {
    initScores(1);

    panelPicWidth = 50;
    panelPicHeight = 50;
    cloneSizeFactor = 1.25;
    dimAlp = 0.4;

    panelX_ = 265;
    scoreX = 60;
    scoreY_ = 30;

    curSprite = -1;
    curPic = -1;
    startP = 0;

    newFound = true;
    updateRequired = false;

    allSprites.sort();

    for (var i = 0; i < allSprites.length; ++i) {
        var s = new Sprite(i);
        s.setName(allSprites[i][0]);
        s.setBasicImg(allSprites[i][1], panelPicWidth, panelPicHeight);
        s.makeKnown(allSprites[i][2]);
        sprites.push(s);

        var p = new Picture(i);
        p.setSize(panelPicWidth, panelPicHeight);
        sprites[i].addNewPic(p);

        if (sprites[i].known) scores[scoreId[0]].updateScore();

        rules.push([]);
        for (var j = 0; j < allSprites.length; ++j) rules[i].push(-1);
    }

    for (var i = 0; i < allRules.length; ++i) {
        var j = getSpriteIndex(allRules[i][0]);
        var k = getSpriteIndex(allRules[i][1]);
        var l = getSpriteIndex(allRules[i][2]);

        if (j != -1 && k != -1 && l != -1) rules[j][k] = rules[k][j] = l;
    }

    scores[scoreId[0]].fixTotal(sprites.length);
    scores[scoreId[0]].setLoc(scoreX, canvas.height - scoreY_);

    fields.push(new Field(0, 0, canvas.width - panelX_, canvas.height));
    fields[0].setBorderColor("green");
    fields.push(new Field(canvas.width - panelX_, 0, panelX_, canvas.height));
    fields[1].setBorderColor("red");
}