operator (_+_) 12 left { $l, $r } => #{ zip($l, $r, add) }
operator (_-_) 12 left { $l, $r } => #{ zip($l, $r, subtract) }
operator (_*_) 14 left { $l, $r } => #{ zip($l, $r, multiply) }
operator (_/_) 14 left { $l, $r } => #{ zip($l, $r, divide) }
operator (_%_) 14 left { $l, $r } => #{ zip($l, $r, modulo) }

operator (_-_) 14 { $u } => #{ -$u }
