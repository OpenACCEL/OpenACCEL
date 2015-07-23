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
            if (this.state.quantities.length === 0) {
                return;
            }

            var exe = this.props.controller.getScript().exe;
            var newQuantities = this.state.quantities.map((function(q, i) {
                return {name: q.name, value: exe.getValue(q.name)};
            }).bind(this));

            this.setState({quantities: newQuantities});
        },

        /**
         * Checks whether all quantities in the list still exist, and removes
         * those that don't.
         */
        validateQuantities: function(quantities) {
            var newQuantities = _.filter(this.state.quantities, function(q, i) {
                return (q.name in quantities && quantities[q.name].todo === false)
            }, this);

            this.setState({quantities: newQuantities});

            this.updateColumnWidths();
        },

        updateColumnWidths: function() {
            var newWidth = $(".wl_td_value").first().outerWidth();
            var totalWidth = $("#watchlist").outerWidth();
            $("#wl_th_quantity").css("width", totalWidth-(newWidth+6));
            $("#wl_th_value").css("width", newWidth+6);
        },

        /**
         * Adds the given quantity to the watchlist
         */
        addQuantity: function(qty) {
            // Make sure it's not already added
            var add = true;
            for (var elem in this.state.quantities) {
                var q = this.state.quantities[elem];

                if (q.name === qty) {
                    add = false;
                    break;
                }
            }

            if (add === true) {
                // Add selected quantity, together with it's current value
                var script = this.props.controller.getScript();
                var exe = script.exe;
                var value = script.getQuantity(qty).value;
                if (exe) {
                    value = exe.getValue(qty);
                }

                var newQuantities = this.state.quantities;
                newQuantities.push({name: qty, value: value});
                this.setState({quantities: newQuantities});

                // Adjust floating column header width
                this.updateColumnWidths();
            }
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
                    <thead>
                    <tr className="wl_headerrow">
                        <th id="wl_th_quantity">Quantity</th>
                        <th id="wl_th_value">Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                    <td colSpan="2">
                        <div className="scroll" style={{maxHeight: '120px'}}>
                        <table id="dl_innertable">
                        <tbody>
                        {
                            listHTML()
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
     * @class
     * @classdesc A console containing various debugging features
     */
    var DebugConsole = React.createClass({
        // Whether the user is resizing the columns of the debug console table
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

            var quantities = this.props.controller.getScript().quantities;
            this.updateAvailableQuantities(quantities);

            // Called when a new script has been compiled
            $(document).on("onNewScript", (function(event, quantities) {
                // Update quickselect, and make sure that all quantities in
                // the watchlist still exist
                this.updateAvailableQuantities(quantities);
                this.refs.watchlist.validateQuantities(quantities);
            }).bind(this));

            // Called when a quantity has been modified or *deleted*
            $(document).on("onModifiedQuantity", (function(event, quantities) {
                // Update quickselect, and make sure that all quantities in
                // the watchlist still exist
                this.updateAvailableQuantities(quantities);
                this.refs.watchlist.validateQuantities(quantities);
            }).bind(this));
        },

        /**
         * Retrieves the current list of quantities from the controller,
         * and sets it as the data source of the watchlist quickselect
         * input.
         *
         * @param {Object} quantities The quantities to set
         */
        updateAvailableQuantities: function(quantities) {
            console.log("Updated quantities!");
            var qties = _.sortBy(quantities, "name");
            var qtynames = [];
            for (var elem in qties) {
                if (qties[elem].todo === false) {
                    var qtyname = qties[elem].name;
                    qtynames.push(qtyname);
                }
            }

            $("#dc_selectwatchqty").quickselect({
                'minChars': 0,
                'matchCase': false,
                'matchMethod': 'startsWith',
                'data': qtynames,
                'autoSelectFirst': false,
                'exactMatch': true,
                'onItemSelect': (function() {
                    this.addWatchQuantity();
                }).bind(this)
            });
        },

        /**
         * Adds the currently selected quantity in the quickselect input
         * to the watchlist
         */
        addWatchQuantity: function() {
            var qty = $("#dc_selectwatchqty").val();
            if (this.props.controller.getScript().hasQuantity(qty)) {
                this.refs.watchlist.addQuantity(qty);
            }
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
                var newWidth = Math.min(930, Math.max(450, e.clientX - offset));
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
                        <th id="dc_th_resize">
                            <div style={{height: '27px', width: '2px', backgroundColor: '#8A358A'}}></div>
                        </th>
                        <th id="dc_th_watchlist">
                            <span style={{verticalAlign: 'middle'}}>Watchlist</span>
                            <div style={{float: 'right'}}>
                                <input autoComplete="off" id="dc_selectwatchqty" list="dc_qtylist" style={{padding: '2px 4px', verticalAlign: 'middle'}} placeholder="Add quantity" className="textin" />
                                <input type="button" className="smallbtn" id="dc_addwatchqty" value="+" onClick={this.addWatchQuantity} />
                            </div>
                        </th>
                    </tr>
                    <tr className="dc_contentsrow">
                        <td id="dc_td_messages">
                            <DebugLog ref="debuglog" />
                        </td>
                        <td id="dc_td_resize" onMouseDown={this.beginResizeColumns}>
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
