let max = macro {
    rule { ($x (,) ...) } => {
        (function() {
            return Math.max($x (,) ...);
        })()
    }

    rule { ($x:expr (,) ...) } => {
        (function() {
            return Math.max($x (,) ...);
        })()
    }
}