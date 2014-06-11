macro func {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        exe.$x = function() {
            // If a quantity is time dependant, look up if there exists a previous version.
            if (exe.report && exe.report.$x.isTimeDependent) {
                if (exe.$x.hist[exe.time] === undefined) {
                    exe.$x.hist[exe.time] = exe.$x.expr();
                }
                return exe.$x.hist[exe.time];
            } else {
                if (exe.$x.hist[0] === undefined || exe.$x.hasChanged) {
                    // initialize the values for user input
                    if (exe.report && exe.report.$x.category === 1) {
                        exe.$x.hist[0] = exe.report.$x.input.parameters[0];
                    } else {
                         exe.$x.hist[0] = exe.$x.expr();
                    }            
                    exe.$x.hasChanged = false;
                }
                return exe.$x.hist[0];
            }
        };
        exe.$x.expr = function() { return $expr; };
        exe.$x.hist = [];
    }
    rule {
        ($x = $expr:expr ; $dim)
    } => {
        func($x = $expr)
        exe.$x.dim = $dim;
    }

    // Function declarations.
    rule {
        ($x($xs (,) ...) = $expr:expr)
    } => {
        exe.$x = function($xs (,) ...) {
            return exe.$x.expr($xs (,) ...);
        };
        exe.$x.expr = function($xs (,) ...) { return $expr; };
    }
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
        exe.$x.dim = $dim;
    }
}
