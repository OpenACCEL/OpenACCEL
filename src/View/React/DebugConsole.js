require.config({
    baseUrl: "scripts"
});

define(["react-addons", "View/React/WatchList", "View/React/DebugLog", "Model/DebugMessage"], /**@lends View*/ function(React, WatchList, DebugLog, DebugMessage) {

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
            $(document).on("ERROR_UNKNOWN", (function(event) {
                var msg = new DebugMessage("An unknown internal error occured.", "ERROR_UNKNOWN");
                this.refs.debuglog.addMessage(msg);
            }).bind(this));

            $(document).on("ERROR_RUNTIME", (function(event, message) {
                var msg = new DebugMessage(message, "ERROR_RUNTIME");
                this.refs.debuglog.addMessage(msg);
            }).bind(this));

            $(document).on("ERROR_SYNTAX", (function(event, message) {
                var msg = new DebugMessage(message, "ERROR_SYNTAX");
                this.refs.debuglog.addMessage(msg);
            }).bind(this));

            // Subscribe to debuglog message log events
            $(document).on("DEBUGMESSAGE", (function(event, message) {
                var msg = new DebugMessage(JSON.stringify(message), "DEBUG");
                this.refs.debuglog.addMessage(msg);
            }).bind(this));

            $(document).on("DEBUGLOG_POST_MESSAGE", (function(event, message) {
                this.refs.debuglog.addMessage(message);
            }).bind(this));

            // Subscribe to controller script iteration events, in order to update
            // the values in the watchlist
            $(document).on("onNextStep", (function(event, cat2quantities) {
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

        /**
         * Called when the user starts to resize the debugconsole table columns
         */
        beginResizeColumns: function() {
            this.resizecols = true;
        },

        /**
         * Called when the user is done resizing the debugconsole table columns
         */
        endResizeColumns: function() {
            this.resizecols = false;
        },

        /**
         * Called during an ongoing column resize action. Resizes the columns
         * according to the current mouse position
         *
         * @param  {Event} e The jQuery event of this action (MouseMove)
         */
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
