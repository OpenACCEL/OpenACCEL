//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {

    var n = Math.round(x);
    var s = y;

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

}
