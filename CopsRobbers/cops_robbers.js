hud = document.getElementById("heading");

var level;

var gridId;

var numCops;
var numRobbers;

var cops = [];
var robbers = [];

var robberForCop = [];
var copNextMoves = [];
var copFinalMoves = [];

var copColor;
var robberColor;
var cellColor;

var seconds;
var turn;
var hMove;

var totMoves;
var limit;

var dirr = [0, 1, 0, -1, 0];
var dirc = [1, 0, -1, 0, 0];

class Level {
    constructor(tileSize, percent) {
        this.tileSize = tileSize;
        this.rows = canvas.height / this.tileSize;
        this.columns = canvas.width / this.tileSize;

        this.total = Math.floor(this.rows * this.columns * percent / 100);
        this.count = 0;

        this.populate();
    }

    populate() {
        sprites[gridId].init(this.tileSize, canvas.height / this.tileSize, canvas.width / this.tileSize);

        this.randomLevel(this.rows / 2, this.columns / 2);
        this.total = this.count;
    }

    randomLevel(r, c) {
        if (this.count == this.total) return false;
        if (r < 0 || r >= this.rows || c < 0 || c >= this.columns) return false;
        if (sprites[gridId].grid[r][c] != null) return false;

        ++this.count;
        newGridCell(r, c, cellColor);

        var cnt = 0;
        var j = Math.floor(Math.random() * 4);
        var k = Math.floor(Math.random() * 2);
        if (k == 0) k = -1;

        for (var i = 0; i < 4; ++i) {
            if (Math.random() < 0.5) {
                if (this.randomLevel(r + dirr[j], c + dirc[j])) ++cnt;
            }
            j = (j + k + 4) % 4;
        }

        if (cnt == 0) {
            for (var i = 0; i < 4; ++i) {
                if (this.randomLevel(r + dirr[j], c + dirc[j])) break;
                else j = (j + k + 4) % 4;
            }
        }

        return true;
    }
}

class MyGrid extends GridSprite {}

function newGridCell(r, c, color, size = sprites[gridId].tileSize) {
    var pic = new Picture(gridId, false);

    pic.updateLoc(r * size, c * size);
    pic.setSize(size, size);
    pic.addColor(color);

    sprites[gridId].addNewPic(pic);

    sprites[gridId].placeInGrid(pic, r, c);
}

class SimGrid {
    constructor() {
        this.width = sprites[gridId].gridColumns;
        this.height = sprites[gridId].gridRows;
        this.grid = new Array(this.height);
        for (var i = 0; i < this.height; i++) {
            this.grid[i] = new Array(this.width);
        }
        this.reset();
    }
    reset() {
        for (var i = 0; i < this.height; i++) {
            for (var j = 0; j < this.width; j++) {
                this.grid[i][j] = sprites[gridId].grid[i][j] == null ? Infinity : -1;
            }
        }
        this.entities = [];
        for (var i = 0; i < numRobbers; i++) {
            this.grid[robbers[i].r][robbers[i].c] = i;
            this.entities.push({ r: robbers[i].r, c: robbers[i].c });
        }
        for (var i = 0; i < numCops; i++) {
            this.grid[cops[i].r][cops[i].c] = i + numRobbers;
            this.entities.push({ r: cops[i].r, c: cops[i].c });
        }
    }
    canMove(entityId, dr, dc) {
        if (dr == 0 && dc == 0) return true; // you can always choose not to move
        var e = this.entities[entityId];
        if (e.r + dr < 0 || e.r + dr >= this.height || e.c + dc < 0 || e.c + dc >= this.width) return false;
        return this.grid[e.r + dr][e.c + dc] == -1;
    }
    move(entityId, dr, dc) {
        var e = this.entities[entityId];
        this.grid[e.r][e.c] = -1; // clear the current cell
        e.r += dr;
        e.c += dc;
        this.grid[e.r][e.c] = entityId;
    }
    isTrapped(robberId) {
        for (var d = 0; d < 4; d++)
            if (this.canMove(robberId, dirr[d], dirc[d]))
                return false;
        return true;
    }
    randomPlayout(robberId, maxTurns = Infinity) {
        var count = 0;
        var turn = robberId + 1;
        while (count < maxTurns) {
            if (this.isTrapped(robberId)) {
                return count;
            }

            // make random move
            var e = this.entities[turn];
            var nMoves = 1;
            for (var d = 0; d < 4; d++)
                if (this.canMove(turn, dirr[d], dirc[d])) nMoves++;
            var rand = Math.floor(nMoves * Math.random());
            for (var d = 0; d < 4; d++)
                if (this.canMove(turn, dirr[d], dirc[d]) && rand-- == 0)
                    this.move(turn, dirr[d], dirc[d]);

            count++;
            turn = (turn + 1) % (numRobbers + numCops);
        }
        return count;
    }
}

class Robber {
    constructor(r, c, id) {
        this.r = r;
        this.c = c;
        this.id = id;
    }

