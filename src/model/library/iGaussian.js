//This function was taken from keesvanoverveld.com
function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    n1 = Math.round(n1);
    n2 = Math.round(n2);
    if (n1 >= 0 && n2 >= 0) {
        var t = [];
        var sum = 0;
        var x1 = -(n1 - 1) / 2;
        var x2 = -(n2 - 1) / 2;
        var denom1 = 2 * s1 * s1;
        var denom2 = 2 * s2 * s2;
        for (i = 0; i < n1; i++) {
            t[i] = [];
            x2 = -(n2 - 1) / 2;
            for (j = 0; j < n2; j++) {
                t[i][j] = Math.exp(-x1 * x1 / denom1 - x2 * x2 / denom2);
                sum += t[i][j];
                x2 += 1;
            }
            x1 += 1;
        }
        for (i = 0; i < n1; i++) {
            for (j = 0; j < n2; j++)
                t[i][j] /= sum;

        }
        return t;
    } else {
        throw new Error("\niGaussian: cannot make an array with <0 elements");
    }
}
