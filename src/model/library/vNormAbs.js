//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    x = __objectToArray__(x);
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += Math.abs(x[i]);
            }
        }
        return a;
    } else {
        return Math.abs(x);
    }
}