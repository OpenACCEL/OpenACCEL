function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    function doIf(cond, tr, fa) {
        if (cond) {
            return tr;
        } else {
            return fa;
        }
    }

    if (condition instanceof Object) {
        return zip([condition, ifTrue, ifFalse], doIf);
    } else {
        return doIf(condition, ifTrue, ifFalse);
    }
}
