/**
 * CodeMirror mode file that provides syntax highlighting support for the ACCEL
 * languague by defining a lexical scanner that consumes tokens and returns
 * css classes that should be used to style the consumed token in the input stream.
 */
(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

/**
 * Tell CodeMirror to register our mode under the name "ACCEL"
 */
CodeMirror.defineMode("ACCEL", function() {
    // Regular expressions
    var comment = /^\/\//;
    var words = /^\b\w*[a-zA-Z_]\w*\b/;
    var litOperator = /^(<=|<|>=|>|==|!=|=|\|\||&&)/;
    var operators = /[+\-*\/\%\!\;]/;

    /** List of all built-in ACCEL functions */
    var stdfunctions = [
        'slider',
        'input',
        'check',
        'button',
        'abs',
        'acos',
        'add',
        'and',
        'asin',
        'atan',
        'atan2',
        'bin',
        'ceil',
        'cond',
        'cos',
        'cursorB',
        'cursorX',
        'cursorY',
        'debug',
        'divide',
        'do',
        'equal',
        'exp',
        'factorial',
        'floor',
        'getChan',
        'getTime',
        'getUrl',
        'greaterThan',
        'greaterThanEqual',
        'iConvolve',
        'iGaussian',
        'iMake',
        'iMedian',
        'iSpike',
        'if',
        'imply',
        'lessThan',
        'lessThanEqual',
        'ln',
        'log',
        'max',
        'min',
        'modulo',
        'multiply',
        'not',
        'notEqual',
        'or',
        'paretoHor',
        'paretoMax',
        'paretoMin',
        'paretoVer',
        'plot',
        'poisson',
        'pow',
        'putChan',
        'ramp',
        'random',
        'round',
        'sin',
        'sqrt',
        'subtract',
        'tan',
        'uniminus',
        'vAggregate',
        'vAppend',
        'vConcat',
        'vConvolve',
        'vDom',
        'vDot',
        'vEigenSystem',
        'vExtend',
        'vGaussian',
        'vLen',
        'vMake',
        'vMatInverse',
        'vMatMatMul',
        'vMatSolve',
        'vNormAbs',
        'vNormEuclid',
        'vNormFlat',
        'vNormSq',
        'vNormalize',
        'vRange',
        'vSegment',
        'vSeq',
        'vSequence',
        'vSpike',
        'vTranspose',
        'vVecRamp'
    ];

    /**
     * Consumes an entire string
     * @param  {quote} quote The quote with which the string was started
     * @return {String} "string"
     */
    function tokenString(quote) {
        return function(stream, state) {
            var escaped = false, next, end = false;
            while ((next = stream.next()) != null) {
                if (next == quote && !escaped) {
                    end = true;
                    break;
                }
                escaped = !escaped && next == "\\";
            }

            if (end || !escaped) state.tokenize = null;
            return "string";
        };
    }

    /**
     * Consumes one token from the stream, given we're not inside a string.
     */
    function tokenBase(stream, state) {
        // Comments
        if (stream.match(comment)) {
            stream.skipToEnd();
            return "comment";
        }

        // Operators such as >,<=, ||, && etc.
        if (stream.match(litOperator)) {
            return 'operator logical';
        }

        // Now get a single character form the stream
        var ch = stream.next();

        // Units
        if (ch == ';') {
            state.unit = true;
            return 'strong unitsep';
        }

        // Strings
        if (ch == '"' || ch == "'") {
            state.tokenize = tokenString(ch);
            return state.tokenize(stream, state);
        }

        // Characters that won't be given a special style
        if (/[\[\]\{\}\(\),\.]/.test(ch)) {
            return null;
        }

        // Numbers
        if (/\d/.test(ch)) {
            stream.eatWhile(/[\w\.]/);
            return "number";
        }

        // Operators such as +, -, /, % etc.
        if (operators.test(ch)) {
            stream.eatWhile(operators);
            return "strong algebra";
        }

        // Identify different kinds of words.
        // Put the consumed character back in case we have quantity names or functions consisting
        // of only one letter
        stream.backUp(1);
        if (stream.match(words)) {
            var word = stream.current();

            if (stdfunctions.indexOf(word) > -1) {
                return 'red builtin';
            } else {
                return 'quantity';
            }
        }
        stream.next();

        // Don't style
        return null;
    }

    /**
     * The object returned should have certain predefined methods such as token().
     */
    return {
        /**
         * Sets up the initial state of the parser
         */
        startState: function() {
            return {tokenize: null, unit: false};
        },

        /**
        * Takes a stream object (representing a single line of code) and the current state
        * of the parser as input, and returns the style that should be applied to the
        * next token in the stream in the form of a css class. Consumes the next token in
        * the stream and advances the current parser position in the stream.
        *
        * @param {Stream} stream Stream object that encapsulates a single line of code.
        * See http://codemirror.net/doc/manual.html#modeapi for the API that this object supports
        * @param {Object} state An object containing the current state of the parser, as set by the parser
        * the previous time it was invoked.
        * @return {String} The name of the css class that should be applied to the consumed token, or null if
        * no style should be applied.
        */
        token: function(stream, state) {
            // If we're inside a unit declaration, skip to end without styling any of it at the moment.
            if (state.unit) {
                state.unit = false;
                stream.skipToEnd();
                return "unit";
            }

            // Eat any whitespace characters
            if (stream.eatSpace()) {
                return null;
            }

            // If we're inside a string, go to the string parsing method.
            // Else use the 'standard' parsing method
            var style = (state.tokenize || tokenBase)(stream, state);

            return style;
        }
    };
});

});
