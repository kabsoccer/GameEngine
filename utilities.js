class Score {
    constructor(score = 0, total = null, isD = true) {
        this.total = total;
        this.score = score;
        this.makeString();
        this.x = -1;
        this.y = -1;
        this.isDrawable = isD;
    }

    setId(id) {
        this.id = id;
    }

    setLoc(x, y) {
        this.x = x;
        this.y = y;
    }

    fixTotal(t) {
        this.total = t;
        this.makeString();
    }

    updateScore(inc = 1) {
        this.score += inc;
        this.makeString();
    }

    updateHighScore(s) {
        if (s > this.score) this.score = s;
        this.makeString();
    }

    makeString(f = defaultFont) {
        this.font = f;
        if (this.total == null) this.str = this.score.toString();
        else this.str = this.score.toString() + "/" + this.total.toString();
    }

    draw(context = ctx) {
        if (this.isDrawable && this.x != -1 && this.y != -1) {
            context.font = this.font;
            context.fillText(this.str, this.x, this.y);
        }
    }

    getText() {
        return this.str;
    }
}

class Timer {
    constructor(time, func, isD = true) {
        this.timeRemaining = time;
        this.accessTime = new Date().getTime();
        this.func = func;
        this.makeString();
        this.id = timers.length;
        this.x = -1;
        this.y = -1;
        this.isDrawable = isD;
        timers.push(this);
    }

    updateTimer(step = 1000, dec = 1) {
        var currentTime = new Date().getTime();
        if (currentTime - this.accessTime >= step) {
            this.accessTime = currentTime;
            this.timeRemaining -= dec;
            this.makeString();
            if (this.timeRemaining <= 0) {
                this.func();
                this.deleteTimer();
            }
        }
    }

    deleteTimer() {
        if (this.id >= timers.length - 1) timers.pop();
        else {
            var curId = this.id;
            timers[this.id] = timers.pop();
            timers[this.id].setId(curId);
        }
    }

    getRemainingTime() {
        return this.timeRemaining;
    }

    setId(id) {
        this.id = id;
    }

    setLoc(x, y) {
        this.x = x;
        this.y = y;
    }

    makeString(f = defaultFont) {
        this.font = f;
        this.str = this.timeRemaining.toString();
    }

    draw(context = ctx) {
        if (this.isDrawable && this.x != -1 && this.y != -1) {
            context.font = this.font;
            context.fillText(this.str, this.x, this.y);
        }
    }
}

class SystemDelT {
    constructor() {
        this.currentTime = new Date().getTime();
        this.delT = 0;
        this.totalTime = 0;
    }
    update() {
        var now = new Date().getTime();
        this.delT = now - this.currentTime;
        this.currentTime = now;
        this.totalTime += this.delT;
    }
}

class Direction {
    constructor(cx, cy) {
        this.cx = cx;
        this.cy = cy;
    }

    draw(s, e, context = ctx) {
        var dist = Math.hypot(this.cx - mouseStat.x, this.cy - mouseStat.y);

        this.dirx = (mouseStat.x - this.cx) / dist;
        this.diry = (mouseStat.y - this.cy) / dist;

        context.beginPath();
        context.moveTo(this.cx + s * this.dirx, this.cy + s * this.diry);
        context.lineTo(this.cx + e * this.dirx, this.cy + e * this.diry);
        context.stroke();
    }
}

var timers = [];
var scores = [];

var systemTime;

var scoreId = [];
var highScoreId;

function initScores(numScores) {
    for (var i = 0; i < numScores; ++i) {
        scores.push(new MyScore());
        scoreId.push(i);
        scores[i].setId(i);
    }
    scores.push(new MyScore());
    highScoreId = numScores;
    scores[numScores].setId(numScores);
}