    makeMove() {
        // Pure Monte-Carlo game search
        var nSim = 500; // number of simulations
        var maxTurns = 200; // maximum number of turns to play out
        var simGrid = new SimGrid();
        var bestScore = 0;
        var bestMove = 0;
        for (var d = 0; d < 5; d++) {
            if (simGrid.canMove(this.id, dirr[d], dirc[d])) {
                var score = 0;
                for (var i = 0; i < nSim; i++) {
                    simGrid.move(this.id, dirr[d], dirc[d]);
                    score += simGrid.randomPlayout(this.id, maxTurns);
                    simGrid.reset();
                }
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = d;
                }
            }
        }
        if (tryMove(this.r, this.c, this.r + dirr[bestMove], this.c + dirc[bestMove])) {
            this.r += dirr[bestMove];
            this.c += dirc[bestMove];
        }
    }
}

class Cop {
    constructor(r, c) {
        this.r = r;
        this.c = c;
    }
}

function tryMove(r, c, nr, nc) {
    if (r == nr && c == nc) return true;

    if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.columns) return false;
    if (sprites[gridId].grid[nr][nc] == null || sprites[gridId].grid[nr][nc].color != cellColor) return false;

    sprites[gridId].grid[nr][nc].addColor(sprites[gridId].grid[r][c].color);
    sprites[gridId].grid[r][c].addColor(cellColor);

    return true;
}

function callAStar(sr, sc, dr, dc) {
    ++sprites[gridId].True;

    var got = sprites[gridId].AStar(sr, sc, dr, dc, function(dr, dc, r, c, nr, nc) {
        if (!(nr == dr && nc == dc) && this.grid[nr][nc].color != cellColor) return false;
        if (this.dist[r][c] + 1 >= this.dist[nr][nc]) return false;
        return true;
    }.bind(sprites[gridId]));

    return got;
}

function findAttackLocs() {
    var distArr = [];

    for (var i = 0; i < numRobbers; ++i) {
        var rr = robbers[i].r;
        var cc = robbers[i].c;

        for (var j = 0; j < 4; ++j) {
            var nr = rr + dirr[j];
            var nc = cc + dirc[j];

            for (var c = 0; c < numCops; ++c) {
                if (robberForCop[c] != i) continue;

                var got = callAStar(cops[c].r, cops[c].c, nr, nc);
                if (got < Infinity && sprites[gridId].grid[nr][nc].color != cellColor) got *= 10;
                if (got == 0 && !isDead(i) && Math.random() < .2) got += 5;

                distArr.push([j, c, got]);
            }
        }

        distArr.sort(function(a, b) {
            return a[2] - b[2];
        });

        var dirAssn = [false, false, false, false];

        for (var j = 0; j < distArr.length; ++j) {
            if (distArr[j][2] == Infinity) break;

            var c = distArr[j][1];
            var nr = rr + dirr[distArr[j][0]];
            var nc = cc + dirc[distArr[j][0]];

            if (copFinalMoves[c].length == 0 && !dirAssn[distArr[j][0]]) {
                copFinalMoves[c] = [nr, nc];
                dirAssn[distArr[j][0]] = true;
            }
        }

        for (var j = 0; j < distArr.length; ++j) {
            var c = distArr[j][1];
            var nr = rr + dirr[distArr[j][0]];
            var nc = cc + dirc[distArr[j][0]];

            if (copFinalMoves[c].length == 0) {
                copFinalMoves[c] = [nr, nc];
            }
        }
    }
}

function makeCopsMove(cur) {
    if (cur == 0) {
        allotCops();

        findAttackLocs();

        for (var c = 0; c < numCops; ++c) {
            var j = 4;
            var mini = Infinity;

            for (var i = 0; i < 5; ++i) {
                if (tryMove(cops[c].r, cops[c].c, cops[c].r + dirr[i], cops[c].c + dirc[i])) {
                    cops[c].r += dirr[i];
                    cops[c].c += dirc[i];

                    var k = robberForCop[c];

                    var got = callAStar(cops[c].r, cops[c].c, copFinalMoves[c][0], copFinalMoves[c][1]);

                    if (got < mini) {
                        mini = got;
                        j = i;
                    }

                    if (i < 4) {
                        tryMove(cops[c].r, cops[c].c, cops[c].r + dirr[(i + 2) % 4], cops[c].c + dirc[(i + 2) % 4]);

                        cops[c].r += dirr[(i + 2) % 4];
                        cops[c].c += dirc[(i + 2) % 4];
                    }
                }
            }

            copNextMoves[c] = j;
        }
    }

    if (tryMove(cops[cur].r, cops[cur].c, cops[cur].r + dirr[copNextMoves[cur]], cops[cur].c + dirc[copNextMoves[cur]])) {
        cops[cur].r += dirr[copNextMoves[cur]];
        cops[cur].c += dirc[copNextMoves[cur]];
    }
}

function selectMousePics(x, y, c) {}

