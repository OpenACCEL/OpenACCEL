macro func {
    // Normal variable definitions.
    rule {
        ($x = $expr:expr)
    } => {
        exe.$x = function($x) {
            // If a quantity is time dependant, look up if there exists a previous version.
            if (exe.__report__ && exe.__report__.$x.isTimeDependent) {
                if (exe.$x[exe.__time__] === undefined) {
                    exe.$x[exe.__time__] = $expr;
                }
                return exe.$x[exe.__time__];
            } else {
                if (exe.$x[0] === undefined || exe.$x.__hasChanged__) {
                    exe.$x[0] = ($expr);
                    exe.$x.__hasChanged__ = false;
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
