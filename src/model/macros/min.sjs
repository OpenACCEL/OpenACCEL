let min = macro {
    rule { ($x (,) ...) } => {
        (function() {
            return Math.min($x (,) ...);
        })()
    }

    rule { ($x:expr (,) ...) } => {
        (function() {
            return Math.min($x (,) ...);
        })()
    }
}