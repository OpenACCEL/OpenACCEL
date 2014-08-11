require.config({
    baseUrl: "scripts"
});

define([], /**@lends View*/ function() {
    /**
     * Constructs a new Tooltip object
     *
     * @param {String} id      String to be used as a suffix in the id values of the generated html elements
     * @param {String} div     Selector to indicate which element the Tooltip should be associated with
     * @param {String} classes Classes to be assigned to the generated tooltip to affect the look and feel
     *
     * @memberof View
     * @class
     * @classdesc Tooltip object to be able to show the user messages related to a specific UI-element
     */
    function Tooltip(id, classes, x, y) {
        this.id = id;
        this.classes = classes;
        this.x = x;
        this.y = y;

        this.getHTML = function(message) {
            return '' +
                '<div class = "tooltipcontainer">' +
                    '<div id = "tooltip' + this.id + '" class = "tooltip ' + this.classes + '">' +
                        ' + message + ' +
                    '</div>' +
                '</div>';
        };

        this.initialize = function() {
            $(document.body).append(this.getHTML(''));

            var tooltip = $('#tooltip' + this.id);
            tooltip.toggle(false);

            tooltip.parent().css(
                {
                    'padding-left': -20 + this.x,
                    'padding-top': 10 + this.y
                }
            );

            tooltip.on('click',
                function() {
                    $(this).animate({padding: '+=8'}, 50,
                        function() {
                            $(this).animate({opacity: 0, width: 0, height: 0}, 200,
                                function() {
                                    //$(this).toggle(false);
                                    $(this).parent().remove();
                                }
                            );
                        }
                    );
                }
            );

            tooltip.on('mouseenter',
                function() {
                    $(this).animate({opacity: 0.8}, 200);
                }
            );

            tooltip.on('mouseleave',
                function() {
                    $(this).animate({opacity: 1}, 100);
                }
            );
        };

        this.initialize();

        this.set = function(message) {
            $('#tooltip' + this.id).html(message);
            $('#tooltip' + this.id).toggle(true);
        };
    }

    return Tooltip;
});
