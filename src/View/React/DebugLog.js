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
            var initialMessage = new DebugMessage("Welcome to OpenACCEL!", "NOTICE");
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
            newMessages.push(message);
            this.setState({messages: newMessages});
        },

        /**
         * Clears the current log of all messages, and displays a "log cleared" message
         */
        clearMessages: function() {
            var clearedMessage = new DebugMessage("Cleared", "NOTICE");
            this.setState({messages: [clearedMessage]});
        },

        render: function() {
            return (
                <table id="debuglog">
                <thead>
                    <tr className="dl_headerrow">
                        <th id="dl_th_time">Time</th>
                        <th id="dl_th_message">Message</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td colSpan="2">
                        <div className="scroll" style={{maxHeight: '120px'}}>
                        <table id="dl_innertable">
                        <tbody>
                        {
                            this.state.messages.map((function(m, i) {
                                return (
                                    <tr className="dl_contentsrow" key={Math.random()}>
                                        <td className="dl_td_time">{m.getTime()}</td>
                                        <td className="dl_td_message" style={m.style}>{m.message}</td>
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
