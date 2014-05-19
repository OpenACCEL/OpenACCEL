let floor = macro {
    rule { ($x) } => {
        (function() {
            return Math.floor($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.floor($x);
        })()
    }
}