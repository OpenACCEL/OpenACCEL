require.config({
    baseUrl: "scripts"
});

define(["react-addons"], /**@lends View*/ function(React) {
    /**
     * @class
     * @classdesc A console containing various debugging features
     */
    var DebugConsole = React.createClass({
        displayName: 'DebugConsole',
        render: function(){
            return <div>Hello React</div>
        }
    });

    return DebugConsole;
});
