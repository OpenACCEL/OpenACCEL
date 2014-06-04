//This function was taken from keesvanoverveld.com
function vRange(x) {
    x = __objectToArray__(x);
    if (x instanceof Array) {
        var p = [];
        for (k in x) {
            p.push(x[k]);
        }
        return p;
    } else {
        return [x];
    }
}