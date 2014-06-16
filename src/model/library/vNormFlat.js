//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    x = objectToArray(x);
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
