operator (_add_) 12 left { $l, $r } => #{ zip($l, $r, add) }
operator (_subtract_) 12 left { $l, $r } => #{ zip($l, $r, subtract) }
operator (_multiply_) 14 left { $l, $r } => #{ zip($l, $r, multiply) }
operator (_divide_) 14 left { $l, $r } => #{ zip($l, $r, divide) }
operator (_modulo_) 14 left { $l, $r } => #{ zip($l, $r, modulo) }

operator (_subtract_) 14 { $u } => #{ -$u }
