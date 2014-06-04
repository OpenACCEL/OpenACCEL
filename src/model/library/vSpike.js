//This function was taken from keesvanoverveld.com
function vSpike(x, y) {
    var r = Math.round(y);
    var p = Math.round(x);
    var rr = [];
    for (i = 0; i < r; i++) {
        if (i == p) {
            rr[i] = 1;
        } else {
            rr[i] = 0;
        }
    }
    return rr;
}