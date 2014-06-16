//This function was taken from keesvanoverveld.com
function vRange(x) {
    x = objectToArray(x);
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
