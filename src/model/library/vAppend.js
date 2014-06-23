function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (x instanceof Array) {
        // TODO: Shallow copy, shouldn't this be a deep copy?
        var result = x.slice();
        result[x.length] = y;
        return result;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
