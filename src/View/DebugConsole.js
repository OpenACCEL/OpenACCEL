require.config({
    baseUrl: "scripts"
});

define(["react-addons"], /**@lends View*/ function(React) {
    /**
     * @class
     * @classdesc A console containing various debugging features
     */
    var DebugConsole = React.createClass({
        getInitialState: function() {
            return {

            }
        },

        render: function() {
            return (
                <table id="debugconsole">
                    <tr className="dc_headerrow">
                        <th id="dc_th_messages">Messages</th>
                        <th id="dc_th_messages">Watchlist</th>
                    </tr>
                    <tr className="dc_contentsrow">
                        <td id="dc_td_messages">Boe</td>
                        <td id="dc_td_messages">Hoi</td>
                    </tr>
                </table>
            )
        }
    });

    return DebugConsole;
});
