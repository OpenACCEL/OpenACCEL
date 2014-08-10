/*
 * A complete list of library functions.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define([], /**@lends Model.Library */ function() {
    /**
     * @class
     * @classdesc A complete list of library functions.
     */
    function Library(source) {

        /**
         * A list of standard library functions.
         */
        this.std = [
            "abs",
            "acos",
            "add",
            "and",
            "arrayToObject",
            "asin",
            "at",
            "atan",
            "atan2",
            "bin",
            "binaryZip",
            "ceil",
            "cos",
            "debug",
            "divide",
            "__do__",
            "equal",
            "exp",
            "factorial",
            "floor",
            "foldl",
            "getChan",
            "getTime",
            "getUrl",
            "greaterThan",
            "greaterThanEqual",
            "iConvolve",
            "iGaussian",
            "iMake",
            "iMedian",
            "iSpike",
            "__if__",
            "imply",
            "lessThan",
            "lessThanEqual",
            "ln",
            "log",
            "max",
            "min",
            "modulo",
            "multiaryZip",
            "multiply",
            "not",
            "notEqual",
            "objectToArray",
            "or",
            "paretoHor",
            "paretoMax",
            "paretoMin",
            "paretoVer",
            "plot",
            "poisson",
            "pow",
            "putChan",
            "ramp",
            "random",
            "round",
            "sin",
            "sqrt",
            "subtract",
            "sum",
            "tan",
            "unaryZip",
            "uniminus",
            "vAggregate",
            "vAppend",
            "vConcat",
            "vConvolve",
            "vDom",
            "vDot",
            "vEigenSystem",
            "vExtend",
            "vGaussian",
            "vLen",
            "vMake",
            "vMatInverse",
            "vMatMatMul",
            "vMatSolve",
            "vNormAbs",
            "vNormEuclid",
            "vNormFlat",
            "vNormSq",
            "vNormalize",
            "vRange",
            "vSegment",
            "vSeq",
            "vSequence",
            "vSpike",
            "vTranspose",
            "vVecRamp",
            "zip"
        ];
    }

    Library.prototype.getFunctionNames = function(escaped) {
        return this.std;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Library;
});
