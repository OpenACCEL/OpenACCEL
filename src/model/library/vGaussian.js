//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
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
            runOK = false;
            errorString += "\nvGaussian: cannot make a vector with <0 elements";
            return errOb;
        }
    } else {
        runOK = false;
        errorString += "\nvGaussian: both arguments must be scalar.";
        return errOb;
    }
}