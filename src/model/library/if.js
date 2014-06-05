/**
 * @memberof Model.Library
 * Returns one of two arguments based on a conditional argument.
 * @param  condition	array taking the role of the first input of the function
 * @param  ifTrue		Value returned if cond evaluates to true
 * @param  ifFalse		Value returned if cond evaluates to false
 * @return 				ifTrue if condition evaluates to true, ifFalse if condition evaluates to false
 */
function __if__(condition, ifTrue, ifFalse) {
    return zip([condition, ifTrue, ifFalse], function(conditionInner, ifTrueInner, ifFalseInner) {
        if (conditionInner) {
            return ifTrueInner;
        } else {
            return ifFalseInner;
        }
    });
}
