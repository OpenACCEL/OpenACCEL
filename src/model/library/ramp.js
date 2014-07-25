this.std.ramp = function(x, x1, y1, x2, y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var rmp = 0;
    if (x1 != x2) {
        if (x < x1) {
            rmp = y1;
        } else {
            if (x > x2) {
                rmp = y2;
            } else {
                rmp = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
            }
        }
    } else {
        rmp = ((x2 + y2)) / 2.0;
    }
    return rmp;
};
