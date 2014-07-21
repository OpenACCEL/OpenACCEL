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
    /**
     * The object returned should have certain predefined methods such as token().
     */
    return {
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
        // At the moment, as a test, just make all 'a' characters red
        if (stream.next() == 'a') {
            return 'red';
        } else {
            return null;
        }
      }
    };
});

});
