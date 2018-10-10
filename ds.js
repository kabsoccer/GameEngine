class Queue {
    constructor() {
        this.arr = [];
        this.a = 0;
        this.b = 0;
    }

    group_enqueue(S) {
        for (var i = S.a; i < S.b; ++i) this.enqueue(S.arr[i]);
    }

    enqueue(v) {
        this.arr.push(v);
        ++this.b;
    }

    dequeue() {
        return this.arr[this.a++];
    }

    peek() {
        return this.arr[this.a];
    }

    isEmpty() {
        return this.a == this.b;
    }

    getLength() {
        return this.b - this.a;
    }

    clr() {
        this.arr = [];
        this.a = 0;
        this.b = 0;
    }
}

class PriorityQueue {
    constructor() {
        this.A = [];
    }

    isEmpty() {
        return this.A.length == 0;
    }

    parent(i) {
        return Math.floor((i - 1) / 2);
    }

    left(i) {
        return 2 * i + 1;
    }

    right(i) {
        return 2 * i + 2;
    }

    maxHeapify(i) {
        var l = this.left(i);
        var r = this.right(i);
        var largest;

        if (l < this.A.length && this.A[l].isGreater(this.A[i])) largest = l;
        else largest = i;

        if (r < this.A.length && this.A[r].isGreater(this.A[largest])) largest = r;

        if (largest != i) {
            [this.A[i], this.A[largest]] = [this.A[largest], this.A[i]];
            this.maxHeapify(largest);
        }
    }

    heapMaximum() {
        return this.A[0];
    }

    heapExtractMax() {
        var max = this.A[0];

        if (this.A.length == 1) {
            this.A.pop();
            return max;
        }

        this.A[0] = this.A.pop();
        this.maxHeapify(0);
        return max;
    }

    heapUpdateKey(i, key) {
        if (key.isLess(this.A[i])) {
            this.A[i] = key;
            this.maxHeapify(i);
            return;
        }

        this.A[i] = key;

        while (i > 0 && this.A[this.parent(i)].isLess(this.A[i])) {
            [this.A[i], this.A[this.parent(i)]] = [this.A[this.parent(i)], this.A[i]];
            i = this.parent(i);
        }
    }

    maxHeapInsert(key) {
        this.A.push(key);

        this.heapUpdateKey(this.A.length - 1, key);
    }
}

class Quad_Tree {
    constructor(x, y, w, h, par = null, depth = 0) {
        this.x = x, this.y = y, this.w = w, this.h = h;
        this.oo = this.oi = this.io = this.ii = null;
        this.par = par;
        this.depth = depth;
        this.items = new Set();
        this.cnt = 0;
    }

    insert(p) {
        if (!p.isCollidable) return false;
        if (this.items.has(p)) return false;
        if (!p.isContainedInRect(this.x, this.y, this.w, this.h)) return false;

        ++this.cnt;

        if (this.oo == null && (this.items.size < quadCapacity || this.depth == quadDepth)) {
            this.items.add(p);
            p.node = this;
            return true;
        }

        if (this.oo == null) this.subDivide();

        if (this.oo.insert(p)) return true;
        if (this.oi.insert(p)) return true;
        if (this.io.insert(p)) return true;
        if (this.ii.insert(p)) return true;

        this.items.add(p);
        p.node = this;
        return true;
    }

    subDivide() {
        this.oo = new Quad_Tree(this.x, this.y, this.w / 2.0, this.h / 2.0, this, this.depth + 1);
        this.oi = new Quad_Tree(this.x + this.w / 2.0, this.y, this.w / 2.0, this.h / 2.0, this, this.depth + 1);
        this.io = new Quad_Tree(this.x, this.y + this.h / 2.0, this.w / 2.0, this.h / 2.0, this, this.depth + 1);
        this.ii = new Quad_Tree(this.x + this.w / 2.0, this.y + this.h / 2.0, this.w / 2.0, this.h / 2.0, this, this.depth + 1);

        for (let i of this.items) {
            if (this.oo.insert(i)) this.items.delete(i);
            else if (this.oi.insert(i)) this.items.delete(i);
            else if (this.io.insert(i)) this.items.delete(i);
            else if (this.ii.insert(i)) this.items.delete(i);
        }
    }

    dlt(p) {
        p.node = null;
        this.items.delete(p);
        this.reShuffle();
    }

    reShuffle() {
        if (--this.cnt == 0) this.oo = this.oi = this.io = this.ii = null;
        if (this.par != null) this.par.reShuffle();
    }

    upd(p) {
        if (!p.isContainedInRect(this.x, this.y, this.w, this.h)) {
            this.dlt(p);
            quad.insert(p);
        }
    }

    query(x, y, w, h, s = -1, p = -1) {
        var ret = new Set();
        if (!doesRectRectIntersect(this.x, this.y, this.w, this.h, x, y, w, h)) return ret;

        for (let i of this.items) {
            if (s == -1 && p == -1) {
                if (i.doesRectCollide(x, y, w, h)) ret.add([i.id, i.pid]);
            } else if (i.doesCollide(s, p)) ret.add([i.id, i.pid]);
        }

        if (this.oo == null) return ret;

        var roo = this.oo.query(x, y, w, h, s, p);
        var roi = this.oi.query(x, y, w, h, s, p);
        var rio = this.io.query(x, y, w, h, s, p);
        var rii = this.ii.query(x, y, w, h, s, p);

        return new Set([...ret, ...roo, ...roi, ...rio, ...rii]);
    }
}

function initQuad() {
    quad = new Quad_Tree(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < sprites.length; ++i) {
        for (var j = 0; j < sprites[i].pics.length; ++j) {
            sprites[i].pics[j].node = null;
            quad.insert(sprites[i].pics[j]);
        }
    }
}

var quad;
var quadCapacity;
var quadDepth;