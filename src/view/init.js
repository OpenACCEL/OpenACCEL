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
    }
);
