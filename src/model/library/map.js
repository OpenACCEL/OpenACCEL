/**
 * Applies the given function on the given array. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array to which the given function should be applied
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 */
function map(a, func) {
	if (a instanceof Array) {
		// Recursive step, a is an array
		var result = [];
		for (var key in a) {
			result[key] = map(a[key], func);
		}
		return result;
	} else {
		// Base: a is a scalar
		return func(a);
	}
}