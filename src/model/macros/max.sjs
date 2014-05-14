let max = macro {
    rule { ($x, $y) } => {
        (function() {
            return Math.max($x, $y);
        })()
    }

    rule { ($x:expr, $y:expr) } => {
        (function() {
            return Math.max($x, $y);
        })()
    }
}