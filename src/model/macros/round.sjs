let round = macro {
    rule { ($x) } => {
        (function() {
            return Math.round($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.round($x);
        })()
    }
}