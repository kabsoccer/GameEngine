class Picture {
    constructor(id, isCollidable = true, alp = 1.0, isD = true) {
        this.id = id;
        this.updateTimeStamp();

        this.isCollidable = isCollidable;
        this.isDrawable = isD;

        this.color = null;
        this.alp = alp;
        this.txtAlp = alp;

        this.node = null;

        this.img = null;
        this.shape = "rect";

        this.isSpriteSheet = false;
    }

    setPid(pid) {
        this.pid = pid;
    }

    setValue(value) {
        this.value = value;
    }

    setScore(scoreVal) {
        this.scoreVal = scoreVal;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
    }

    setShape(shape) {
        this.shape = shape;
    }

    setSpriteSheet(imageSource, frameWidth, frameHeight, frameSpeed, numColumns, endFrame, animationPlaying) {
        this.isSpriteSheet = true;

        this.img = new Image();
        this.img.src = imageSource;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameSpeed = frameSpeed;
        this.endFrame = endFrame;
        this.numFrames = numColumns;

        this.currentFrame = 0;
        this.counter = 0;

        this.animationPlaying = animationPlaying;
    }

    startAnimation() {
        this.animationPlaying = true;
    }

    stopAnimation() {
        this.animationPlaying = false;
    }

    animationEnd() {
        // Override this method
    }

    isAnimationPlaying() {
        return this.animationPlaying;
    }

    updateLoc(x, y, timeUpdate = true) {
        this.x = x;
        this.y = y;

        if (this.node != null) this.node.upd(this);
        else quad.insert(this);

        if (timeUpdate) this.updateTimeStamp();
    }

    addLoc(x, y, timeUpdate = true) {
        this.updateLoc(this.x + x, this.y + y, timeUpdate);
    }

    updateVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    updateGridLoc(r, c) {
        this.gridRow = r;
        this.gridColumn = c;
    }

    rotateAround(minX, maxX, minY, maxY) {
        if (this.x < minX) this.updateLoc(maxX, this.y);
        if (this.y < minY) this.updateLoc(this.x, maxY);
        if (this.x > maxX) this.updateLoc(minX, this.y);
        if (this.y > maxY) this.updateLoc(this.x, minY);
    }

    updateTimeStamp() {
        this.timeStamp = new Date().getTime();
    }

    copy() {
        return new Picture(this.id);
    }

    mouseInPic(x, y) {
        return isPointInRectangle(x, y, this.x, this.y, this.width, this.height);
    }

    doesCollide(s, p) {
        var pic = sprites[s].pics[p];

        if (this.shape == 'rect') return doesRectRectIntersect(pic.x, pic.y, pic.width, pic.height, this.x, this.y, this.width, this.height);
        else if (this.shape == 'ellipse') return doesCirCirIntersect(pic.x, pic.y, pic.width / 2.0, this.x, this.y, this.width / 2.0);
    }

    doesRectCollide(x, y, w, h) {
        return doesRectRectIntersect(this.x, this.y, this.width, this.height, x, y, w, h);
    }

    isContainedInRect(x, y, w, h) {
        return (this.x >= x && this.x + this.width <= x + w && this.y >= y && this.y + this.height <= h);
    }

    addImg(src, width, height) {
        this.img = new Image();
        this.img.src = src;
        this.img.width = width;
        this.img.height = height;
    }

    addColor(color) {
        this.color = color;
    }

    changeAlpha(alp) {
        this.alp = alp;
        this.txtAlp = alp;
    }

    isMe(p) {
        return (this.id == p.id && this.pid == p.pid);
    }

    draw(offX = 0, offY = 0, context = ctx) {
        if (!this.isDrawable) return;

        if (this.isSpriteSheet) {
            if (this.animationPlaying) {
                if (this.counter == (this.frameSpeed - 1)) {
                    if (this.currentFrame == this.endFrame - 1) {
                        this.stopAnimation();
                        this.animationEnd();
                    } else this.currentFrame = (this.currentFrame + 1) % this.endFrame;
                }

                this.counter = (this.counter + 1) % this.frameSpeed;
            }

            var row = Math.floor(this.currentFrame / this.numFrames);
            var col = Math.floor(this.currentFrame % this.numFrames);

            context.drawImage(this.img, col * this.frameWidth, row * this.frameHeight, this.frameWidth, this.frameHeight,
                this.x + offX, this.y + offY, this.width, this.height);
        } else if (this.img != null) {
            context.globalAlpha = this.alp;

            context.drawImage(this.img, this.x + offX, this.y + offY, this.width, this.height);

            context.globalAlpha = 1.0;
        } else if (this.color != null) {
            context.globalAlpha = this.alp;
            context.fillStyle = this.color;

            if (this.shape == 'rect') {
                context.fillRect(this.x + offX, this.y + offY, this.width, this.height);
            } else if (this.shape == 'ellipse') {
                context.beginPath();
                context.ellipse(this.x + this.width / 2 + offX, this.y + this.height / 2 + offY,
                    this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
                context.fill();
            }

            context.globalAlpha = 1.0;
        } else sprites[this.id].draw(this.x + offX, this.y + offY, this.width, this.height, this.alp);

        this.alp = 1.0;
    }

    drawText(offX = 0, offY = 0, text = sprites[this.id].name, context = ctx) {
        if (!this.isDrawable) return;

        context.globalAlpha = this.txtAlp;

        context.fillText(text, this.x + offX, this.y + offY);

        context.globalAlpha = 1.0;
        this.txtAlp = 1.0;
    }
}

class Sprite {
    constructor(id, isD = true) {
        this.id = id;
        this.updateTimeStamp();

        this.isDrawable = isD;

        this.pics = [];
        this.img = null;
    }

    setName(name) {
        this.name = name;
    }

    setBasicImg(src, width, height) {
        this.img = new Image();
        this.img.src = src;
        this.img.width = width;
        this.img.height = height;
    }

    setBasicColor(color) {
        this.color = color;
    }

    makeKnown(known = true) {
        this.known = known;
        this.updateTimeStamp();
    }

    updateTimeStamp() {
        this.timeStamp = new Date().getTime();
    }

    addNewPic(p) {
        p.setPid(this.pics.length);
        this.pics.push(p);
    }

    deletePic(i = this.pics.length - 1, dummy = false) {
        if (this.pics[i].node != null) this.pics[i].node.dlt(this.pics[i]);

        if (i >= this.pics.length - 1) this.pics.pop();
        else {
            this.pics[i] = this.pics.pop();
            this.pics[i].setPid(i);
        }
    }

    clonePic(i = this.pics.length - 1, wf = 1, hf = 1) {
        if (i < 0) {
            this.addNewPic(new Picture(this.id));
            return;
        }

        var p = this.pics[i].copy();

        if (this.img != null) p.setSize(this.img.width * wf, this.img.height * hf);
        else p.setSize(this.pics[i].width * wf, this.pics[i].height * hf);

        p.updateLoc(this.pics[i].x, this.pics[i].y);
        p.setPid(this.pics.length);
        this.pics.push(p);
    }

    isMe(s) {
        return (this.name == s);
    }

    draw(x, y, width, height, alp = 1.0, context = ctx) {
        if (!this.isDrawable) return;

        context.globalAlpha = alp;

        if (this.img != null) {
            var sw = this.img.width;
            var sh = this.img.height;

            this.img.width = width;
            this.img.height = height;
            context.drawImage(this.img, x, y, width, height);

            this.img.width = sw;
            this.img.height = sh;
        } else {
            context.fillStyle = this.color;
            context.fillRect(x, y, width, height);
        }

        context.globalAlpha = 1.0;
    }

    drawAll() {
        if (!this.isDrawable) return;
        for (var i = 0; i < this.pics.length; ++i) this.pics[i].draw();
    }

    shade(alpShader = 0) {
        for (var i = 1; i < this.pics.length; ++i) this.pics[i].changeAlpha(this.pics[i - 1].alp - alpShader);
    }

    clr() {
        while (this.pics.length > 0) {
            this.deletePic(this.pics.length - 1);
        }
    }
}

class TransientPicture extends Picture {
    setNoTimer() {
        this.timer = null;
    }

    addTimer(interval) {
        new Timer(interval, this.timerFunction.bind(this));
        this.timer = timers[timers.length - 1];
    }

    deleteTimer() {
        if (this.timer != null) this.timer.deleteTimer();
    }

    timerFunction() {
        sprites[this.id].deletePic(this.pid, false);
    }
}

class TransientSprite extends Sprite {
    deletePic(pid, timerDelete = true) {
        if (timerDelete) sprites[this.id].pics[pid].deleteTimer();
        super.deletePic(pid);
    }
}

class GridSprite extends Sprite {
    constructor(id) {
        super(id);

        this.grid = [];
        this.gridX = 0;
        this.gridY = 0;
        this.gridRows = 0;
        this.gridColumns = 0;

        this.check = [];
        this.dist = [];
        this.True = 0;
    }

    init(tileSize, rows, columns, x = 0, y = 0) {
        this.clr();

        this.tileSize = tileSize;

        this.gridX = x;
        this.gridY = y;
        this.gridRows = rows;
        this.gridColumns = columns;

        for (var i = 0; i < this.gridRows; ++i) {
            this.grid.push(new Array(this.gridColumns));
            this.check.push(new Array(this.gridColumns));
            this.dist.push(new Array(this.gridColumns));

            for (var j = 0; j < this.gridColumns; ++j) {
                this.grid[i][j] = null;
                this.check[i][j] = this.True;
                this.dist[i][j] = Infinity;
            }
        }
    }

    placeInGrid(pic, row, column, expandable = true) {
        if (pic == null) return;
        if (!expandable && (this.gridRows <= row || this.gridColumns <= column)) return;

        while (this.gridRows <= row) {
            ++this.gridRows;

            this.grid.push(new Array(this.gridColumns));
            this.check.push(new Array(this.gridColumns));
            this.dist.push(new Array(this.gridColumns));
        }

        while (this.gridColumns <= column) {
            ++this.gridColumns;

            for (var i = 0; i < this.gridRows; ++i) {
                this.grid[i].push(null);
                this.check[i].push(this.True);
                this.dist[i].push(Infinity);
            }
        }

        this.grid[row][column] = pic;
        this.check[row][column] = this.True;
        this.dist[row][column] = Infinity;
        pic.updateGridLoc(row, column);
        pic.updateLoc(this.gridX + column * this.tileSize, this.gridY + row * this.tileSize);
    }

    deletePic(i = this.pics.length - 1, dummy = false) {
        this.grid[this.pics[i].gridRow][this.pics[i].gridColumn] = null;

        super.deletePic(i);
    }

    translate(dx, dy) {
        var lastOne = null;

        this.gridX += dx * this.tileSize;
        this.gridY += dy * this.tileSize;

        for (var i = 0; i < this.gridRows; ++i) {
            for (var j = 0; j < this.gridColumns; ++j) {
                if (this.grid[i][j] == null) continue;

                this.grid[i][j].addLoc(dx * this.tileSize, dy * this.tileSize);
                lastOne = this.grid[i][j];
            }
        }

        return lastOne;
    }

    initDists() {
        for (var i = 0; i < this.gridRows; ++i) {
            for (var j = 0; j < this.gridColumns; ++j) {
                this.dist[i][j] = Infinity;
            }
        }
    }

    constraintCheck(nr, nc) {
        if (nr < 0 || nr >= this.gridRows || nc < 0 || nc >= this.gridColumns) return false;
        if (this.grid[nr][nc] == null || this.check[nr][nc] == this.True) return false;
        if (this.grid[nr][nc].x < 0 || this.grid[nr][nc].x >= canvas.width ||
            this.grid[nr][nc].y < 0 || this.grid[nr][nc].y >= canvas.height) return false;
        return true;
    }

    bfs(sr, sc, bfsConstraint = null) {
        if (!this.constraintCheck(sr, sc)) return new Queue();

        var S = new Queue();
        var Q = new Queue();
        this.initDists();

        var dr = [0, 1, 0, -1];
        var dc = [1, 0, -1, 0];

        this.check[sr][sc] = this.True;
        this.dist[sr][sc] = 0;
        Q.enqueue([sr, sc]);

        while (!Q.isEmpty()) {
            var r = Q.peek()[0];
            var c = Q.peek()[1];
            Q.dequeue();
            S.enqueue(this.grid[r][c]);

            for (var i = 0; i < dr.length; ++i) {
                var nr = r + dr[i];
                var nc = c + dc[i];

                if (!this.constraintCheck(nr, nc)) continue;
                if (bfsConstraint != null && !bfsConstraint(sr, sc, r, c, nr, nc)) continue;

                this.check[nr][nc] = this.True;
                this.dist[nr][nc] = this.dist[r][c] + 1;
                Q.enqueue([nr, nc]);
            }
        }

        return S;
    }

    manhattan(r, c, dr, dc) {
        return Math.abs(r - dr) + Math.abs(c - dc);
    }

    AStar(sr, sc, dr, dc, AStarConstraint = null) {
        if (!this.constraintCheck(dr, dc)) return Infinity;

        var Q = new PriorityQueue();
        this.initDists();

        var dirr = [0, 1, 0, -1];
        var dirc = [1, 0, -1, 0];

        this.check[sr][sc] = this.True;
        this.dist[sr][sc] = 0;
        Q.maxHeapInsert(new GridWrapper(sr, sc, this.dist[sr][sc] + this.manhattan(sr, sc, dr, dc)));

        while (!Q.isEmpty()) {
            var r = Q.heapMaximum().r;
            var c = Q.heapMaximum().c;
            var d = Q.heapMaximum().d;

            Q.heapExtractMax();

            if (d - this.manhattan(r, c, dr, dc) != this.dist[r][c]) continue;
            if (r == dr && c == dc) break;

            for (var i = 0; i < dirr.length; ++i) {
                var nr = r + dirr[i];
                var nc = c + dirc[i];

                if (!this.constraintCheck(nr, nc)) continue;
                if (AStarConstraint != null && !AStarConstraint(dr, dc, r, c, nr, nc)) continue;

                this.check[nr][nc] = this.True;
                this.dist[nr][nc] = this.dist[r][c] + 1;
                Q.maxHeapInsert(new GridWrapper(nr, nc, this.dist[nr][nc] + this.manhattan(nr, nc, dr, dc)));
            }
        }

        while (!Q.isEmpty()) Q.heapExtractMax();

        return this.dist[dr][dc];
    }
}

class GridWrapper {
    constructor(r, c, d) {
        this.r = r;
        this.c = c;
        this.d = d;
    }

    isLess(o) {
        return this.d > o.d;
    }

    isGreater(o) {
        return this.d < o.d;
    }

    isEqual(o) {
        return this.d == o.d;
    }
}

var sprites = [];