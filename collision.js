function findMousePics(x, y) {
    return Array.from(quad.query(x, y, 0, 0));
}

function findCollidedPics(s, p) {
    var pic = sprites[s].pics[p];
    return Array.from(quad.query(pic.x, pic.y, pic.width, pic.height, s, p));
}

function findLatestPic(c, s = -1, p = -1) {
    var rs = -1;
    var rp = -1;
    var pic;
    var ts = null;
    for (var k = 0; k < c.length; ++k) {
        var i = c[k][0];
        var j = c[k][1];
        if (i == s && j == p) continue;
        pic = sprites[i].pics[j];
        if (ts == null || ts < pic.timeStamp) {
            ts = pic.timeStamp;
            rs = i;
            rp = j;
        }
    }
    return [rs, rp];
}

function handleCollisions() {
    while (collisionCandidates.length > 0) {
        var s = collisionCandidates[collisionCandidates.length - 1][0];
        var p = collisionCandidates[collisionCandidates.length - 1][1];
        collisionCandidates.pop();
        resolveCollisions(s, p, findCollidedPics(s, p));
    }
}

function handleMouseCollisions() {
    selectMousePics(mouseStat.x, mouseStat.y, findMousePics(mouseStat.x, mouseStat.y));
    mouseCandidate = false;
}

var collisionCandidates = [];
var mouseCandidate = false;