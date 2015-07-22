require.config({
    baseUrl: "scripts"
});

define(["moment"], /**@lends View*/ function(moment) {
    /**
     * @class
     * @classdesc A debug message
     */
    function DebugMessage(message, type) {
        if (message === undefined) {
            message = "";
        }
        if (type === undefined) {
            type = "NOTICE";
        }

        /**
         * The actual debug message string
         *
         * @type {String}
         */
        this.message = message;

        /**
         * The time at which the message occured
         *
         * @type {Moment}
         */
        this.timestamp = moment();

        /**
         * The type of this debug message. Can be things like NOTICE, WARNING, ERROR, DEBUG etc.
         *
         * @type {String}
         */
        this.type = type;
    }

    /**
     * Returns the time at which this message was posted in a human-readable format
     *
     * @return {String} The time
     */
    DebugMessage.prototype.getTime = function() {
        return this.timestamp.format("HH:mm:ss");
    };

    /**
     * Returns the timestamp at which this message was posted
     *
     * @return {String} The timestamp
     */
    DebugMessage.prototype.getTimestamp = function() {
        return this.timestamp.valueOf();
    };


    return DebugMessage;
});
