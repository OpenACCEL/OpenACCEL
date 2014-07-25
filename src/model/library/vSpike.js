//This function was taken from keesvanoverveld.com
this.std.vSpike = function(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r = Math.round(y);
    var p = Math.round(x);
    var rr = [];
    for (var i = 0; i < r; i++) {
        if (i === p) {
            rr[i] = 1;
        } else {
            rr[i] = 0;
        }
    }
    return rr;
};
