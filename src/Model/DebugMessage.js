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

        /**
         * Optional custom styling of the debug message when rendered in the debug log.
         * Will be applied to the span containing the debug message text. Use camelCased
         * property names as keys, string values.
         *
         * @type {Object}
         */
        this.style = {};

        /**
         * Optional, custom css class to give to the span containing the error message
         * of this debugmessage.
         *
         * @type {String}
         */
        this.cssclass = "";

        /**
         * Whether this debugmessage is about a unit error that occured
         *
         * @type {Boolean}
         */
        this.uniterror = false;
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

    /**
     * Returns the type of this message in human-readable form
     * @return {String} The type of this message
     */
    DebugMessage.prototype.getType = function() {
        switch (this.type) {
            case "ERROR_UNKNOWN":
                return "error";
                break;
            case "ERROR_SYNTAX":
                return "syntax";
                break;
            case "ERROR_RUNTIME":
                return "error";
                break;
            case "DEBUG":
                return "debug";
                break;
            case "NOTICE":
                return "notice";
                break;
            case "WARNING":
                return "warning";
                break;
            case "INFO":
                return "info";
                break;
            default:
                return "info";
                break;
        }
    };

    return DebugMessage;
});
