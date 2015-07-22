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
                messages: [initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage, initialMessage]
            }
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
                                        <td className="dl_td_message">{m.message}</td>
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

    /**
     * A list of quantities with their current values
     */
    var WatchList = React.createClass({
        getInitialState: function() {
            return {
                quantities: []
            }
        },

        /**
         * Updates the values of all the quantities in the watchlist with their up-to-date values
         */
        updateValues: function() {
            var exe = this.props.controller.getScript().exe;
            var newQuantities = this.state.quantities.map((function(q, i) {
                return {name: q.name, value: exe.getValue(q.name)};
            }).bind(this));

            this.setState({quantities: newQuantities});
        },

        render: function() {
            var listHTML = (function() {
                if (this.state.quantities.length === 0) {
                    return (
                        <tr className="wl_contentsrow">
                            <td className="wl_quantity_none" colSpan="2">No quantities to watch</td>
                        </tr>
                    )
                } else {
                    return this.state.quantities.map((function(q, i) {
                        return (
                            <tr className="wl_contentsrow" key={q.name}>
                                <td className="wl_td_name">{q.name}:</td>
                                <td className="wl_td_value">{q.value}</td>
                            </tr>
                        )
                    }).bind(this))
                }
            }).bind(this);

            return (
                <table id="watchlist">
                    <tbody>
                    <tr className="wl_headerrow">
                        <th id="wl_th_quantity">Quantity</th>
                        <th id="wl_th_value">Value</th>
                    </tr>
                    {
                        listHTML()
                    }
                    </tbody>
                </table>
            )
        }
    });

    /**
     * @class
     * @classdesc A console containing various debugging features
     */
    var DebugConsole = React.createClass({
        resizecols: false,

        getInitialState: function() {
            return {

            }
        },

        componentDidMount: function() {
            // Subscribe to controller script iteration events, in order to update
            // the values in the watchlist
            $(document).on("ScriptStepEvent", (function() {
                this.refs.watchlist.updateValues();
            }).bind(this));
        },

        shouldComponentUpdate: function() {
            // TODO: return false when debuglog is hidden?
            return true;
        },

        /**
         * Called when the user clicks the clear button. Clears the log of all messages
         */
        clearMessages: function(e) {
            this.refs.debuglog.clearMessages();
        },

        beginResizeColumns: function() {
            this.resizecols = true;
        },

        endResizeColumns: function() {
            this.resizecols = false;
        },

        resizeColumns: function(e) {
            if (this.resizecols === true) {
                var offset = $("#dc_th_messages").offset().left;
                var newWidth = Math.min(925, Math.max(500, e.clientX - offset));
                $("#dc_th_messages").css("width", newWidth);
            }
        },

        render: function() {
            return (
                <table id="debugconsole" onMouseMove={this.resizeColumns} onMouseLeave={this.endResizeColumns} onMouseUp={this.endResizeColumns}>
                    <tbody>
                    <tr className="dc_headerrow">
                        <th id="dc_th_messages">
                            <span style={{verticalAlign: 'middle'}}>Messages</span>
                            <input type="button" className="smallbtn" id="dc_clearmessages" value="Clear" onClick={this.clearMessages} />
                        </th>
                        <th id="dc_th_resize"></th>
                        <th id="dc_th_watchlist">
                            <span style={{verticalAlign: 'middle'}}>Watchlist</span>
                        </th>
                    </tr>
                    <tr className="dc_contentsrow">
                        <td id="dc_td_messages">
                            <DebugLog ref="debuglog" />
                        </td>
                        <td id="dc_td_resize" onMouseDown={this.beginResizeColumns}></td>
                        <td id="dc_td_watchlist">
                            <WatchList controller={this.props.controller} ref="watchlist" />
                        </td>
                    </tr>
                    </tbody>
                </table>
            )
        }
    });

    return DebugConsole;
});
