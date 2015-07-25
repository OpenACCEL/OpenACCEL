require.config({
    baseUrl: "scripts"
});

define(["react-addons", "Model/DebugMessage"], /**@lends View*/ function(React, DebugMessage) {
    /**
     * A log containing debug and error messages
     */
    var DebugLog = React.createClass({
        getInitialState: function() {
            // Display initial welcome message
            var initialMessage = new DebugMessage("Welcome to OpenACCEL!", "INFO");
            return {
                messages: [initialMessage]
            }
        },

        /**
         * Adds the given message to the list of messages to be displayed
         * in the log
         * @param {DebugMessage} message The message to add
         */
        addMessage: function(message) {
            var newMessages = this.state.messages;
            newMessages.unshift(message);
            this.setState({messages: newMessages});

            // Always scroll table to top to reveal new message
            $("debuglog").find("div.scroll").scrollTop(0);
        },

        /**
         * Clears the current log of all messages, and displays a "log cleared" message
         */
        clearMessages: function() {
            var clearedMessage = new DebugMessage("Cleared", "INFO");
            this.setState({messages: [clearedMessage]});
        },

        render: function() {
            return (
                <table id="debuglog">
                <thead>
                    <tr className="dl_headerrow">
                        <th id="dl_th_time">Time</th>
                        <th id="dl_th_type">Type</th>
                        <th id="dl_th_message">Message</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td colSpan="3">
                        <div className="scroll" style={{maxHeight: '120px'}}>
                        <table id="dl_innertable">
                        <tbody>
                        {
                            this.state.messages.map((function(m, i) {
                                var typeclass = "dl_td_type dl_type_" + m.getType();
                                var cssclass = "dl_td_message " + m.cssclass;
                                if (["ERROR_UNKNOWN", "ERROR_SYNTAX", "ERROR_RUNTIME"].indexOf(m.type) > -1) {
                                    cssclass += " dl_errormsg";
                                }

                                return (
                                    <tr className="dl_contentsrow" key={Math.random()}>
                                        <td className="dl_td_time">{m.getTime()}</td>
                                        <td className={typeclass}>{m.getType().toUpperCase()}</td>
                                        <td className={cssclass} style={m.style}>{m.message}</td>
                                    </tr>
                                )
                            }).bind(this))
                        }
                        </tbody>
                        </table>
                        </div>
                    </td>
                    </tr>
                </tbody>
                </table>
            )
        }
    });

    return DebugLog;
});
