let __quantifier__ = macro {
    rule {
        ($element:ident, $input:expr, $map:expr, $fold:expr)
    } => {
        (function() {
            var input = $input;

            var mapResult = map(input, function($element) {
                return $map;
            });

            return foldl(mapResult, $fold);
        })()
    }
}
