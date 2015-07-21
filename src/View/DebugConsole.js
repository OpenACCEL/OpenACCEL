require.config({
    baseUrl: "scripts"
});

define(["react-addons", "Model/DebugMessage"], /**@lends View*/ function(React, DebugMessage) {

    /**
     * A log containing debug and error messages
     */
    var DebugLog = React.createClass({
        getInitialState: function() {
            var initialMessage = new DebugMessage("Welcome to OpenACCEL!", "NOTICE");
            var secondMessage = new DebugMessage("Welcome to bla!", "NOTICE");
            return {
                messages: [initialMessage, secondMessage]
            }
        },

        clearMessages: function(e) {
            var newMessage = new DebugMessage("Cleared", "NOTICE");
            this.setState({messages: [newMessage]});
        },

        render: function() {
            return (
                <table id="debuglog">
                    <tbody>
                    <tr className="dl_headerrow">
                        <th id="dl_th_time">Time</th>
                        <th id="dl_th_message">Message</th>
                    </tr>
                    {
                        this.state.messages.map((function(m, i) {
                            return (
                                <tr className="dl_contentsrow" key={Math.random()}>
                                    <td className="dl_td_time">{m.time}</td>
                                    <td className="dl_td_message">{m.message}</td>
                                </tr>
                            )
                        }).bind(this))
                    }
                    </tbody>
                </table>
            )
        }
    });

    /**
     * A list of quantities with their current values, if the script is running
     */
    var WatchList = React.createClass({
        getInitialState: function() {
            return {
                quantities: []
            }
        },

        updateValues: function() {
            var newQuantities = this.state.quantities.map((function(q, i) {
                return {name: q.name, value: this.props.controller.getScript().exe.getValue(q.name)};
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
        getInitialState: function() {
            var initialMessage = new DebugMessage("Welcome to OpenACCEL!", "NOTICE");
            var secondMessage = new DebugMessage("Welcome to bla!", "NOTICE");
            return {
                messages: [initialMessage, secondMessage]
            }
        },

        componentDidMount: function() {
            $(document).on("ScriptStepEvent", (function() {
                this.refs.watchlist.updateValues();
            }).bind(this));
        },

        shouldComponentUpdate: function() {
            // TODO: return false when debuglog is hidden?
            return true;
        },

        clearMessages: function(e) {
            var newMessage = new DebugMessage("Cleared", "NOTICE");
            this.refs.debuglog.clearMessages();
        },

        render: function() {
            return (
                <table id="debugconsole">
                    <tbody>
                    <tr className="dc_headerrow">
                        <th id="dc_th_messages">
                            <span style={{verticalAlign: 'middle'}}>Messages</span>
                            <input type="button" className="smallbtn" id="dc_clearmessages" value="Clear" onClick={this.clearMessages} />
                        </th>
                        <th id="dc_th_watchlist">
                            <span style={{verticalAlign: 'middle'}}>Watchlist</span>
                        </th>
                    </tr>
                    <tr className="dc_contentsrow">
                        <td id="dc_td_messages">
                            <DebugLog ref="debuglog" />
                        </td>
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
