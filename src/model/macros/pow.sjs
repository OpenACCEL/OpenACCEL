let pow = macro {
    rule { ($x, $y) } => {
        (function() {
            return Math.pow($x, $y);
        })()
    }

    rule { ($x:expr, $y:expr) } => {
        (function() {
            return Math.pow($x, $y);
        })()
    }
}