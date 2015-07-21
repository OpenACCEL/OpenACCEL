require.config({
    baseUrl: "scripts"
});

define(["moment"], /**@lends View*/ function(moment) {
    /**
     * @class
     * @classdesc A console containing various debugging features
     */
    function DebugMessage(message, type) {
        if (message === undefined) {
            message = "";
        }
        if (type === undefined) {
            type = "NOTICE";
        }

        this.message = message;

        this.timestamp = moment().valueOf();

        this.time = moment().format("HH:mm:ss");

        this.type = type;
    }


    return DebugMessage;
});
