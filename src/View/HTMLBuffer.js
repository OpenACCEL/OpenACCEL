require.config({
    baseUrl: "scripts"
});

define([], /**@lends View*/ function() {
    /**
     * Constructs a buffer object to contain updated content of a div and update the div when desired.
     *
     * @memberof View
     * @param {String} div Id of the div who's content is to be buffered
     * @class
     * @classdesc Buffer class to contain updated content of a div and update the div when desired
     */
    function HTMLBuffer() {
        this.html = '';

        /**
         * Clears the buffer
         */
        this.empty = function() {
            this.html = '';
        };

        /**
         * Checks whether the buffer is empty
         *
         * @return {Boolean} True if and only if buffer is empty
         */
        this.isEmpty = function() {
            return (this.html === '');
        };

        /**
         * Hides the target html element if the buffer is empty, show otherwise
         *
         * @param {String} selector to indicate which element should be hidden
         */
        this.hideIfEmpty = function(target) {
            $(target).toggle(!this.isEmpty());
        };

        /**
         * Appends html to the buffer
         *
         * @param {String} html String to be appended to the buffer
         */
        this.append = function(html) {
            this.html = this.html + html;
        };

        /**
         * Replaces the content in the div with the content in the buffer
         * 
         * @param {String} The div to place the HTML content in.
         */
        this.flip = function(div) {
            var target = $(div);
            target.html(this.html);
        };
    }

    return HTMLBuffer;
});
