macro func {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        exe.$x = function() {
            // If a quantity is time dependant, look up if there exists a previous version.
            if (exe.report && exe.report.$x.isTimeDependent) {
                if (exe.$x[exe.time] === undefined) {
                    exe.$x[exe.time] = $expr;
                }
                return exe.$x[exe.time];
            } else {
                if (exe.$x[0] === undefined || exe.$x.hasChanged) {
                    exe.$x[0] = ($expr);
                    exe.$x.hasChanged = false;
                }
                return exe.$x[0];
            }
        };
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
            return $expr;
        };
    }
    rule {
        ($x($xs (,) ...) = $expr:expr ; $dim)
    } => {
        func($x($xs (,) ...) = $expr)
        exe.$x.dim = $dim;
    }
}
