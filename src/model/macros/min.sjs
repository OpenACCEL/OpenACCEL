let min = macro {
    rule { ($x, $y) } => {
        (function() {
            return Math.min($x, $y);
        })()
    }

    rule { ($x:expr, $y:expr) } => {
        (function() {
            return Math.min($x, $y);
        })()
    }
}