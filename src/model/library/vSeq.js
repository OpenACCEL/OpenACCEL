//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    x = objectToArray(x);
    y = objectToArray(y);
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
