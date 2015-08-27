require.config({
    baseUrl: "scripts"
});

define(["react-addons"], /**@lends View*/ function(React) {
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

            var script = this.props.controller.getScript();
            var newQuantities = this.state.quantities.map((function(q, i) {
                var val = '-';
                if (script.hasQuantity(q.name) && script.isCompiled()) {
                    val = script.exe.getValue(q.name);
                }

                return {name: q.name, value: val};
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
         * Deletes the quantity that was clicked on from the watchlist.
         *
         * @param  {Event} e The event
         */
        deleteQuantity: function(e) {
            var delqty = $(e.target).data("delqty");

            var newQuantities = _.filter(this.state.quantities, function(q, i) {
                return (q.name !== delqty)
            }, this);

            this.setState({quantities: newQuantities});

            this.updateColumnWidths();
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
                        var val = q.value;
                        if (val !== '-') {
                            val = JSON.stringify(val);
                        }
                        var imgID = "watch_del_" + q.name;
                        var nameStyle = (q.value === '-') ? {color: 'rgba(0, 0, 0, 0.5)'} : {};
                        return (
                            <tr className="wl_contentsrow" key={q.name}>
                                <td className="wl_td_name" style={nameStyle}>{q.name}:</td>
                                <td className="wl_td_value">
                                    <span style={{verticalAlign: 'middle'}}>{val}</span>
                                    <img title="Remove" width="16" height="16" src="img/delete.png" className="watchdelimg" id={imgID} data-delqty={q.name} onClick={this.deleteQuantity} />
                                </td>
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

    return WatchList;
});
