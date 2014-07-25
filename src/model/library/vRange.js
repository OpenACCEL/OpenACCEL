//This function was taken from keesvanoverveld.com
this.std.vRange = function(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var p = [];
        for (var k in x) {
            p.push(x[k]);
        }
        return p;
    } else {
        return [x];
    }
};