function resolveCollisions(s, p, c) {}

class MyScore extends Score {}

class MyMouseActions extends MouseActions {}

class MyKeyActions extends KeyActions {
    onKeyDown() {
        super.onKeyDown();

        if (turn != 0) return;
        seconds = systemTime.totalTime;

        switch (keyStat.code) {
            case 37:
                hMove = 2;
                break;
            case 38:
                hMove = 3;
                break;
            case 39:
                hMove = 0;
                break;
            case 40:
                hMove = 1;
                break;
            default:
                hMove = -1;
                break;
        }
    }
}

function isDead(i) {
    for (var j = 0; j < 4; ++j) {
        var nr = robbers[i].r + dirr[j];
        var nc = robbers[i].c + dirc[j];

        if (nr < 0 || nr >= level.rows || nc < 0 || nc >= level.columns) continue;
        if (sprites[gridId].grid[nr][nc] != null && sprites[gridId].grid[nr][nc].color == cellColor) return false;
    }

    return true;
}

function over() {
    for (var i = 0; i < robbers.length; ++i) {
        if (!isDead(i)) return false;
    }

    return true;
}

function contentUpdate() {
    if (systemTime.totalTime - seconds < 100 && turn != 0) return;

    if (over()) {
        defaultGameOverText = "Cops Win";
        endGame();
    }

    if (turn == 0) {
        if (hMove == -2) return;

        if (hMove == -1) hMove = -2;

        else if (tryMove(robbers[0].r, robbers[0].c, robbers[0].r + dirr[hMove], robbers[0].c + dirc[hMove])) {
            robbers[0].r += dirr[hMove];
            robbers[0].c += dirc[hMove];
            hMove = -2;
        } else return;
    } else if (turn < numRobbers) {
        robbers[turn].makeMove();
    } else makeCopsMove(turn - numRobbers);

    if (++totMoves == limit) {
        defaultGameOverText = "Robbers Win";
        endGame();
    }

    seconds = systemTime.totalTime;
    turn = (turn + 1) % (numCops + numRobbers);

    if (turn == 0 && isDead(0)) turn = (turn + 1) % (numCops + numRobbers);
}

function contentShade() {
    var pic;

    if (turn < numRobbers) {
        pic = sprites[gridId].grid[robbers[turn].r][robbers[turn].c];
        pic.changeAlpha(0.4);
    } else {
        pic = sprites[gridId].grid[cops[turn - numRobbers].r][cops[turn - numRobbers].c];
        pic.changeAlpha(0.4);
    }
}

function contentDraw(context = ctx) {
    for (var i = 0; i < sprites.length; ++i) sprites[i].drawAll();

    hud.innerText = Math.ceil(1.0 * (limit - totMoves) / (numCops + numRobbers)) + " turns remain";
    hud.innerText += '\n' + (turn == 0 ? 'Your turn. Waiting for input...' : 'Playing CPUs...');

    context.fillStyle = "black";
    context.lineWidth = 5;
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();
}

function allotCops() {
    copFinalMoves = [];

    for (var j = 0; j < numCops; ++j) {
        copFinalMoves.push([]);

        var mini = Infinity;
        var k = 0;

        for (var i = 0; i < numRobbers; ++i) {
            var got = callAStar(cops[j].r, cops[j].c, robbers[i].r, robbers[i].c);

            if (got == 1) {
                robberForCop[j] = i;
                break;
            } else if (isDead(i)) continue;

            if (got < mini) {
                mini = got;
                k = i;
            }
        }

        if (got == 1) continue;
        else robberForCop[j] = k;
    }
}

function contentInit() {
    initScores(1);

    gridId = 0;

    sprites.push(new MyGrid(gridId));

    copColor = "blue";
    robberColor = "red";
    cellColor = "white";

    level = new Level(50, 75);

    numCops = 10;
    numRobbers = 3;

    for (var i = 0; i < numCops; ++i) {
        while (true) {
            var p = Math.floor(Math.random() * sprites[gridId].pics.length);
            if (sprites[gridId].pics[p].color == cellColor) {
                sprites[gridId].pics[p].addColor(copColor);
                cops.push(new Cop(sprites[gridId].pics[p].gridRow, sprites[gridId].pics[p].gridColumn));
                break;
            }
        }

        robberForCop.push(-1);
    }

    for (var i = 0; i < numRobbers; ++i) {
        while (true) {
            var p = Math.floor(Math.random() * sprites[gridId].pics.length);
            if (sprites[gridId].pics[p].color == cellColor) {
                if (i == 0) sprites[gridId].pics[p].addColor("deeppink");
                else sprites[gridId].pics[p].addColor(robberColor);
                robbers.push(new Robber(sprites[gridId].pics[p].gridRow, sprites[gridId].pics[p].gridColumn, i));
                break;
            }
        }
    }

    seconds = 0;
    turn = 0;
    hMove = -2;

    totMoves = 0;
    limit = (numCops + numRobbers) * 50;
}