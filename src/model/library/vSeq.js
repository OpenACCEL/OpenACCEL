//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    x = __objectToArray__(x);
    y = __objectToArray__(y);
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var p = [];
        for (k = x; k < y; k++) {
            p.push(k);
        }
        return p;
    } else {
        return [];
    }
}