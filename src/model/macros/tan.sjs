let tan = macro {
    rule { ($x) } => {
        (function() {
            return Math.tan($x);
        })()
    }

    rule { ($x:expr) } => {
        (function() {
            return Math.tan($x);
        })()
    }
}