/**
 * Special function for handling occurences of predefined constants
 * This is to allow quantities to have names of predefined constants, and to
 * let the system determine at runtime whether to use the value of such a quantity
 * if it exists, or to take the value of the actual constant if it doesn't.
 *
 * @param  {String} name The name of the predefined constant
 */
function predefinedConstant(name) {
    switch (name) {
        case 'E': {
            if (controller.script.hasQuantity("E")) {
                return exe.__E__();
            } else {
                return Math.E;
            }
            break;
        }

        case 'PI': {
            if (controller.script.hasQuantity("PI")) {
                return exe.__PI__();
            } else {
                return Math.PI;
            }
            break;
        }

        case 'true': {
            if (controller.script.hasQuantity("true")) {
                return exe.__true__();
            } else {
                return true;
            }
            break;
        }

        case 'false': {
            if (controller.script.hasQuantity("false")) {
                return exe.__false__();
            } else {
                return false;
            }
            break;
        }
    }
}
