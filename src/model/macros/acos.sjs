let acos = macro {
    rule { ($x) } => {
        (function() {
            return Math.acos($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.acos($x);
        })()
    }
}