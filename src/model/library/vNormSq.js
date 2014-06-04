//This function was taken from keesvanoverveld.com
function vNormSq(x) {
    x = __objectToArray__(x);
    if (x instanceof Array) {
        var a = 0;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return a;
    } else {
        return x * x;
    }
}