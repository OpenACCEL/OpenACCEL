//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (!(x instanceof Array) && !(y instanceof Array)) {
        var n = Math.round(x);
        var s = y;
        if (n >= 0) {
            var t = [];
            var sum = 0;
            var x = -(n - 1) / 2;
            var denom = 2 * s * s;
            for (i = 0; i < n; i++) {
                t[i] = Math.exp(-x * x / denom);
                sum += t[i];
                x += 1;
            }
            for (i = 0; i < n; i++) {
                t[i] /= sum;
            }
            return t;
        } else {
            throw new Error("vGaussian: cannot make a vector with <0 elements");
        }
    } else {
        throw new Error("vGaussian: both arguments must be scalar.");
    }
}
