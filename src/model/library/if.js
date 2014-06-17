/**
 * @memberof Model.Library
 * Returns one of two arguments based on a conditional argument.
 * @param  condition	array taking the role of the first input of the function
 * @param  ifTrue		Value returned if cond evaluates to true
 * @param  ifFalse		Value returned if cond evaluates to false
 * @return 				ifTrue if condition evaluates to true, ifFalse if condition evaluates to false
 */
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
