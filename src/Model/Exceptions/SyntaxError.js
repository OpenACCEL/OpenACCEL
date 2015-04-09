/*
 * An error that occured while parsing ACCEL script.
 * Indicates that the script was not valid ACCEL script.
 * (or that the parser is broken ;)).
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

define([], /**@lends Model.Error*/ function() {
    /**
     * @class
     * @classdesc An error that occured while parsing ACCEL script.
     *
     * @param {Object} e An error object thrown by the jison parser,
     * either a parser or a lexical scanner error.
     * @param {String} source The source code that was parsed which
     * generated this syntax error. Used to determine the offset of the
     * offending character sequence in the source code.
     */
    function SyntaxError(e, source) {
        // Construct from given jison error
        if (typeof e !== 'undefined') {
            if (typeof e.hash.loc === 'undefined') {
                // Lexical error
                this.type = "lexical";
                this.message = e.message;
                this.firstLine = this.lastLine = e.hash.line+1;

                // Deduce the position from the amount of '-' characters in the error message
                // and from the start of the string mentioned in the message in the parsed source..
                var textMatch = this.message.split("\n")[1];
                var start=0;
                var end=textMatch.length;
                if (textMatch.substr(0,3) === '...') {
                    start = 3;
                }
                if (textMatch.substr(-3) === '...') {
                    end -= 3;
                }
                textMatch = textMatch.substring(start, end);

                var offset = source.indexOf(textMatch);

                var relativePosRE = /(-)*\^$/;
                var position = relativePosRE.exec(this.message)[0].length - (start-1);

                this.startPos = offset+position-2;
                this.endPos = this.startPos+1;
                this.found = source.substr(this.startPos, 1);
            } else {
                // Parsing error
                this.type = "parsing";
                this.found = e.hash.text;
                this.expected = e.hash.expected;
                this.firstLine = e.hash.loc.first_line;
                this.lastLine = e.hash.loc.last_line;
                this.startPos = e.hash.loc.first_column;
                this.endPos = e.hash.loc.last_column;
                this.message = e.message;
            }
        } else {
            // No jison error passed; set default values
            this.type = "parsing";
            this.firstLine = 0;
            this.lastLine = 0;
            this.startPos = 0;
            this.endPos = 0;
            this.found = '';
            this.expected = [];
            this.message = "";
        }
    }

    /**
     * Returns a human-readable message describing the SyntaxError.
     *
     * @return {String} A human-readable error message about this error.
     */
    SyntaxError.prototype.toReadable = function() {
        var message = "";

        if (this.type == "parsing") {
            message += "Parsing error: expected ";
            for (var elem in this.expected) {
                message += this.expected[elem];
                if (elem < this.expected.length-1) {
                    message += " or ";
                }
            }
            message += ", found: '" + this.found + "'";
        } else {
            message = this.message;
        }

        return message;
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return SyntaxError;
});
