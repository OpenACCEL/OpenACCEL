/**
 * Applies the given function on the given array of inputs. The function is aplied recursively,
 * so also to nested arrays. This fucntion is to be called by anything that wants to use either map, binaryZip or nzip.
 * This function automatically calls the most efficient function for the job.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 * @memberof Model.Library
 */
this.std.zip = function(x, func) {
    var numArgs = x.length;
    switch (numArgs) {
        case 0:
            throw new error("Cannot zip with zero arguments, attempted by: " + arguments.callee.caller.name);
        case 1:
            return this.libraries.std.unaryZip(x[0], func);
        case 2:
            return this.libraries.binaryZip(x[0], x[1], func);
        default:
            return this.libraries.multiaryZip(x, func);
    }
};
