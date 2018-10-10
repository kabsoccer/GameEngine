function isPointInRectangle(x, y, x0, y0, w, h) {
    return (x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h);
}

function doesRectRectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
}

function doesCirCirIntersect(x1, y1, r1, x2, y2, r2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) <= (r1 + r2) * (r1 + r2);
}

function sign(x, special = false, lim = null) {
    var ret = 0;
    if (x > 0) ret = 1;
    else if (x < 0) ret = -1;
    if (special && Math.abs(x) > lim) ret = -ret;
    return ret;
}

function scalarCoordRand(xRange, yRange, gridSize = 1) {
    return [Math.floor(Math.random() * xRange) * gridSize, Math.floor(Math.random() * yRange) * gridSize];
}

function scalarCoord(xRange, yRange, percentX, percentY, gridSize = 1) {
    return [Math.floor(percentX * xRange) * gridSize, Math.floor(percentY * yRange) * gridSize];
}