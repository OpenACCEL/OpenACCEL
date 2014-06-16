$(document).ready(
    function() {
        $('#main').tabs();

        $('#main').on('tabsbeforeactivate', 
            function(event, ui) {
                switch (ui.oldPanel[0].id) {
                    case 'editrun':
                        controller.pause();
                        break;
                    default:
                        break;
                }
            }
        );

        $('#main').on('tabsactivate', 
            function(event, ui) {
                switch (ui.newPanel[0].id) {
                    case 'editrun':
                        if (controller.autoExecute) {
                            controller.run();
                        }
                        break;
                    default:
                        break;
                }
            }
        );

        $(window).on('load',
            function(event, ui) {
                $('#loading').toggle(false);
            }
        );
    }
);

//------------------------------------------------------------------------------

/**
 * Constructs a buffer object to contain updated content of a div and update the div when desired
 *
 * @param {String} div Id of the div who's content is to be buffered
 * @class
 * @classdesc Buffer class to contain updated content of a div and update the div when desired
 */
function HTMLbuffer(div) {
    this.div = div;
    this.html = '';

    /**
     * Clears the buffer
     */
    this.empty = function() {
        this.html = '';
    }

    /**
     * Checks whether the buffer is empty
     *
     * @return {Boolean} True if and only if buffer is empty
     */
    this.isEmpty = function() {
        return (this.html == '');
    }

    /**
     * Hides the target html element if the buffer is empty, show otherwise
     *
     * @param {String} selector to indicate which element should be hidden
     */
    this.hideIfEmpty = function(target) {
        $(target).toggle(!this.isEmpty());
    }

    /**
     * Appends html to the buffer
     *
     * @param {String} html String to be appended to the buffer
     */
    this.append = function(html) {
        this.html = this.html + html;
    }

    /**
     * Replaces the content in the div with the content in the buffer
     */
    this.flip = function() {
        $(this.div).html(this.html);
    }
}

//------------------------------------------------------------------------------

/**
 * Class to generate a list of selectable items
 * 
 * @param  {String}   selector Element to put the list in
 * @param  {Function} callback Function to be called when an item is clicked
 */
function selectionList(selector, callback) {
    this.selector = selector;
    this.callback = callback;

    /**
     * Buffer to contain HTML for the required list
     * 
     * @type {HTMLbuffer}
     */
    this.buffer = new HTMLbuffer(this.selector);

    /**
     * Generates HTML for an item in the required list of selectable links
     * 
     * @param  {String} item String to represent an item in the list
     * @return {String}      HTML for an item in the required list of selectable links
     */
    this.getItemHTML = function(i, item) {//onclick = "' + this.callbackname + '(\'' + item + '\')"
        return '\
            <a id = "' + this.selector.substring(1) + 'Item' + i + '" value = "' + item + '">' + item + '</a>\
        ';
    };

    /**
     * Adds an item to the list of selectable links
     * 
     * @param {String} item String to represent an item in the list
     */
    this.addItem = function(i, item) {
        this.buffer.append(this.getItemHTML(i, item));
    };

    /**
     * [initializeItem description]
     * 
     * @param  {[type]} i [description]
     * @return {[type]}   [description]
     */
    this.initializeItem = function(i) {
        var itemselector = this.selector + 'Item' + i;

        $(itemselector).on('click', {list: this},
            function(e) {
                // console.log(this);
                // console.log(e);
                e.data.list.callback(this);
            }
        );
    };

    /**
     * Set the items contained in the list
     * 
     * @param {[String]} items Strings to represent the items in the list
     */
    this.set = function(items) {
        this.items = items;

        this.buffer.empty();

        for (var i in items) {
            this.addItem(i, items[i]);
        }

        this.buffer.flip();

        for (var i in items) {
            this.initializeItem(i);
        }
    };
}
