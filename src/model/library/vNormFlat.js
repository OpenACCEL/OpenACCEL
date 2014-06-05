//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    x = __objectToArray__(x);
    if (x instanceof Array) {
        // we support also strings that are to be concatenated.
        // Hence the initialisation cannot simply be var a=0; we must leave the type of a open until after
        // the first assignment;
        var a;
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                if (a != undefined) {
                    a += x[i];
                } else {
                    a = x[i];
                }
            }
        }
        return a;
    } else {
        return x;
    }
}