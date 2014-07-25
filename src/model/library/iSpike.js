//This function was taken from keesvanoverveld.com
this.std.iSpike = function(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r1 = Math.round(y1);
    var r2 = Math.round(y2);
    var p1 = Math.round(x1);
    var p2 = Math.round(x2);
    var rr = [];
    for (i = 0; i < r1; i++) {
        rr[i] = [];
        for (j = 0; j < r2; j++) {
            if (i == p1 && j == p2) {
                rr[i][j] = 1;
            } else {
                rr[i][j] = 0;
            }
        }
    }
    return rr;
};
