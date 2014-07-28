/* ========================= EVDecomposition ==========================

Description: Javascript routines to find the eigenvalues and
eigenvectors of a matrix.
Acknowledgement: This Javascript code is based on the source code of
JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
which states "Copyright Notice This software is a cooperative product
of The MathWorks and the National Institute of Standards and
Technology (NIST) which has been released to the public domain.
Neither The MathWorks nor NIST assumes any responsibility whatsoever
for its use by other parties, and makes no guarantees, expressed
or implied, about its quality, reliability, or any other
characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
copyright Peter Coxhead, 2008, and is released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
 */
var version = 'EVDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EV Decomposition (from the JAMA package)

Eigenvalues and eigenvectors of a real matrix.

If A is symmetric, then A = V*L*V' where the eigenvalue matrix L is
diagonal and the eigenvector matrix V is orthogonal (i.e. V*V' = I).

If A is not symmetric, then the eigenvalue matrix L is block diagonal
with the real eigenvalues in 1-by-1 blocks and any complex eigenvalues,
lambda + i*mu, in 2-by-2 blocks, [lambda, mu; -mu, lambda].  The
columns of V represent the eigenvectors in the sense that A*V = V*L.
The matrix V may be badly conditioned, or even singular, so the validity
of the equation A = V*L*inverse(V) depends upon cond(V). **NB** this
test has not yet been implemented in these Javascript routines!

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EVDecomposition.create(mo): given a Matrix object mo, it
returns an EVDecomposition object which contains the eigenvectors
and eigenvalues of the matrix. The fields of an EVDecomposition
object are:
V    the columnwise eigenvectors as a Matrix object
lr   the real part of the eigenvalues as an array
li   the imaginary part of the eigenvalues as an array
L    the block diagonal eigenvalue matrix as a Matrix object
isSymmetric   whether the matrix is symmetric or not (boolean)

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, Matrix.js and LUDecomposition.js.)

with (Matrix){ var A = create([[1,3,5],[2,8,1],[0,6,5]]);
writeln('A');
display(A,0);

var evd = EVDecomposition.create(A);

nl(); writeln('V (eigenvectors for A)');
display(evd.V);

nl(); writeln('L (block diagonal eigenvalue matrix for A)');
display(evd.L);
writeln('Note that the second two eigenvalues are complex: 1.632 + 1.816i and 1.632 - 1.816i.');

nl(); writeln('A*V - V*L');
display(sub(mult(A,evd.V),mult(evd.V,evd.L)));

nl(); writeln('A - V*L*inverse(V)');
display(sub(A,mult(evd.V,mult(evd.L,inverse(evd.V)))));
}

 */

var EVDecomposition = new createEVDecompositionPackage();
function createEVDecompositionPackage() {
	this.version = version;
	
	var abs = Math.abs; // local synonym
	var sqrt = Math.sqrt; // local synonym
	var max = Math.max; // local synonym
	var min = Math.min; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Utility function to find sqrt(a^2 + b^2) reliably
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _hypot(a, b) {
		var r;
		var aa = abs(a);
		var bb = abs(b);
		if (aa > bb) {
			r = b / a;
			r = aa * sqrt(1 + r * r);
		} else if (b != 0) {
			r = a / b;
			r = bb * sqrt(1 + r * r);
		} else
			r = 0.0;
		return r;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// 'Global' variables used to communicate between functions.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var n; // row and column dimension (square matrix)
	var isSymmetric; // whether matrix is symmetric
	var d;
	var e; // arrays for internal storage of eigenvalues
	var V; // array for internal storage of eigenvectors.
	var H; // array for internal storage of nonsymmetric Hessenberg form.
	var ort; // working storage for nonsymmetric algorithm.
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform the symmetric Householder reduction to
	// tridiagonal form.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _tred2() { //  This is derived from the Algol procedures tred2 by
		//  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
		//  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutine in EISPACK.
		
		for (var j = 0; j < n; j++) {
			d[j] = V[n - 1][j];
		}
		
		// Householder reduction to tridiagonal form.
		for (var i = n - 1; i > 0; i--) { // Scale to avoid under/overflow.
			var scale = 0.0;
			var h = 0.0;
			for (var k = 0; k < i; k++) {
				scale = scale + abs(d[k]);
			}
			if (scale == 0.0) {
				e[i] = d[i - 1];
				for (var j = 0; j < i; j++) {
					d[j] = V[i - 1][j];
					V[i][j] = 0.0;
					V[j][i] = 0.0;
				}
			} else { // Generate Householder vector.
				for (var k = 0; k < i; k++) {
					d[k] /= scale;
					h += d[k] * d[k];
				}
				var f = d[i - 1];
				var g = sqrt(h);
				if (f > 0) {
					g = -g;
				}
				e[i] = scale * g;
				h = h - f * g;
				d[i - 1] = f - g;
				for (var j = 0; j < i; j++) {
					e[j] = 0.0;
				}
				// Apply similarity transformation to remaining columns.
				for (var j = 0; j < i; j++) {
					f = d[j];
					V[j][i] = f;
					g = e[j] + V[j][j] * f;
					for (var k = j + 1; k <= i - 1; k++) {
						g += V[k][j] * d[k];
						e[k] += V[k][j] * f;
					}
					e[j] = g;
				}
				f = 0.0;
				for (var j = 0; j < i; j++) {
					e[j] /= h;
					f += e[j] * d[j];
				}
				var hh = f / (h + h);
				for (var j = 0; j < i; j++) {
					e[j] -= hh * d[j];
				}
				for (var j = 0; j < i; j++) {
					f = d[j];
					g = e[j];
					for (var k = j; k <= i - 1; k++) {
						V[k][j] -= (f * e[k] + g * d[k]);
					}
					d[j] = V[i - 1][j];
					V[i][j] = 0.0;
				}
			}
			d[i] = h;
		}
		// Accumulate transformations.
		for (var i = 0; i < n - 1; i++) {
			V[n - 1][i] = V[i][i];
			V[i][i] = 1.0;
			var h = d[i + 1];
			if (h != 0.0) {
				for (var k = 0; k <= i; k++) {
					d[k] = V[k][i + 1] / h;
				}
				for (var j = 0; j <= i; j++) {
					var g = 0.0;
					for (var k = 0; k <= i; k++) {
						g += V[k][i + 1] * V[k][j];
					}
					for (var k = 0; k <= i; k++) {
						V[k][j] -= g * d[k];
					}
				}
			}
			for (var k = 0; k <= i; k++) {
				V[k][i + 1] = 0.0;
			}
		}
		for (var j = 0; j < n; j++) {
			d[j] = V[n - 1][j];
			V[n - 1][j] = 0.0;
		}
		V[n - 1][n - 1] = 1.0;
		e[0] = 0.0;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform the symmetric tridiagonal QL algorithm.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _tql2() { //  This is derived from the Algol procedures tql2, by
		//  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
		//  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutine in EISPACK.
		var eps = 0.5 * Matrix.getEPS();
		
		for (var i = 1; i < n; i++) {
			e[i - 1] = e[i];
		}
		e[n - 1] = 0.0;
		
		var f = 0.0;
		var tst1 = 0.0;
		for (var l = 0; l < n; l++) { // Find small subdiagonal element
			tst1 = max(tst1, abs(d[l]) + abs(e[l]));
			var m = l;
			while (m < n) {
				if (abs(e[m]) <= eps * tst1) {
					break;
				}
				m++;
			}
			
			// If m == l, d[l] is an eigenvalue,
			// otherwise, iterate.
			if (m > l) {
				var iter = 0;
				do {
					iter = iter + 1; // (Could check iteration count here.)
					// Compute implicit shift
					var g = d[l];
					var p = (d[l + 1] - g) / (2.0 * e[l]);
					var r = _hypot(p, 1.0);
					if (p < 0) {
						r = -r;
					}
					d[l] = e[l] / (p + r);
					d[l + 1] = e[l] * (p + r);
					var dl1 = d[l + 1];
					var h = g - d[l];
					for (var i = l + 2; i < n; i++) {
						d[i] -= h;
					}
					f = f + h;
					
					// Implicit QL transformation.
					p = d[m];
					var c = 1.0;
					var c2 = c;
					var c3 = c;
					var el1 = e[l + 1];
					var s = 0.0;
					var s2 = 0.0;
					for (var i = m - 1; i >= l; i--) {
						c3 = c2;
						c2 = c;
						s2 = s;
						g = c * e[i];
						h = c * p;
						r = _hypot(p, e[i]);
						e[i + 1] = s * r;
						s = e[i] / r;
						c = p / r;
						p = c * d[i] - s * g;
						d[i + 1] = h + s * (c * g + s * d[i]);
						
						// Accumulate transformation.
						for (var k = 0; k < n; k++) {
							h = V[k][i + 1];
							V[k][i + 1] = s * V[k][i] + c * h;
							V[k][i] = c * V[k][i] - s * h;
						}
					}
					p = -s * s2 * c3 * el1 * e[l] / dl1;
					e[l] = s * p;
					d[l] = c * p;
					
				} while (abs(e[l]) > eps * tst1); // Check for convergence
			}
			d[l] = d[l] + f;
			e[l] = 0.0;
		}
		
		// Sort eigenvalues and corresponding vectors.
		for (var i = 0; i < n - 1; i++) {
			var k = i;
			var p = d[i];
			for (var j = i + 1; j < n; j++) {
				if (d[j] < p) {
					k = j;
					p = d[j];
				}
			}
			if (k != i) {
				d[k] = d[i];
				d[i] = p;
				for (var j = 0; j < n; j++) {
					p = V[j][i];
					V[j][i] = V[j][k];
					V[j][k] = p;
				}
			}
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform the nonsymmetric reduction to Hessenberg
	// form.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _orthes() { //  This is derived from the Algol procedures orthes and ortran,
		//  by Martin and Wilkinson, Handbook for Auto. Comp.,
		//  Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutines in EISPACK.
		
		var low = 0;
		var high = n - 1;
		
		for (var m = low + 1; m <= high - 1; m++) { // Scale column.
			var scale = 0.0;
			for (var i = m; i <= high; i++) {
				scale = scale + abs(H[i][m - 1]);
			}
			if (scale != 0.0) { // Compute Householder transformation.
				var h = 0.0;
				for (var i = high; i >= m; i--) {
					ort[i] = H[i][m - 1] / scale;
					h += ort[i] * ort[i];
				}
				var g = sqrt(h);
				if (ort[m] > 0) {
					g = -g;
				}
				h = h - ort[m] * g;
				ort[m] = ort[m] - g;
				
				// Apply Householder similarity transformation
				// H = (I-u*u'/h)*H*(I-u*u')/h)
				for (var j = m; j < n; j++) {
					var f = 0.0;
					for (var i = high; i >= m; i--) {
						f += ort[i] * H[i][j];
					}
					f = f / h;
					for (var i = m; i <= high; i++) {
						H[i][j] -= f * ort[i];
					}
				}
				for (var i = 0; i <= high; i++) {
					var f = 0.0;
					for (var j = high; j >= m; j--) {
						f += ort[j] * H[i][j];
					}
					f = f / h;
					for (var j = m; j <= high; j++) {
						H[i][j] -= f * ort[j];
					}
				}
				ort[m] = scale * ort[m];
				H[m][m - 1] = scale * g;
			}
		}
		
		// Accumulate transformations (Algol's ortran).
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				V[i][j] = (i == j ? 1.0 : 0.0);
			}
		}
		for (var m = high - 1; m >= low + 1; m--) {
			if (H[m][m - 1] != 0.0) {
				for (var i = m + 1; i <= high; i++) {
					ort[i] = H[i][m - 1];
				}
				for (var j = m; j <= high; j++) {
					var g = 0.0;
					for (var i = m; i <= high; i++) {
						g += ort[i] * V[i][j];
					}
					// Double division avoids possible underflow
					g = (g / ort[m]) / H[m][m - 1];
					for (var i = m; i <= high; i++) {
						V[i][j] += g * ort[i];
					}
				}
			}
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform complex scalar division.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _cdiv(xr, xi, yr, yi) {
		var cdivr,
		cdivi;
		var r,
		d;
		if (abs(yr) > abs(yi)) {
			r = yi / yr;
			d = yr + r * yi;
			cdivr = (xr + r * xi) / d;
			cdivi = (xi - r * xr) / d;
		} else {
			r = yr / yi;
			d = yi + r * yr;
			cdivr = (r * xr + xi) / d;
			cdivi = (r * xi - xr) / d;
		}
		return {
			r : cdivr,
			i : cdivi
		};
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform nonsymmetric reduction from Hessenberg to
	// real Schur form.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _hqr2() { //  This is derived from the Algol procedure hqr2,
		//  by Martin and Wilkinson, Handbook for Auto. Comp.,
		//  Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutine in EISPACK.
		var eps = 0.5 * Matrix.getEPS();
		
		// Initialize
		var nn = n;
		var n1 = nn - 1;
		var low = 0;
		var high = nn - 1;
		var exshift = 0.0;
		var p = 0,
		q = 0,
		r = 0,
		s = 0,
		z = 0,
		t,
		w,
		x,
		y;
		
		// Store roots isolated by balanc and compute matrix norm
		
		var norm = 0.0;
		for (var i = 0; i < nn; i++) {
			if (i < low || i > high) {
				d[i] = H[i][i];
				e[i] = 0.0;
			}
			for (var j = max(i - 1, 0); j < nn; j++) {
				norm = norm + abs(H[i][j]);
			}
		}
		
		// Outer loop over eigenvalue index
		
		var iter = 0;
		while (n1 >= low) { // Look for single small sub-diagonal element
			var l = n1;
			while (l > low) {
				s = abs(H[l - 1][l - 1]) + abs(H[l][l]);
				if (s == 0.0) {
					s = norm;
				}
				if (abs(H[l][l - 1]) < eps * s) {
					break;
				}
				l--;
			}
			
			// Check for convergence
			// One root found
			if (l == n1) {
				H[n1][n1] = H[n1][n1] + exshift;
				d[n1] = H[n1][n1];
				e[n1] = 0.0;
				n1--;
				iter = 0;
			}
			// Two roots found
			else if (l == n1 - 1) {
				w = H[n1][n1 - 1] * H[n1 - 1][n1];
				p = (H[n1 - 1][n1 - 1] - H[n1][n1]) / 2.0;
				q = p * p + w;
				z = sqrt(abs(q));
				H[n1][n1] = H[n1][n1] + exshift;
				H[n1 - 1][n1 - 1] = H[n1 - 1][n1 - 1] + exshift;
				x = H[n1][n1];
				
				// Real pair
				if (q >= 0) {
					if (p >= 0) {
						z = p + z;
					} else {
						z = p - z;
					}
					d[n1 - 1] = x + z;
					d[n1] = d[n1 - 1];
					if (z != 0.0) {
						d[n1] = x - w / z;
					}
					e[n1 - 1] = 0.0;
					e[n1] = 0.0;
					x = H[n1][n1 - 1];
					s = abs(x) + abs(z);
					p = x / s;
					q = z / s;
					r = sqrt(p * p + q * q);
					p = p / r;
					q = q / r;
					
					// Row modification
					for (var j = n1 - 1; j < nn; j++) {
						z = H[n1 - 1][j];
						H[n1 - 1][j] = q * z + p * H[n1][j];
						H[n1][j] = q * H[n1][j] - p * z;
					}
					
					// Column modification
					for (var i = 0; i <= n1; i++) {
						z = H[i][n1 - 1];
						H[i][n1 - 1] = q * z + p * H[i][n1];
						H[i][n1] = q * H[i][n1] - p * z;
					}
					
					// Accumulate transformations
					for (var i = low; i <= high; i++) {
						z = V[i][n1 - 1];
						V[i][n1 - 1] = q * z + p * V[i][n1];
						V[i][n1] = q * V[i][n1] - p * z;
					}
				}
				// Complex pair
				else {
					d[n1 - 1] = x + p;
					d[n1] = x + p;
					e[n1 - 1] = z;
					e[n1] = -z;
				}
				n1 = n1 - 2;
				iter = 0;
			}
			// No convergence yet
			else {
				// Form shift
				x = H[n1][n1];
				y = 0.0;
				w = 0.0;
				if (l < n1) {
					y = H[n1 - 1][n1 - 1];
					w = H[n1][n1 - 1] * H[n1 - 1][n1];
				}
				
				// Wilkinson's original ad hoc shift
				if (iter == 10) {
					exshift += x;
					for (var i = low; i <= n1; i++) {
						H[i][i] -= x;
					}
					s = abs(H[n1][n1 - 1]) + abs(H[n1 - 1][n1 - 2]);
					x = y = 0.75 * s;
					w = -0.4375 * s * s;
				}
				
				// MATLAB's new ad hoc shift
				if (iter == 30) {
					s = (y - x) / 2.0;
					s = s * s + w;
					if (s > 0) {
						s = sqrt(s);
						if (y < x) {
							s = -s;
						}
						s = x - w / ((y - x) / 2.0 + s);
						for (var i = low; i <= n1; i++) {
							H[i][i] -= s;
						}
						exshift += s;
						x = y = w = 0.964;
					}
				}
				
				iter = iter + 1; // (Could check iteration count here.)
				
				// Look for two consecutive small sub-diagonal elements
				var m = n1 - 2;
				while (m >= l) {
					z = H[m][m];
					r = x - z;
					s = y - z;
					p = (r * s - w) / H[m + 1][m] + H[m][m + 1];
					q = H[m + 1][m + 1] - z - r - s;
					r = H[m + 2][m + 1];
					s = abs(p) + abs(q) + abs(r);
					p = p / s;
					q = q / s;
					r = r / s;
					if (m == l) {
						break;
					}
					if (abs(H[m][m - 1]) * (abs(q) + abs(r)) <
						eps * (abs(p) * (abs(H[m - 1][m - 1]) + abs(z) +
								abs(H[m + 1][m + 1])))) {
						break;
					}
					m--;
				}
				
				for (var i = m + 2; i <= n1; i++) {
					H[i][i - 2] = 0.0;
					if (i > m + 2) {
						H[i][i - 3] = 0.0;
					}
				}
				
				// Double QR step involving rows l:n1 and columns m:n1
				for (var k = m; k <= n1 - 1; k++) {
					var notlast = (k != n1 - 1);
					if (k != m) {
						p = H[k][k - 1];
						q = H[k + 1][k - 1];
						r = (notlast ? H[k + 2][k - 1] : 0.0);
						x = abs(p) + abs(q) + abs(r);
						if (x != 0.0) {
							p = p / x;
							q = q / x;
							r = r / x;
						}
					}
					if (x == 0.0) {
						break;
					}
					s = sqrt(p * p + q * q + r * r);
					if (p < 0) {
						s = -s;
					}
					if (s != 0) {
						if (k != m) {
							H[k][k - 1] = -s * x;
						} else if (l != m) {
							H[k][k - 1] = -H[k][k - 1];
						}
						p = p + s;
						x = p / s;
						y = q / s;
						z = r / s;
						q = q / p;
						r = r / p;
						
						// Row modification
						for (var j = k; j < nn; j++) {
							p = H[k][j] + q * H[k + 1][j];
							if (notlast) {
								p = p + r * H[k + 2][j];
								H[k + 2][j] = H[k + 2][j] - p * z;
							}
							H[k][j] = H[k][j] - p * x;
							H[k + 1][j] = H[k + 1][j] - p * y;
						}
						
						// Column modification
						for (var i = 0; i <= min(n1, k + 3); i++) {
							p = x * H[i][k] + y * H[i][k + 1];
							if (notlast) {
								p = p + z * H[i][k + 2];
								H[i][k + 2] = H[i][k + 2] - p * r;
							}
							H[i][k] = H[i][k] - p;
							H[i][k + 1] = H[i][k + 1] - p * q;
						}
						
						// Accumulate transformations
						for (var i = low; i <= high; i++) {
							p = x * V[i][k] + y * V[i][k + 1];
							if (notlast) {
								p = p + z * V[i][k + 2];
								V[i][k + 2] = V[i][k + 2] - p * r;
							}
							V[i][k] = V[i][k] - p;
							V[i][k + 1] = V[i][k + 1] - p * q;
						}
					} // (s != 0)
				} // k loop
			} // check convergence
		} // while (n >= low)
		
		// Backsubstitute to find vectors of upper triangular form
		if (norm == 0.0) {
			return;
		}
		
		for (n1 = nn - 1; n1 >= 0; n1--) {
			p = d[n1];
			q = e[n1];
			
			// Real vector
			if (q == 0) {
				var l = n1;
				H[n1][n1] = 1.0;
				for (var i = n1 - 1; i >= 0; i--) {
					w = H[i][i] - p;
					r = 0.0;
					for (var j = l; j <= n1; j++) {
						r = r + H[i][j] * H[j][n1];
					}
					if (e[i] < 0.0) {
						z = w;
						s = r;
					} else {
						l = i;
						if (e[i] == 0.0) {
							if (w != 0.0) {
								H[i][n1] = -r / w;
							} else {
								H[i][n1] = -r / (eps * norm);
							}
							
						}
						// Solve real equations
						else {
							x = H[i][i + 1];
							y = H[i + 1][i];
							q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
							t = (x * s - z * r) / q;
							H[i][n1] = t;
							if (abs(x) > abs(z)) {
								H[i + 1][n1] = (-r - w * t) / x;
							} else {
								H[i + 1][n1] = (-s - y * t) / z;
							}
						}
						
						// Overflow control
						t = abs(H[i][n1]);
						if ((eps * t) * t > 1) {
							for (var j = i; j <= n1; j++) {
								H[j][n1] = H[j][n1] / t;
							}
						}
					}
				}
				
			}
			// Complex vector
			else if (q < 0) {
				var l = n1 - 1;
				
				// Last vector component imaginary so matrix is triangular
				if (abs(H[n1][n1 - 1]) > abs(H[n1 - 1][n1])) {
					H[n1 - 1][n1 - 1] = q / H[n1][n1 - 1];
					H[n1 - 1][n1] =  - (H[n1][n1] - p) / H[n1][n1 - 1];
				} else {
					var cd = _cdiv(0.0, -H[n1 - 1][n1], H[n1 - 1][n1 - 1] - p, q);
					H[n1 - 1][n1 - 1] = cd.r;
					H[n1 - 1][n1] = cd.i;
				}
				H[n1][n1 - 1] = 0.0;
				H[n1][n1] = 1.0;
				for (var i = n1 - 2; i >= 0; i--) {
					var ra,
					sa,
					vr,
					vi;
					ra = 0.0;
					sa = 0.0;
					for (var j = l; j <= n1; j++) {
						ra = ra + H[i][j] * H[j][n1 - 1];
						sa = sa + H[i][j] * H[j][n1];
					}
					w = H[i][i] - p;
					
					if (e[i] < 0.0) {
						z = w;
						r = ra;
						s = sa;
					} else {
						l = i;
						if (e[i] == 0) {
							var cd = _cdiv(-ra, -sa, w, q);
							H[i][n1 - 1] = cd.r;
							H[i][n1] = cd.i;
						} else {
							// Solve complex equations
							x = H[i][i + 1];
							y = H[i + 1][i];
							vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
							vi = (d[i] - p) * 2.0 * q;
							if (vr == 0.0 && vi == 0.0) {
								vr = eps * norm * (abs(w) + abs(q) +
										abs(x) + abs(y) + abs(z));
							}
							var cd = _cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
							H[i][n1 - 1] = cd.r;
							H[i][n1] = cd.i;
							if (abs(x) > (abs(z) + abs(q))) {
								H[i + 1][n1 - 1] = (-ra - w * H[i][n1 - 1] + q * H[i][n1]) / x;
								H[i + 1][n1] = (-sa - w * H[i][n1] - q * H[i][n1 - 1]) / x;
							} else {
								var cd = _cdiv(-r - y * H[i][n1 - 1], -s - y * H[i][n1], z, q);
								H[i + 1][n1 - 1] = cd.r;
								H[i + 1][n1] = cd.i;
							}
						}
						
						// Overflow control
						t = max(abs(H[i][n1 - 1]), abs(H[i][n1]));
						if ((eps * t) * t > 1) {
							for (var j = i; j <= n1; j++) {
								H[j][n1 - 1] = H[j][n1 - 1] / t;
								H[j][n1] = H[j][n1] / t;
							}
						}
					}
				}
			}
		}
		
		// Vectors of isolated roots
		for (var i = 0; i < nn; i++) {
			if (i < low || i > high) {
				for (var j = i; j < nn; j++) {
					V[i][j] = H[i][j];
				}
			}
		}
		
		// Back transformation to get eigenvectors of original matrix
		for (var j = nn - 1; j >= low; j--) {
			for (var i = low; i <= high; i++) {
				z = 0.0;
				for (var k = low; k <= min(j, high); k++) {
					z = z + V[i][k] * H[k][j];
				}
				V[i][j] = z;
			}
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to create the block diagonal eigenvalue matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _getL() {
		var X = Matrix.create(n, n);
		var L = X.mat;
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++)
				L[i][j] = 0.0;
			L[i][i] = d[i];
			if (e[i] > 0)
				L[i][i + 1] = e[i];
			else if (e[i] < 0)
				L[i][i - 1] = e[i];
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// EVDecomposition.create(mo): given a matrix as a Matrix object mo, it
	//   returns an EVDecomposition object which contains the eigenvectors
	//   and eigenvalues of the matrix. The fields of an EVDecomposition
	//   object are:
	//   V   the columnwise eigenvectors as a Matrix object
	//   lr  the real part of the eigenvalues as an array
	//   li  the imaginary part of the eigenvalues as an array
	//   L   the block diagonal eigenvalue matrix as a Matrix object
	//   isSymmetric  whether the matrix is symmetric or not (boolean)
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (mo) {
		var A = mo.mat;
		n = mo.n;
		V = new Array(n);
		for (var i = 0; i < n; i++)
			V[i] = new Array(n);
		d = new Array(n);
		e = new Array(n);
		
		// is the matrix symmetric?
		isSymmetric = true;
		for (var j = 0; (j < n) && isSymmetric; j++) {
			for (var i = 0; (i < n) && isSymmetric; i++) {
				isSymmetric = (A[i][j] == A[j][i]);
			}
		}
		
		// process the matrix
		if (isSymmetric) { // process a symmetric matrix
			for (var i = 0; i < n; i++) {
				for (var j = 0; j < n; j++)
					V[i][j] = A[i][j];
			}
			// Tridiagonalize.
			_tred2();
			// Diagonalize.
			_tql2();
		} else { // process an unsymmetic matrix
			H = new Array(n);
			for (var i = 0; i < n; i++)
				H[i] = new Array(n);
			ort = new Array(n);
			for (var j = 0; j < n; j++) {
				for (var i = 0; i < n; i++)
					H[i][j] = A[i][j];
			}
			// Reduce to Hessenberg form.
			_orthes();
			// Reduce Hessenberg to real Schur form.
			_hqr2();
		}
		
		// reduce small values in d & e to 0 (added by PC)
		var eps = Matrix.getEPS();
		for (var i = 0; i < n; i++) {
			if (abs(d[i]) < eps)
				d[i] = 0;
			if (abs(e[i]) < eps)
				e[i] = 0;
		}
		
		// Sort d, e and L by the size of real part of eigenvalue
		// with 0's at the end.  Care is needed not to re-order pairs of complex
		// eigenvalues.                      (added by PC)
		var last = 0;
		for (var i = 0; i < n - 1; i++) {
			var dMax = d[i];
			var iMax = i;
			for (var j = i + 1; j < n; j++) {
				var swapNeeded = false;
				if (d[j] != 0) {
					if (dMax == 0)
						swapNeeded = true;
					else {
						var diff = d[j] - dMax;
						if (diff > eps)
							swapNeeded = true;
						else if (abs(diff) < eps)
							swapNeeded = e[j] > e[iMax];
					}
				}
				if (swapNeeded) {
					dMax = d[j];
					iMax = j;
				}
			}
			if (i != iMax) {
				var temp = d[i];
				d[i] = d[iMax];
				d[iMax] = temp;
				temp = e[i];
				e[i] = e[iMax];
				e[iMax] = temp;
				for (var j = 0; j < n; j++) {
					temp = V[j][i];
					V[j][i] = V[j][iMax];
					V[j][iMax] = temp;
				}
			}
			if (d[i] != 0 || e[i] != 0)
				last = i;
		}
		if (d[n - 1] != 0 || e[n - 1] != 0)
			last = n - 1;
		
		// create an object to return the results
		var evd = new Object();
		evd.V = Matrix.create(V);
		evd.lr = d;
		evd.li = e;
		evd.L = _getL(); // create the block diagonal eigenvalue matrix
		evd.isSymmetric = isSymmetric;
		evd.isEVDecomposition = true;
		return evd;
	}
	
}
/* ========================= LUDecomposition ==========================

Description: Javascript routines to decompose a matrix A into a lower
and an upper triangular matrix, L and U, so that L*U = A (possibly
with its rows re-ordered).  Stored as methods of the global variable
LUDecomposition.
Acknowledgement: This Javascript code is based on the source code of
JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
which states "Copyright Notice This software is a cooperative product
of The MathWorks and the National Institute of Standards and
Technology (NIST) which has been released to the public domain.
Neither The MathWorks nor NIST assumes any responsibility whatsoever
for its use by other parties, and makes no guarantees, expressed
or implied, about its quality, reliability, or any other
characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
copyright Peter Coxhead, 2008, and is released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
 */
var version = 'LUDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

LU Decomposition (from the JAMA package)

For an m-by-n matrix A with m >= n, the LU decomposition is an m-by-n
unit lower triangular matrix L, an n-by-n upper triangular matrix U,
and a permutation vector piv of length m so that A(piv,:) = L*U.
If m < n, then L is m-by-m and U is m-by-n.

The LU decomposition with pivoting always exists, even if the matrix is
singular, so the constructor will never fail.  The primary use of the
LU decomposition is in the solution of square systems of simultaneous
linear equations.  This will fail if isNonsingular() returns false.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 ***NOTE*** The functions in LUDecomposition.js should NOT normally be
used directly.  Their main use to provide 'services' to the functions
in Matrix.js.

LUDecomposition.create(mo): given a Matrix object mo, it returns an
object from which L, U and piv can be accessed.

LUDecomposition.restore(mo,lud): returns a new Matrix object comprised
of the rows of the Matrix object mo restored to the order given in
the pivot of the LUDecomposition object lud.

LUDecomposition.isNonsingular(lud): given an LUDecomposition object lud, it
determines whether the matrix from which it was derived is singular or
not. The value of Matrix.getEPS() is used as the smallest non-zero
number.

LUDecomposition.getL(lud): given an LUDecomposition object lud, it creates
and returns the lower triangular factor, L, as a Matrix object.
LUDecomposition.getU(lud): given an LUDecomposition object lud, it creates
and returns the upper triangular factor, U, as a Matrix object.

LUDecomposition.det(lud): given an LUDecomposition object lud, it returns
the determinant of the matrix from which it was derived. The value of
Matrix.getEPS() is used as the smallest non-zero number.

LUDecomposition.solve(lud,bmat): if the LUDecomposition object lud is derived
from the matrix A, and the Matrix object bmat represents the matrix b, then
this function solves the matrix equation A*x = b, returning x as a Matrix
object.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
var LUDecomposition = new createLUDecompositionPackage();
function createLUDecompositionPackage() {
	this.version = version;
	
	var abs = Math.abs; // local synonym
	var min = Math.min; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, argno, arg) {
		if (!arg.isMatrix) {
      dealWithError( '***ERROR: in LUDecomposition.' + fname + ': argument ' + argno +
				' is not a Matrix.');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is an LUDecomposition object
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkLUDecomposition(fname, argno, arg) {
		if (!arg.isLUDecomposition) {
      dealWithError( '***ERROR: in LUDecomposition.' + fname + ': argument ' + argno +
				' is not an LUDecomposition.');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.create(mo): given a Matrix object mo, it returns an
	//   object from which L, U and piv can be accessed.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (mo) {
		_chkMatrix('create', 1, mo);
		var m; // row dimension
		var n; // col dimension
		// Use a "left-looking", dot-product, Crout/Doolittle algorithm.
		var matLU = Matrix.create(mo.mat);
		var LU = matLU.mat;
		m = mo.m;
		n = mo.n;
		var piv = new Array();
		for (var i = 0; i < m; i++)
			piv[i] = i;
		var pivsign = 1;
		var LUrowi;
		var LUcolj = new Array(m);
		// outer loop
		for (var j = 0; j < n; j++) { // make a copy of the j-th column to localize references
			for (var i = 0; i < m; i++)
				LUcolj[i] = LU[i][j];
			// apply previous transformations
			for (var i = 0; i < m; i++) {
				LUrowi = LU[i];
				// most of the time is spent in the following dot product
				var kmax = min(i, j);
				var s = 0.0;
				for (var k = 0; k < kmax; k++)
					s += LUrowi[k] * LUcolj[k];
				LUrowi[j] = LUcolj[i] -= s;
			}
			// find pivot and exchange if necessary.
			var p = j;
			for (var i = j + 1; i < m; i++) {
				if (abs(LUcolj[i]) > abs(LUcolj[p]))
					p = i;
			}
			if (p != j) {
				for (var k = 0; k < n; k++) {
					var t = LU[p][k];
					LU[p][k] = LU[j][k];
					LU[j][k] = t;
				}
				var k = piv[p];
				piv[p] = piv[j];
				piv[j] = k;
				pivsign = -pivsign;
			}
			// compute multipliers
			if (j < m && LU[j][j] != 0.0) {
				for (var i = j + 1; i < m; i++)
					LU[i][j] /= LU[j][j];
			}
		}
		// now create and return the object with the results
		var lud = new Object();
		lud.LU = LU;
		lud.m = m;
		lud.n = n;
		lud.pivsign = pivsign;
		lud.piv = piv;
		lud.isLUDecomposition = true;
		return lud;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.restore(mo,lud): returns a new Matrix object comprised
	//   of the rows of the Matrix object mo restored to the order given in the
	//   pivot of the LUDecomposition object lud.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.restore = function (mo, lud) {
		_chkMatrix('restore', 1, mo);
		_chkLUDecomposition('restore', 2, lud);
		var res = Matrix.create(mo.m, mo.n);
		var r = lud.piv;
		for (var i = 0; i < mo.m; i++)
			for (var j = 0; j < mo.n; j++)
				res.mat[r[i]][j] = mo.mat[i][j];
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//LUDecomposition.isNonsingular(lud): given an LUDecomposition object lud, it
	//  determines whether the matrix from which it was derived is singular or
	//  not. The value of Matrix.getEPS() is used as the smallest non-zero
	//  number.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.isNonsingular = function (lud) {
		_chkLUDecomposition('isNonsingular', 1, lud);
		var eps = Matrix.getEPS();
		with (lud) {
			for (var j = 0; j < n; j++) {
				if (abs(LU[j][j]) < eps)
					return false;
			}
		}
		return true;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.getL(lud): given an LUDecomposition object lud, it creates
	//   and returns the lower triangular factor, L, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getL = function (lud) {
		_chkLUDecomposition('getL', 1, lud);
		var xm = lud.m;
		var xn = (lud.m >= lud.n) ? lud.n : lud.m;
		var X = Matrix.create(xm, xn);
		var L = X.mat;
		with (lud) {
			for (var i = 0; i < xm; i++) {
				for (var j = 0; j < xn; j++) {
					if (i > j)
						L[i][j] = LU[i][j];
					else if (i == j)
						L[i][j] = 1.0;
					else
						L[i][j] = 0.0;
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.getU(lud): given an LUDecomposition object lud, it creates
	//   and returns the upper triangular factor, U, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getU = function (lud) {
		_chkLUDecomposition('getU', 1, lud);
		var xm = (lud.m >= lud.n) ? lud.n : lud.m;
		var xn = lud.n;
		var X = Matrix.create(xm, xn);
		var U = X.mat;
		with (lud) {
			for (var i = 0; i < xm; i++) {
				for (var j = 0; j < xn; j++) {
					if (i <= j)
						U[i][j] = LU[i][j];
					else
						U[i][j] = 0.0;
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.det(lud): given an LUDecomposition object lud, it
	//   returns the determinant of the matrix from which it was derived. The
	//   value of Matrix.getEPS() is used as the smallest non-zero number.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.det = function (lud) {
		_chkLUDecomposition('det', 1, lud);
		var eps = Matrix.getEPS();
		if (lud.m != lud.n) {
      idealwithError( '***ERROR: in LUDecomposition.det: argument 1 is not square.');
		}
		var d = lud.pivsign;
		with (lud) {
			for (var j = 0; j < n; j++) {
				var val = LU[j][j];
				d *= LU[j][j];
				if (abs(d) < eps)
					return 0;
			}
		}
		return d;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _arrange(mo,r): a private function which returns a new Matrix object
	//  comprisedof the rows of the Matrix object mo arranged according to
	//  the values in the array r.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _arrange(mo, r) {
		with (mo) {
			var res = Matrix.create(m, n);
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					res.mat[i][j] = mat[r[i]][j];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.solve(lud,bmat): if the LUDecomposition object lud is
	//   derived from the matrix A, and the Matrix object bmat represents the
	//   matrix b, then this function solves the matrix equation A*x = b,
	//   returning x as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (lud, bmat) {
		_chkMatrix('solve', 2, bmat);
		_chkLUDecomposition('solve', 1, lud);
		if (bmat.m != lud.m) {
      dealWithError( '***ERROR: in LUDecomposition.solve: matrix row dimensions do not agree.');
		}
		if (!this.isNonsingular(lud)) {
      dealWithError( '***ERROR: in LUDecomposition.solve: matrix is singular.');
		}
		// copy right hand side with pivoting
		var nx = bmat.n;
		var Xmat = _arrange(bmat, lud.piv);
		var X = Xmat.mat;
		// solve L*Y = B(piv,:)
		with (lud) {
			for (var k = 0; k < n; k++) {
				for (var i = k + 1; i < n; i++) {
					for (var j = 0; j < nx; j++) {
						X[i][j] -= X[k][j] * LU[i][k];
					}
				}
			}
			// solve U*X = Y
			for (var k = n - 1; k >= 0; k--) {
				for (var j = 0; j < nx; j++) {
					X[k][j] /= LU[k][k];
				}
				for (var i = 0; i < k; i++) {
					for (var j = 0; j < nx; j++) {
						X[i][j] -= X[k][j] * LU[i][k];
					}
				}
			}
		}
		return Xmat;
	}
	
}
/* ========================= QRDecomposition ==========================

Description: Javascript routines to decompose a matrix A into an
orthogonal matrix Q and an upper triangular matrix R so that Q*R = A.
Stored as methods of the global variable QRDecomposition.
Acknowledgement: This Javascript code is based on the source code of
JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
which states "Copyright Notice This software is a cooperative product
of The MathWorks and the National Institute of Standards and
Technology (NIST) which has been released to the public domain.
Neither The MathWorks nor NIST assumes any responsibility whatsoever
for its use by other parties, and makes no guarantees, expressed
or implied, about its quality, reliability, or any other
characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
copyright Peter Coxhead, 2008, and is released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
 */
var version = 'QRDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

QR Decomposition (from the JAMA package)

For an m-by-n matrix A with m >= n, the QR decomposition is an m-by-n
orthogonal matrix Q and an n-by-n upper triangular matrix R so that
A = Q*R.

The QR decompostion always exists, even if the matrix does not have
full rank, so the constructor will never fail.  The primary use of the
QR decomposition is in the least squares solution of nonsquare systems
of simultaneous linear equations.  This will fail if isFullRank(qrd)
returns false for the QRDecomposition object qrd.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 ***NOTE*** The functions in QRDecomposition.js should NOT normally be
used directly.  Their main use to provide 'services' to the functions
in Matrix.js.

QRDecomposition.create(mo): given a Matrix object mo, it returns an
object from which Q and R can be accessed.

QRDecomposition.isFullRank(qrd): given an QRDecomposition object qrd, it
determines whether the matrix from which it was derived is of full
rank or not. The constant Matrix.EPS is used as the smallest non-zero
number.

QRDecomposition.getH(qrd): given an QRDecomposition object qrd, it
creates and returns the Householder vectors, H, as a Matrix object.
QRDecomposition.getR(qrd): given an QRDecomposition object qrd, it creates
and returns the upper triangular factor, R, as a Matrix object.
QRDecomposition.getQ(qrd): given an QRDecomposition object qrd, it creates
and returns the orthogonal factor, Q, as a Matrix object.

QRDecomposition.solve(qrd,B): if the QRDecomposition object qrd is
derived from the matrix A, and the Matrix object B represents the matrix
B, then this function returns the least squares solution to A*X = B,
returning x as a Matrix object.
B must have as many rows as A but may have any number of columns.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

var QRDecomposition = new createQRDecompositionPackage();
function createQRDecompositionPackage() {
	this.version = version;
	
	var abs = Math.abs; // local synonym
	var sqrt = Math.sqrt; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is a Matrix object
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, argno, arg) {
		if (!(arg instanceof Object && arg.isMatrix)) {
      dealWithError( '***ERROR: in QRDecomposition.' + fname + ': argument ' + argno +
			' is not a 2D matrix (Matrix).');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is a QRDecomposition object
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkQRDecomposition(fname, argno, arg) {
		if (!(arg instanceof Object && arg.isQRDecomposition)) {
      dealWithError( '***ERROR: in QRDecomposition.' + fname + ': argument ' + argno +
			' is not an QRDecomposition.');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to find sqrt(a^2 + b^2) reliably
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _hypot(a, b) {
		var r;
		if (abs(a) > abs(b)) {
			r = b / a;
			r = abs(a) * sqrt(1 + r * r);
		} else if (b != 0) {
			r = a / b;
			r = abs(b) * sqrt(1 + r * r);
		} else {
			r = 0.0;
		}
		return r;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.create(mo): given a Matrix object mo, it returns an
	//   object from which Q and R can be accessed.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (mo) {
		_chkMatrix('create', 1, mo);
		var eps = Matrix.getEPS();
		if (mo.m < mo.n) {
      dealWithError( '***ERROR: in QRDecomposition.create: matrix has fewer rows than columns.');
		}
		// initialize
		var QR = (Matrix.create(mo.mat)).mat;
		var m = mo.m;
		var n = mo.n;
		var Rdiag = new Array(n);
		// main loop
		for (var k = 0; k < n; k++) { // compute 2-norm of k-th column without under/overflow.
			var nrm = 0;
			for (var i = k; i < m; i++) {
				nrm = _hypot(nrm, QR[i][k]);
			}
			if (abs(nrm) > eps) { // Form k-th Householder vector.
				if (QR[k][k] < 0) {
					nrm = -nrm;
				}
				for (var i = k; i < m; i++) {
					QR[i][k] /= nrm;
				}
				QR[k][k] += 1.0;
				// apply transformation to remaining columns
				for (var j = k + 1; j < n; j++) {
					var s = 0.0;
					for (var i = k; i < m; i++) {
						s += QR[i][k] * QR[i][j];
					}
					s = -s / QR[k][k];
					for (var i = k; i < m; i++) {
						QR[i][j] += s * QR[i][k];
					}
				}
			}
			Rdiag[k] = -nrm;
		}
		var qrd = new Object();
		qrd.QR = QR; // array for internal storage of decomposition.
		qrd.m = m; // row dimension
		qrd.n = n; // col dimension
		qrd.Rdiag = Rdiag; // array for internal storage of diagonal of R
		qrd.isQRDecomposition = true;
		return qrd;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.isFullRank(qrd): given an QRDecomposition object qrd,
	//   it determines whether the matrix from which it was derived is of full
	//   rank or not. The constant eps is used as the smallest non-zero
	//   number.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.isFullRank = function (qrd) {
		_chkQRDecomposition('isFullRank', 1, qrd);
		var eps = Matrix.getEPS();
		with (qrd) {
			for (var j = 0; j < n; j++) {
				if (abs(Rdiag[j]) < eps)
					return false;
			}
			return true;
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.getH(qrd): given an QRDecomposition object qrd, it
	//   creates and returns the Householder vectors, H, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getH = function (qrd) {
		_chkQRDecomposition('getH', 1, qrd);
		with (qrd) {
			var X = Matrix.create(m, n);
			var H = X.mat;
			for (var i = 0; i < m; i++) {
				for (var j = 0; j < n; j++) {
					if (i >= j) {
						H[i][j] = QR[i][j];
					} else {
						H[i][j] = 0.0;
					}
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.getR(qrd): given an QRDecomposition object qrd, it
	//   creates and returns the upper triangular factor, R, as a Matrix
	//   object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getR = function (qrd) {
		_chkQRDecomposition('getR', 1, qrd);
		with (qrd) {
			var X = Matrix.create(n, n);
			var R = X.mat;
			for (var i = 0; i < n; i++) {
				for (var j = 0; j < n; j++) {
					if (i < j)
						R[i][j] = QR[i][j];
					else if (i == j)
						R[i][j] = Rdiag[i];
					else
						R[i][j] = 0.0;
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.getQ(qrd): given an QRDecomposition object qrd, it
	//   creates and returns the orthogonal factor, Q, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getQ = function (qrd) {
		_chkQRDecomposition('getQ', 1, qrd);
		with (qrd) {
			var X = Matrix.create(m, n);
			var Q = X.mat;
			for (var k = n - 1; k >= 0; k--) {
				for (var i = 0; i < m; i++)
					Q[i][k] = 0.0;
				Q[k][k] = 1.0;
				for (var j = k; j < n; j++) {
					if (QR[k][k] != 0) {
						var s = 0.0;
						for (var i = k; i < m; i++) {
							s += QR[i][k] * Q[i][j];
						}
						s = -s / QR[k][k];
						for (var i = k; i < m; i++) {
							Q[i][j] += s * QR[i][k];
						}
					}
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.solve(qrd,B): if the QRDecomposition object qrd is
	//   derived from the matrix A, and the Matrix object B represents the
	//   matrix B, then this function returns the least squares solution to
	//   A*X = B, returning x as a Matrix object.
	//   B must have as many rows as A but may have any number of columns.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (qrd, B) {
		_chkQRDecomposition('solve', 1, qrd);
		_chkMatrix('solve', 2, B);
		with (qrd) {
			if (B.m != m) {
        dealWithError( '***ERROR: in QRDecomposition.solve: matrix row dimensions don\'t agree.');
			}
			if (!QRDecomposition.isFullRank(qrd)) {
        dealWithError( '***ERROR: in QRDecomposition.solve: matrix is rank deficient.');
			}
			// copy right hand side
			var nx = B.n;
			var Xm = Matrix.create(B.mat);
			var X = Xm.mat;
			// compute Y = transpose(Q)*B
			for (var k = 0; k < n; k++) {
				for (var j = 0; j < nx; j++) {
					var s = 0.0;
					for (var i = k; i < m; i++) {
						s += QR[i][k] * X[i][j];
					}
					s = -s / QR[k][k];
					for (var i = k; i < m; i++) {
						X[i][j] += s * QR[i][k];
					}
				}
			}
			// Solve R*X = Y;
			for (var k = n - 1; k >= 0; k--) {
				for (var j = 0; j < nx; j++) {
					X[k][j] /= Rdiag[k];
				}
				for (var i = 0; i < k; i++) {
					for (var j = 0; j < nx; j++) {
						X[i][j] -= X[k][j] * QR[i][k];
					}
				}
			}
			// only need the first n rows
			var resmat = new Array(n);
			for (var i = 0; i < n; i++) {
				resmat[i] = X[i];
			}
		}
		return Matrix.create(resmat);
	}
	
}
function abs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.abs);
}

function acos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.acos);
}

function add(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a + b;
    });
}

add.base = 0;
function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a && b;
    });
}

and.base = true;
/**
 * Converts an array to object
 * Recursive, but only if neccessary.
 * If the array is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Array} arr  array to convert
 * @return {Object}      converted object
 */
function arrayToObject(arr) {
    if (arr instanceof Array) {
        var obj = {}; // Initialize the object
        for (var key in arr) {
            // go through each element in the object
            // and add them to the array at the same key

            if (arr instanceof Array) {
                obj[key] = arrayToObject(arr[key]);
            } else {
                obj[key] = arr[key];
            }
        }
        return obj;
    } else {
        return arr;
    }
}
function asin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.asin);
}

function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (y instanceof Array) {
        // Recursive step, y is an array
        var result = [];
        for (var key in y) {
            result[key] = at(x, y[key]);
        }
        return result;
    } else {
        if (!isNaN(y)) {
            y = Math.round(y);
        }
        // Base: y is a scalar
        if (x instanceof Array) {
            if (x[y] === undefined) {
                return [];
            } else {
                return x[y];
            }
        } else {
            //If x is scalar we simply use x instead of x[y]
            return x;
        }
    }
}
function atan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.atan);
}

function atan2(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return Math.atan2(a, b);
    });
}
function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (b > a) {
            return 0;
        } else {
            return factorial(a) / (factorial(b) * factorial(a - b));
        }
    });
}
/**
 * 
 * Applies the given function on the given array. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array taking the role of the first input of the function
 * @param  {Array}   b        array taking the role of the second input of the function
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 *
 * @memberof Model.Library
 */
function binaryZip(a, b, func) {
    var isScalarA = !(a instanceof Array);
    var isScalarB = !(b instanceof Array);

    if (!isScalarA || !isScalarB) {
        // Recursive step, a or b is an array
        var result = [];
        var key;

        if (isScalarA) {
            // Case, a is a scalar, b is an array
            for (key in b) {
                result[key] = binaryZip(a, b[key], func);
            }
            return result;
        }
        if (isScalarB) {
            // Case, b is a scalar, a is an array
            for (key in a) {
                result[key] = binaryZip(a[key], b, func);
            }
            return result;
        }
        // Case, a and b are both arrays
        for (key in a) {
            if (b[key] !== undefined) {
                result[key] = binaryZip(a[key], b[key], func);
            }
        }
        return result;
    } else {
        // Base: a and b are both scalar
        return func(a, b);
    }
}
/**
 * Placeholder function for the button function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @return {Array}     Empty array
 */
function button() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'button' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [];
}

button.isTimeDependent = true;
function ceil(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.ceil);
}

/**
 * Placeholder function for the check function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @param  {Boolean} def default value of the checkbox
 * @return {Array}     Singleton array with def
 */
function check(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'check' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (typeof def === 'boolean') {
        return [def];
    } else {
        throw new Error('Argument of check must be true or false');
    }
}

check.isTimeDependent = true;
var MINURLDELAY = 1000;
// every call to a url is protected by a timer to prevent bandwith exhaustion: one URL shall not be called more frequently than
// once every MINURLDELAY millisec. Calls that occur more frequently will simply return the same value as the previous call
// to that URL. A URL, here, is interpreted as the part prior to the question mark. Indeed, a same host can be spammed by a
// high frequent series of calls each time with different parameters. We don't both the same host more often than
// once every MINURLDELY millisec. On the other hand, we ensure that the parameters of every call are different, so that
// browsers cannot cache results ,thereby hiding any changes in server-side state.
var putChanTimers = [];
var getChanTimers = [];
// entries in the array urlTimers are distinguished by the host. That is, all calls to the keyMap-url are scheduled via the same array urlTimers. For this
// reason, there should not be two or more calls to getUrl in one script. In case multiple in- or out channels are needed, we can use the keyMap server, but
// then we need to schedule them based on the key-name. For this reason, we have two extra arrays with timers.

var urlTimers = [];

var E = Math.E;

var PI = Math.PI;
function cos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.cos);
}

function cursorB() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.mouseButtonPressed;
}

cursorB.isTimeDependent = true;
function cursorX() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.mouseX;
}

cursorX.isTimeDependent = true;
function cursorY() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.mouseY;
}

cursorY.isTimeDependent = true;
function debug(c, v) {
    if (typeof c === "string") {
        if (v instanceof Array) {
            var val = '';
            if (v['return'] !== undefined) {
                for (var k in v) {
                    val = val.concat(k).concat(":").concat(JSON.stringify(v[k])).concat(",");
                }
                // TODO, write message to debug windo or something
                //console.log(c + ": " + val.substring(0, val.length - 1));
                return v['return'];
            } else {
                throw new Error("\nFor function debug(), the second argument must be a vector, which must contain an element named 'return'");
            }
        } else {
            throw new Error("\nFor function debug(), the second argument must be a vector, the first element of which is returned to the caller");
        }
    } else {
        throw new Error("\nFor function debug(), the first argument must be a string (= text to help identify the debug output)");
    }
}
function divide(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a / b;
    });
}
function __do__(code, args) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (typeof code === "string") {
        if (args instanceof Object) {
            for (var arg in args) {
                var target = new RegExp('_' + arg, "g");
                code = code.replace(target, JSON.stringify(args[arg]));
                try {
                    // this is to protect against all disasters like syntax errors in the script string code we can't foresee
                    var res = (new Function(code))();
                    return res;
                } catch (err) {
                    return 'ERROR';
                }
            }
        } else {
            throw new Error("\nFor function do(), second argument must be a vector");
  
        }
    } else {
        throw new Error("\nFor function do(), first argument must be a string (= a code fragment)");
    }
}
function equal(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a == b;
    });
}
function exp(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.exp);
}

function factorial(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, function(a) {

        var factNum = [
            1,
            1,
            2,
            6,
            24,
            120,
            720,
            5040,
            40320,
            362880,
            3628800,
            39916800,
            479001600,
            6227020800,
            87178291200,
            1307674368000,
            20922789888000,
            355687428096000,
            6402373705728000,
            121645100408832000,
            2432902008176640000,
            51090942171709440000,
            1124000727777607680000,
            25852016738884976640000,
            620448401733239439360000,
            15511210043330985984000000,
            403291461126605635584000000,
            10888869450418352160768000000,
            304888344611713860501504000000,
            8841761993739701954543616000000,
            265252859812191058636308480000000,
            8222838654177922817725562880000000,
            263130836933693530167218012160000000,
            8683317618811886495518194401280000000,
            295232799039604140847618609643520000000,
            10333147966386144929666651337523200000000,
            371993326789901217467999448150835200000000,
            13763753091226345046315979581580902400000000,
            523022617466601111760007224100074291200000000,
            20397882081197443358640281739902897356800000000,
            815915283247897734345611269596115894272000000000,
            33452526613163807108170062053440751665152000000000,
            1405006117752879898543142606244511569936384000000000,
            60415263063373835637355132068513997507264512000000000,
            2658271574788448768043625811014615890319638528000000000,
            119622220865480194561963161495657715064383733760000000000,
            5502622159812088949850305428800254892961651752960000000000,
            258623241511168180642964355153611979969197632389120000000000,
            12413915592536072670862289047373375038521486354677760000000000,
            608281864034267560872252163321295376887552831379210240000000000,
            30414093201713378043612608166064768844377641568960512000000000000,
            1551118753287382280224243016469303211063259720016986112000000000000,
            80658175170943878571660636856403766975289505440883277824000000000000,
            4274883284060025564298013753389399649690343788366813724672000000000000,
            230843697339241380472092742683027581083278564571807941132288000000000000,
            12696403353658275925965100847566516959580321051449436762275840000000000000,
            710998587804863451854045647463724949736497978881168458687447040000000000000,
            40526919504877216755680601905432322134980384796226602145184481280000000000000,
            2350561331282878571829474910515074683828862318181142924420699914240000000000000,
            138683118545689835737939019720389406345902876772687432540821294940160000000000000,
            8320987112741390144276341183223364380754172606361245952449277696409600000000000000,
            507580213877224798800856812176625227226004528988036003099405939480985600000000000000,
            31469973260387937525653122354950764088012280797258232192163168247821107200000000000000,
            1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000,
            126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000,
            8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000,
            544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000,
            36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000,
            2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000,
            171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000,
            11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000,
            850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000,
            61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000,
            4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000,
            330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000,
            24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000,
            1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000,
            145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000,
            11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000,
            894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000,
            71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000,
            5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000,
            475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000,
            39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000,
            3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000,
            281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000,
            24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000,
            2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000,
            185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000,
            16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000,
            1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000,
            135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000,
            12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000,
            1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000,
            108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000,
            10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000,
            991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000,
            96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000,
            9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000,
            933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000,
            93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
        ];

        if (a > 100 || a < 0) {
            throw new Error("The factorial of numbers less than 0 or greater than 100 are not supported.");
        } else {
            a = Math.round(a);
            return factNum[a];
        }
    });
}
function floor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.floor);
}

function foldl(a, func) {
    var result = func.base;
    if (a instanceof Array) {
        var length = a.length;
        for (var i = 0; i < length; i++) {
            result = func(result, a[i]);
        }
    } else {
        result = func(result, a);
    }
    return result;
}
/* ========================= EVDecomposition ==========================

Description: Javascript routines to find the eigenvalues and
eigenvectors of a matrix.
Acknowledgement: This Javascript code is based on the source code of
JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
which states "Copyright Notice This software is a cooperative product
of The MathWorks and the National Institute of Standards and
Technology (NIST) which has been released to the public domain.
Neither The MathWorks nor NIST assumes any responsibility whatsoever
for its use by other parties, and makes no guarantees, expressed
or implied, about its quality, reliability, or any other
characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
copyright Peter Coxhead, 2008, and is released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
 */
var version = 'EVDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EV Decomposition (from the JAMA package)

Eigenvalues and eigenvectors of a real matrix.

If A is symmetric, then A = V*L*V' where the eigenvalue matrix L is
diagonal and the eigenvector matrix V is orthogonal (i.e. V*V' = I).

If A is not symmetric, then the eigenvalue matrix L is block diagonal
with the real eigenvalues in 1-by-1 blocks and any complex eigenvalues,
lambda + i*mu, in 2-by-2 blocks, [lambda, mu; -mu, lambda].  The
columns of V represent the eigenvectors in the sense that A*V = V*L.
The matrix V may be badly conditioned, or even singular, so the validity
of the equation A = V*L*inverse(V) depends upon cond(V). **NB** this
test has not yet been implemented in these Javascript routines!

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

EVDecomposition.create(mo): given a Matrix object mo, it
returns an EVDecomposition object which contains the eigenvectors
and eigenvalues of the matrix. The fields of an EVDecomposition
object are:
V    the columnwise eigenvectors as a Matrix object
lr   the real part of the eigenvalues as an array
li   the imaginary part of the eigenvalues as an array
L    the block diagonal eigenvalue matrix as a Matrix object
isSymmetric   whether the matrix is symmetric or not (boolean)

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, Matrix.js and LUDecomposition.js.)

with (Matrix){ var A = create([[1,3,5],[2,8,1],[0,6,5]]);
writeln('A');
display(A,0);

var evd = EVDecomposition.create(A);

nl(); writeln('V (eigenvectors for A)');
display(evd.V);

nl(); writeln('L (block diagonal eigenvalue matrix for A)');
display(evd.L);
writeln('Note that the second two eigenvalues are complex: 1.632 + 1.816i and 1.632 - 1.816i.');

nl(); writeln('A*V - V*L');
display(sub(mult(A,evd.V),mult(evd.V,evd.L)));

nl(); writeln('A - V*L*inverse(V)');
display(sub(A,mult(evd.V,mult(evd.L,inverse(evd.V)))));
}

 */

var EVDecomposition = new createEVDecompositionPackage();
function createEVDecompositionPackage() {
	this.version = version;
	
	var abs = Math.abs; // local synonym
	var sqrt = Math.sqrt; // local synonym
	var max = Math.max; // local synonym
	var min = Math.min; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Utility function to find sqrt(a^2 + b^2) reliably
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _hypot(a, b) {
		var r;
		var aa = abs(a);
		var bb = abs(b);
		if (aa > bb) {
			r = b / a;
			r = aa * sqrt(1 + r * r);
		} else if (b != 0) {
			r = a / b;
			r = bb * sqrt(1 + r * r);
		} else
			r = 0.0;
		return r;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// 'Global' variables used to communicate between functions.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var n; // row and column dimension (square matrix)
	var isSymmetric; // whether matrix is symmetric
	var d;
	var e; // arrays for internal storage of eigenvalues
	var V; // array for internal storage of eigenvectors.
	var H; // array for internal storage of nonsymmetric Hessenberg form.
	var ort; // working storage for nonsymmetric algorithm.
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform the symmetric Householder reduction to
	// tridiagonal form.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _tred2() { //  This is derived from the Algol procedures tred2 by
		//  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
		//  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutine in EISPACK.
		
		for (var j = 0; j < n; j++) {
			d[j] = V[n - 1][j];
		}
		
		// Householder reduction to tridiagonal form.
		for (var i = n - 1; i > 0; i--) { // Scale to avoid under/overflow.
			var scale = 0.0;
			var h = 0.0;
			for (var k = 0; k < i; k++) {
				scale = scale + abs(d[k]);
			}
			if (scale == 0.0) {
				e[i] = d[i - 1];
				for (var j = 0; j < i; j++) {
					d[j] = V[i - 1][j];
					V[i][j] = 0.0;
					V[j][i] = 0.0;
				}
			} else { // Generate Householder vector.
				for (var k = 0; k < i; k++) {
					d[k] /= scale;
					h += d[k] * d[k];
				}
				var f = d[i - 1];
				var g = sqrt(h);
				if (f > 0) {
					g = -g;
				}
				e[i] = scale * g;
				h = h - f * g;
				d[i - 1] = f - g;
				for (var j = 0; j < i; j++) {
					e[j] = 0.0;
				}
				// Apply similarity transformation to remaining columns.
				for (var j = 0; j < i; j++) {
					f = d[j];
					V[j][i] = f;
					g = e[j] + V[j][j] * f;
					for (var k = j + 1; k <= i - 1; k++) {
						g += V[k][j] * d[k];
						e[k] += V[k][j] * f;
					}
					e[j] = g;
				}
				f = 0.0;
				for (var j = 0; j < i; j++) {
					e[j] /= h;
					f += e[j] * d[j];
				}
				var hh = f / (h + h);
				for (var j = 0; j < i; j++) {
					e[j] -= hh * d[j];
				}
				for (var j = 0; j < i; j++) {
					f = d[j];
					g = e[j];
					for (var k = j; k <= i - 1; k++) {
						V[k][j] -= (f * e[k] + g * d[k]);
					}
					d[j] = V[i - 1][j];
					V[i][j] = 0.0;
				}
			}
			d[i] = h;
		}
		// Accumulate transformations.
		for (var i = 0; i < n - 1; i++) {
			V[n - 1][i] = V[i][i];
			V[i][i] = 1.0;
			var h = d[i + 1];
			if (h != 0.0) {
				for (var k = 0; k <= i; k++) {
					d[k] = V[k][i + 1] / h;
				}
				for (var j = 0; j <= i; j++) {
					var g = 0.0;
					for (var k = 0; k <= i; k++) {
						g += V[k][i + 1] * V[k][j];
					}
					for (var k = 0; k <= i; k++) {
						V[k][j] -= g * d[k];
					}
				}
			}
			for (var k = 0; k <= i; k++) {
				V[k][i + 1] = 0.0;
			}
		}
		for (var j = 0; j < n; j++) {
			d[j] = V[n - 1][j];
			V[n - 1][j] = 0.0;
		}
		V[n - 1][n - 1] = 1.0;
		e[0] = 0.0;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform the symmetric tridiagonal QL algorithm.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _tql2() { //  This is derived from the Algol procedures tql2, by
		//  Bowdler, Martin, Reinsch, and Wilkinson, Handbook for
		//  Auto. Comp., Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutine in EISPACK.
		var eps = 0.5 * Matrix.getEPS();
		
		for (var i = 1; i < n; i++) {
			e[i - 1] = e[i];
		}
		e[n - 1] = 0.0;
		
		var f = 0.0;
		var tst1 = 0.0;
		for (var l = 0; l < n; l++) { // Find small subdiagonal element
			tst1 = max(tst1, abs(d[l]) + abs(e[l]));
			var m = l;
			while (m < n) {
				if (abs(e[m]) <= eps * tst1) {
					break;
				}
				m++;
			}
			
			// If m == l, d[l] is an eigenvalue,
			// otherwise, iterate.
			if (m > l) {
				var iter = 0;
				do {
					iter = iter + 1; // (Could check iteration count here.)
					// Compute implicit shift
					var g = d[l];
					var p = (d[l + 1] - g) / (2.0 * e[l]);
					var r = _hypot(p, 1.0);
					if (p < 0) {
						r = -r;
					}
					d[l] = e[l] / (p + r);
					d[l + 1] = e[l] * (p + r);
					var dl1 = d[l + 1];
					var h = g - d[l];
					for (var i = l + 2; i < n; i++) {
						d[i] -= h;
					}
					f = f + h;
					
					// Implicit QL transformation.
					p = d[m];
					var c = 1.0;
					var c2 = c;
					var c3 = c;
					var el1 = e[l + 1];
					var s = 0.0;
					var s2 = 0.0;
					for (var i = m - 1; i >= l; i--) {
						c3 = c2;
						c2 = c;
						s2 = s;
						g = c * e[i];
						h = c * p;
						r = _hypot(p, e[i]);
						e[i + 1] = s * r;
						s = e[i] / r;
						c = p / r;
						p = c * d[i] - s * g;
						d[i + 1] = h + s * (c * g + s * d[i]);
						
						// Accumulate transformation.
						for (var k = 0; k < n; k++) {
							h = V[k][i + 1];
							V[k][i + 1] = s * V[k][i] + c * h;
							V[k][i] = c * V[k][i] - s * h;
						}
					}
					p = -s * s2 * c3 * el1 * e[l] / dl1;
					e[l] = s * p;
					d[l] = c * p;
					
				} while (abs(e[l]) > eps * tst1); // Check for convergence
			}
			d[l] = d[l] + f;
			e[l] = 0.0;
		}
		
		// Sort eigenvalues and corresponding vectors.
		for (var i = 0; i < n - 1; i++) {
			var k = i;
			var p = d[i];
			for (var j = i + 1; j < n; j++) {
				if (d[j] < p) {
					k = j;
					p = d[j];
				}
			}
			if (k != i) {
				d[k] = d[i];
				d[i] = p;
				for (var j = 0; j < n; j++) {
					p = V[j][i];
					V[j][i] = V[j][k];
					V[j][k] = p;
				}
			}
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform the nonsymmetric reduction to Hessenberg
	// form.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _orthes() { //  This is derived from the Algol procedures orthes and ortran,
		//  by Martin and Wilkinson, Handbook for Auto. Comp.,
		//  Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutines in EISPACK.
		
		var low = 0;
		var high = n - 1;
		
		for (var m = low + 1; m <= high - 1; m++) { // Scale column.
			var scale = 0.0;
			for (var i = m; i <= high; i++) {
				scale = scale + abs(H[i][m - 1]);
			}
			if (scale != 0.0) { // Compute Householder transformation.
				var h = 0.0;
				for (var i = high; i >= m; i--) {
					ort[i] = H[i][m - 1] / scale;
					h += ort[i] * ort[i];
				}
				var g = sqrt(h);
				if (ort[m] > 0) {
					g = -g;
				}
				h = h - ort[m] * g;
				ort[m] = ort[m] - g;
				
				// Apply Householder similarity transformation
				// H = (I-u*u'/h)*H*(I-u*u')/h)
				for (var j = m; j < n; j++) {
					var f = 0.0;
					for (var i = high; i >= m; i--) {
						f += ort[i] * H[i][j];
					}
					f = f / h;
					for (var i = m; i <= high; i++) {
						H[i][j] -= f * ort[i];
					}
				}
				for (var i = 0; i <= high; i++) {
					var f = 0.0;
					for (var j = high; j >= m; j--) {
						f += ort[j] * H[i][j];
					}
					f = f / h;
					for (var j = m; j <= high; j++) {
						H[i][j] -= f * ort[j];
					}
				}
				ort[m] = scale * ort[m];
				H[m][m - 1] = scale * g;
			}
		}
		
		// Accumulate transformations (Algol's ortran).
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++) {
				V[i][j] = (i == j ? 1.0 : 0.0);
			}
		}
		for (var m = high - 1; m >= low + 1; m--) {
			if (H[m][m - 1] != 0.0) {
				for (var i = m + 1; i <= high; i++) {
					ort[i] = H[i][m - 1];
				}
				for (var j = m; j <= high; j++) {
					var g = 0.0;
					for (var i = m; i <= high; i++) {
						g += ort[i] * V[i][j];
					}
					// Double division avoids possible underflow
					g = (g / ort[m]) / H[m][m - 1];
					for (var i = m; i <= high; i++) {
						V[i][j] += g * ort[i];
					}
				}
			}
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform complex scalar division.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _cdiv(xr, xi, yr, yi) {
		var cdivr,
		cdivi;
		var r,
		d;
		if (abs(yr) > abs(yi)) {
			r = yi / yr;
			d = yr + r * yi;
			cdivr = (xr + r * xi) / d;
			cdivi = (xi - r * xr) / d;
		} else {
			r = yr / yi;
			d = yi + r * yr;
			cdivr = (r * xr + xi) / d;
			cdivi = (r * xi - xr) / d;
		}
		return {
			r : cdivr,
			i : cdivi
		};
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to perform nonsymmetric reduction from Hessenberg to
	// real Schur form.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _hqr2() { //  This is derived from the Algol procedure hqr2,
		//  by Martin and Wilkinson, Handbook for Auto. Comp.,
		//  Vol.ii-Linear Algebra, and the corresponding
		//  Fortran subroutine in EISPACK.
		var eps = 0.5 * Matrix.getEPS();
		
		// Initialize
		var nn = n;
		var n1 = nn - 1;
		var low = 0;
		var high = nn - 1;
		var exshift = 0.0;
		var p = 0,
		q = 0,
		r = 0,
		s = 0,
		z = 0,
		t,
		w,
		x,
		y;
		
		// Store roots isolated by balanc and compute matrix norm
		
		var norm = 0.0;
		for (var i = 0; i < nn; i++) {
			if (i < low || i > high) {
				d[i] = H[i][i];
				e[i] = 0.0;
			}
			for (var j = max(i - 1, 0); j < nn; j++) {
				norm = norm + abs(H[i][j]);
			}
		}
		
		// Outer loop over eigenvalue index
		
		var iter = 0;
		while (n1 >= low) { // Look for single small sub-diagonal element
			var l = n1;
			while (l > low) {
				s = abs(H[l - 1][l - 1]) + abs(H[l][l]);
				if (s == 0.0) {
					s = norm;
				}
				if (abs(H[l][l - 1]) < eps * s) {
					break;
				}
				l--;
			}
			
			// Check for convergence
			// One root found
			if (l == n1) {
				H[n1][n1] = H[n1][n1] + exshift;
				d[n1] = H[n1][n1];
				e[n1] = 0.0;
				n1--;
				iter = 0;
			}
			// Two roots found
			else if (l == n1 - 1) {
				w = H[n1][n1 - 1] * H[n1 - 1][n1];
				p = (H[n1 - 1][n1 - 1] - H[n1][n1]) / 2.0;
				q = p * p + w;
				z = sqrt(abs(q));
				H[n1][n1] = H[n1][n1] + exshift;
				H[n1 - 1][n1 - 1] = H[n1 - 1][n1 - 1] + exshift;
				x = H[n1][n1];
				
				// Real pair
				if (q >= 0) {
					if (p >= 0) {
						z = p + z;
					} else {
						z = p - z;
					}
					d[n1 - 1] = x + z;
					d[n1] = d[n1 - 1];
					if (z != 0.0) {
						d[n1] = x - w / z;
					}
					e[n1 - 1] = 0.0;
					e[n1] = 0.0;
					x = H[n1][n1 - 1];
					s = abs(x) + abs(z);
					p = x / s;
					q = z / s;
					r = sqrt(p * p + q * q);
					p = p / r;
					q = q / r;
					
					// Row modification
					for (var j = n1 - 1; j < nn; j++) {
						z = H[n1 - 1][j];
						H[n1 - 1][j] = q * z + p * H[n1][j];
						H[n1][j] = q * H[n1][j] - p * z;
					}
					
					// Column modification
					for (var i = 0; i <= n1; i++) {
						z = H[i][n1 - 1];
						H[i][n1 - 1] = q * z + p * H[i][n1];
						H[i][n1] = q * H[i][n1] - p * z;
					}
					
					// Accumulate transformations
					for (var i = low; i <= high; i++) {
						z = V[i][n1 - 1];
						V[i][n1 - 1] = q * z + p * V[i][n1];
						V[i][n1] = q * V[i][n1] - p * z;
					}
				}
				// Complex pair
				else {
					d[n1 - 1] = x + p;
					d[n1] = x + p;
					e[n1 - 1] = z;
					e[n1] = -z;
				}
				n1 = n1 - 2;
				iter = 0;
			}
			// No convergence yet
			else {
				// Form shift
				x = H[n1][n1];
				y = 0.0;
				w = 0.0;
				if (l < n1) {
					y = H[n1 - 1][n1 - 1];
					w = H[n1][n1 - 1] * H[n1 - 1][n1];
				}
				
				// Wilkinson's original ad hoc shift
				if (iter == 10) {
					exshift += x;
					for (var i = low; i <= n1; i++) {
						H[i][i] -= x;
					}
					s = abs(H[n1][n1 - 1]) + abs(H[n1 - 1][n1 - 2]);
					x = y = 0.75 * s;
					w = -0.4375 * s * s;
				}
				
				// MATLAB's new ad hoc shift
				if (iter == 30) {
					s = (y - x) / 2.0;
					s = s * s + w;
					if (s > 0) {
						s = sqrt(s);
						if (y < x) {
							s = -s;
						}
						s = x - w / ((y - x) / 2.0 + s);
						for (var i = low; i <= n1; i++) {
							H[i][i] -= s;
						}
						exshift += s;
						x = y = w = 0.964;
					}
				}
				
				iter = iter + 1; // (Could check iteration count here.)
				
				// Look for two consecutive small sub-diagonal elements
				var m = n1 - 2;
				while (m >= l) {
					z = H[m][m];
					r = x - z;
					s = y - z;
					p = (r * s - w) / H[m + 1][m] + H[m][m + 1];
					q = H[m + 1][m + 1] - z - r - s;
					r = H[m + 2][m + 1];
					s = abs(p) + abs(q) + abs(r);
					p = p / s;
					q = q / s;
					r = r / s;
					if (m == l) {
						break;
					}
					if (abs(H[m][m - 1]) * (abs(q) + abs(r)) <
						eps * (abs(p) * (abs(H[m - 1][m - 1]) + abs(z) +
								abs(H[m + 1][m + 1])))) {
						break;
					}
					m--;
				}
				
				for (var i = m + 2; i <= n1; i++) {
					H[i][i - 2] = 0.0;
					if (i > m + 2) {
						H[i][i - 3] = 0.0;
					}
				}
				
				// Double QR step involving rows l:n1 and columns m:n1
				for (var k = m; k <= n1 - 1; k++) {
					var notlast = (k != n1 - 1);
					if (k != m) {
						p = H[k][k - 1];
						q = H[k + 1][k - 1];
						r = (notlast ? H[k + 2][k - 1] : 0.0);
						x = abs(p) + abs(q) + abs(r);
						if (x != 0.0) {
							p = p / x;
							q = q / x;
							r = r / x;
						}
					}
					if (x == 0.0) {
						break;
					}
					s = sqrt(p * p + q * q + r * r);
					if (p < 0) {
						s = -s;
					}
					if (s != 0) {
						if (k != m) {
							H[k][k - 1] = -s * x;
						} else if (l != m) {
							H[k][k - 1] = -H[k][k - 1];
						}
						p = p + s;
						x = p / s;
						y = q / s;
						z = r / s;
						q = q / p;
						r = r / p;
						
						// Row modification
						for (var j = k; j < nn; j++) {
							p = H[k][j] + q * H[k + 1][j];
							if (notlast) {
								p = p + r * H[k + 2][j];
								H[k + 2][j] = H[k + 2][j] - p * z;
							}
							H[k][j] = H[k][j] - p * x;
							H[k + 1][j] = H[k + 1][j] - p * y;
						}
						
						// Column modification
						for (var i = 0; i <= min(n1, k + 3); i++) {
							p = x * H[i][k] + y * H[i][k + 1];
							if (notlast) {
								p = p + z * H[i][k + 2];
								H[i][k + 2] = H[i][k + 2] - p * r;
							}
							H[i][k] = H[i][k] - p;
							H[i][k + 1] = H[i][k + 1] - p * q;
						}
						
						// Accumulate transformations
						for (var i = low; i <= high; i++) {
							p = x * V[i][k] + y * V[i][k + 1];
							if (notlast) {
								p = p + z * V[i][k + 2];
								V[i][k + 2] = V[i][k + 2] - p * r;
							}
							V[i][k] = V[i][k] - p;
							V[i][k + 1] = V[i][k + 1] - p * q;
						}
					} // (s != 0)
				} // k loop
			} // check convergence
		} // while (n >= low)
		
		// Backsubstitute to find vectors of upper triangular form
		if (norm == 0.0) {
			return;
		}
		
		for (n1 = nn - 1; n1 >= 0; n1--) {
			p = d[n1];
			q = e[n1];
			
			// Real vector
			if (q == 0) {
				var l = n1;
				H[n1][n1] = 1.0;
				for (var i = n1 - 1; i >= 0; i--) {
					w = H[i][i] - p;
					r = 0.0;
					for (var j = l; j <= n1; j++) {
						r = r + H[i][j] * H[j][n1];
					}
					if (e[i] < 0.0) {
						z = w;
						s = r;
					} else {
						l = i;
						if (e[i] == 0.0) {
							if (w != 0.0) {
								H[i][n1] = -r / w;
							} else {
								H[i][n1] = -r / (eps * norm);
							}
							
						}
						// Solve real equations
						else {
							x = H[i][i + 1];
							y = H[i + 1][i];
							q = (d[i] - p) * (d[i] - p) + e[i] * e[i];
							t = (x * s - z * r) / q;
							H[i][n1] = t;
							if (abs(x) > abs(z)) {
								H[i + 1][n1] = (-r - w * t) / x;
							} else {
								H[i + 1][n1] = (-s - y * t) / z;
							}
						}
						
						// Overflow control
						t = abs(H[i][n1]);
						if ((eps * t) * t > 1) {
							for (var j = i; j <= n1; j++) {
								H[j][n1] = H[j][n1] / t;
							}
						}
					}
				}
				
			}
			// Complex vector
			else if (q < 0) {
				var l = n1 - 1;
				
				// Last vector component imaginary so matrix is triangular
				if (abs(H[n1][n1 - 1]) > abs(H[n1 - 1][n1])) {
					H[n1 - 1][n1 - 1] = q / H[n1][n1 - 1];
					H[n1 - 1][n1] =  - (H[n1][n1] - p) / H[n1][n1 - 1];
				} else {
					var cd = _cdiv(0.0, -H[n1 - 1][n1], H[n1 - 1][n1 - 1] - p, q);
					H[n1 - 1][n1 - 1] = cd.r;
					H[n1 - 1][n1] = cd.i;
				}
				H[n1][n1 - 1] = 0.0;
				H[n1][n1] = 1.0;
				for (var i = n1 - 2; i >= 0; i--) {
					var ra,
					sa,
					vr,
					vi;
					ra = 0.0;
					sa = 0.0;
					for (var j = l; j <= n1; j++) {
						ra = ra + H[i][j] * H[j][n1 - 1];
						sa = sa + H[i][j] * H[j][n1];
					}
					w = H[i][i] - p;
					
					if (e[i] < 0.0) {
						z = w;
						r = ra;
						s = sa;
					} else {
						l = i;
						if (e[i] == 0) {
							var cd = _cdiv(-ra, -sa, w, q);
							H[i][n1 - 1] = cd.r;
							H[i][n1] = cd.i;
						} else {
							// Solve complex equations
							x = H[i][i + 1];
							y = H[i + 1][i];
							vr = (d[i] - p) * (d[i] - p) + e[i] * e[i] - q * q;
							vi = (d[i] - p) * 2.0 * q;
							if (vr == 0.0 && vi == 0.0) {
								vr = eps * norm * (abs(w) + abs(q) +
										abs(x) + abs(y) + abs(z));
							}
							var cd = _cdiv(x * r - z * ra + q * sa, x * s - z * sa - q * ra, vr, vi);
							H[i][n1 - 1] = cd.r;
							H[i][n1] = cd.i;
							if (abs(x) > (abs(z) + abs(q))) {
								H[i + 1][n1 - 1] = (-ra - w * H[i][n1 - 1] + q * H[i][n1]) / x;
								H[i + 1][n1] = (-sa - w * H[i][n1] - q * H[i][n1 - 1]) / x;
							} else {
								var cd = _cdiv(-r - y * H[i][n1 - 1], -s - y * H[i][n1], z, q);
								H[i + 1][n1 - 1] = cd.r;
								H[i + 1][n1] = cd.i;
							}
						}
						
						// Overflow control
						t = max(abs(H[i][n1 - 1]), abs(H[i][n1]));
						if ((eps * t) * t > 1) {
							for (var j = i; j <= n1; j++) {
								H[j][n1 - 1] = H[j][n1 - 1] / t;
								H[j][n1] = H[j][n1] / t;
							}
						}
					}
				}
			}
		}
		
		// Vectors of isolated roots
		for (var i = 0; i < nn; i++) {
			if (i < low || i > high) {
				for (var j = i; j < nn; j++) {
					V[i][j] = H[i][j];
				}
			}
		}
		
		// Back transformation to get eigenvectors of original matrix
		for (var j = nn - 1; j >= low; j--) {
			for (var i = low; i <= high; i++) {
				z = 0.0;
				for (var k = low; k <= min(j, high); k++) {
					z = z + V[i][k] * H[k][j];
				}
				V[i][j] = z;
			}
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to create the block diagonal eigenvalue matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _getL() {
		var X = Matrix.create(n, n);
		var L = X.mat;
		for (var i = 0; i < n; i++) {
			for (var j = 0; j < n; j++)
				L[i][j] = 0.0;
			L[i][i] = d[i];
			if (e[i] > 0)
				L[i][i + 1] = e[i];
			else if (e[i] < 0)
				L[i][i - 1] = e[i];
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// EVDecomposition.create(mo): given a matrix as a Matrix object mo, it
	//   returns an EVDecomposition object which contains the eigenvectors
	//   and eigenvalues of the matrix. The fields of an EVDecomposition
	//   object are:
	//   V   the columnwise eigenvectors as a Matrix object
	//   lr  the real part of the eigenvalues as an array
	//   li  the imaginary part of the eigenvalues as an array
	//   L   the block diagonal eigenvalue matrix as a Matrix object
	//   isSymmetric  whether the matrix is symmetric or not (boolean)
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (mo) {
		var A = mo.mat;
		n = mo.n;
		V = new Array(n);
		for (var i = 0; i < n; i++)
			V[i] = new Array(n);
		d = new Array(n);
		e = new Array(n);
		
		// is the matrix symmetric?
		isSymmetric = true;
		for (var j = 0; (j < n) && isSymmetric; j++) {
			for (var i = 0; (i < n) && isSymmetric; i++) {
				isSymmetric = (A[i][j] == A[j][i]);
			}
		}
		
		// process the matrix
		if (isSymmetric) { // process a symmetric matrix
			for (var i = 0; i < n; i++) {
				for (var j = 0; j < n; j++)
					V[i][j] = A[i][j];
			}
			// Tridiagonalize.
			_tred2();
			// Diagonalize.
			_tql2();
		} else { // process an unsymmetic matrix
			H = new Array(n);
			for (var i = 0; i < n; i++)
				H[i] = new Array(n);
			ort = new Array(n);
			for (var j = 0; j < n; j++) {
				for (var i = 0; i < n; i++)
					H[i][j] = A[i][j];
			}
			// Reduce to Hessenberg form.
			_orthes();
			// Reduce Hessenberg to real Schur form.
			_hqr2();
		}
		
		// reduce small values in d & e to 0 (added by PC)
		var eps = Matrix.getEPS();
		for (var i = 0; i < n; i++) {
			if (abs(d[i]) < eps)
				d[i] = 0;
			if (abs(e[i]) < eps)
				e[i] = 0;
		}
		
		// Sort d, e and L by the size of real part of eigenvalue
		// with 0's at the end.  Care is needed not to re-order pairs of complex
		// eigenvalues.                      (added by PC)
		var last = 0;
		for (var i = 0; i < n - 1; i++) {
			var dMax = d[i];
			var iMax = i;
			for (var j = i + 1; j < n; j++) {
				var swapNeeded = false;
				if (d[j] != 0) {
					if (dMax == 0)
						swapNeeded = true;
					else {
						var diff = d[j] - dMax;
						if (diff > eps)
							swapNeeded = true;
						else if (abs(diff) < eps)
							swapNeeded = e[j] > e[iMax];
					}
				}
				if (swapNeeded) {
					dMax = d[j];
					iMax = j;
				}
			}
			if (i != iMax) {
				var temp = d[i];
				d[i] = d[iMax];
				d[iMax] = temp;
				temp = e[i];
				e[i] = e[iMax];
				e[iMax] = temp;
				for (var j = 0; j < n; j++) {
					temp = V[j][i];
					V[j][i] = V[j][iMax];
					V[j][iMax] = temp;
				}
			}
			if (d[i] != 0 || e[i] != 0)
				last = i;
		}
		if (d[n - 1] != 0 || e[n - 1] != 0)
			last = n - 1;
		
		// create an object to return the results
		var evd = new Object();
		evd.V = Matrix.create(V);
		evd.lr = d;
		evd.li = e;
		evd.L = _getL(); // create the block diagonal eigenvalue matrix
		evd.isSymmetric = isSymmetric;
		evd.isEVDecomposition = true;
		return evd;
	}
	
}
/* ========================= LUDecomposition ==========================

Description: Javascript routines to decompose a matrix A into a lower
and an upper triangular matrix, L and U, so that L*U = A (possibly
with its rows re-ordered).  Stored as methods of the global variable
LUDecomposition.
Acknowledgement: This Javascript code is based on the source code of
JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
which states "Copyright Notice This software is a cooperative product
of The MathWorks and the National Institute of Standards and
Technology (NIST) which has been released to the public domain.
Neither The MathWorks nor NIST assumes any responsibility whatsoever
for its use by other parties, and makes no guarantees, expressed
or implied, about its quality, reliability, or any other
characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
copyright Peter Coxhead, 2008, and is released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
 */
var version = 'LUDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

LU Decomposition (from the JAMA package)

For an m-by-n matrix A with m >= n, the LU decomposition is an m-by-n
unit lower triangular matrix L, an n-by-n upper triangular matrix U,
and a permutation vector piv of length m so that A(piv,:) = L*U.
If m < n, then L is m-by-m and U is m-by-n.

The LU decomposition with pivoting always exists, even if the matrix is
singular, so the constructor will never fail.  The primary use of the
LU decomposition is in the solution of square systems of simultaneous
linear equations.  This will fail if isNonsingular() returns false.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 ***NOTE*** The functions in LUDecomposition.js should NOT normally be
used directly.  Their main use to provide 'services' to the functions
in Matrix.js.

LUDecomposition.create(mo): given a Matrix object mo, it returns an
object from which L, U and piv can be accessed.

LUDecomposition.restore(mo,lud): returns a new Matrix object comprised
of the rows of the Matrix object mo restored to the order given in
the pivot of the LUDecomposition object lud.

LUDecomposition.isNonsingular(lud): given an LUDecomposition object lud, it
determines whether the matrix from which it was derived is singular or
not. The value of Matrix.getEPS() is used as the smallest non-zero
number.

LUDecomposition.getL(lud): given an LUDecomposition object lud, it creates
and returns the lower triangular factor, L, as a Matrix object.
LUDecomposition.getU(lud): given an LUDecomposition object lud, it creates
and returns the upper triangular factor, U, as a Matrix object.

LUDecomposition.det(lud): given an LUDecomposition object lud, it returns
the determinant of the matrix from which it was derived. The value of
Matrix.getEPS() is used as the smallest non-zero number.

LUDecomposition.solve(lud,bmat): if the LUDecomposition object lud is derived
from the matrix A, and the Matrix object bmat represents the matrix b, then
this function solves the matrix equation A*x = b, returning x as a Matrix
object.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
var LUDecomposition = new createLUDecompositionPackage();
function createLUDecompositionPackage() {
	this.version = version;
	
	var abs = Math.abs; // local synonym
	var min = Math.min; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, argno, arg) {
		if (!arg.isMatrix) {
      dealWithError( '***ERROR: in LUDecomposition.' + fname + ': argument ' + argno +
				' is not a Matrix.');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is an LUDecomposition object
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkLUDecomposition(fname, argno, arg) {
		if (!arg.isLUDecomposition) {
      dealWithError( '***ERROR: in LUDecomposition.' + fname + ': argument ' + argno +
				' is not an LUDecomposition.');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.create(mo): given a Matrix object mo, it returns an
	//   object from which L, U and piv can be accessed.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (mo) {
		_chkMatrix('create', 1, mo);
		var m; // row dimension
		var n; // col dimension
		// Use a "left-looking", dot-product, Crout/Doolittle algorithm.
		var matLU = Matrix.create(mo.mat);
		var LU = matLU.mat;
		m = mo.m;
		n = mo.n;
		var piv = new Array();
		for (var i = 0; i < m; i++)
			piv[i] = i;
		var pivsign = 1;
		var LUrowi;
		var LUcolj = new Array(m);
		// outer loop
		for (var j = 0; j < n; j++) { // make a copy of the j-th column to localize references
			for (var i = 0; i < m; i++)
				LUcolj[i] = LU[i][j];
			// apply previous transformations
			for (var i = 0; i < m; i++) {
				LUrowi = LU[i];
				// most of the time is spent in the following dot product
				var kmax = min(i, j);
				var s = 0.0;
				for (var k = 0; k < kmax; k++)
					s += LUrowi[k] * LUcolj[k];
				LUrowi[j] = LUcolj[i] -= s;
			}
			// find pivot and exchange if necessary.
			var p = j;
			for (var i = j + 1; i < m; i++) {
				if (abs(LUcolj[i]) > abs(LUcolj[p]))
					p = i;
			}
			if (p != j) {
				for (var k = 0; k < n; k++) {
					var t = LU[p][k];
					LU[p][k] = LU[j][k];
					LU[j][k] = t;
				}
				var k = piv[p];
				piv[p] = piv[j];
				piv[j] = k;
				pivsign = -pivsign;
			}
			// compute multipliers
			if (j < m && LU[j][j] != 0.0) {
				for (var i = j + 1; i < m; i++)
					LU[i][j] /= LU[j][j];
			}
		}
		// now create and return the object with the results
		var lud = new Object();
		lud.LU = LU;
		lud.m = m;
		lud.n = n;
		lud.pivsign = pivsign;
		lud.piv = piv;
		lud.isLUDecomposition = true;
		return lud;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.restore(mo,lud): returns a new Matrix object comprised
	//   of the rows of the Matrix object mo restored to the order given in the
	//   pivot of the LUDecomposition object lud.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.restore = function (mo, lud) {
		_chkMatrix('restore', 1, mo);
		_chkLUDecomposition('restore', 2, lud);
		var res = Matrix.create(mo.m, mo.n);
		var r = lud.piv;
		for (var i = 0; i < mo.m; i++)
			for (var j = 0; j < mo.n; j++)
				res.mat[r[i]][j] = mo.mat[i][j];
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	//LUDecomposition.isNonsingular(lud): given an LUDecomposition object lud, it
	//  determines whether the matrix from which it was derived is singular or
	//  not. The value of Matrix.getEPS() is used as the smallest non-zero
	//  number.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.isNonsingular = function (lud) {
		_chkLUDecomposition('isNonsingular', 1, lud);
		var eps = Matrix.getEPS();
		with (lud) {
			for (var j = 0; j < n; j++) {
				if (abs(LU[j][j]) < eps)
					return false;
			}
		}
		return true;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.getL(lud): given an LUDecomposition object lud, it creates
	//   and returns the lower triangular factor, L, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getL = function (lud) {
		_chkLUDecomposition('getL', 1, lud);
		var xm = lud.m;
		var xn = (lud.m >= lud.n) ? lud.n : lud.m;
		var X = Matrix.create(xm, xn);
		var L = X.mat;
		with (lud) {
			for (var i = 0; i < xm; i++) {
				for (var j = 0; j < xn; j++) {
					if (i > j)
						L[i][j] = LU[i][j];
					else if (i == j)
						L[i][j] = 1.0;
					else
						L[i][j] = 0.0;
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.getU(lud): given an LUDecomposition object lud, it creates
	//   and returns the upper triangular factor, U, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getU = function (lud) {
		_chkLUDecomposition('getU', 1, lud);
		var xm = (lud.m >= lud.n) ? lud.n : lud.m;
		var xn = lud.n;
		var X = Matrix.create(xm, xn);
		var U = X.mat;
		with (lud) {
			for (var i = 0; i < xm; i++) {
				for (var j = 0; j < xn; j++) {
					if (i <= j)
						U[i][j] = LU[i][j];
					else
						U[i][j] = 0.0;
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.det(lud): given an LUDecomposition object lud, it
	//   returns the determinant of the matrix from which it was derived. The
	//   value of Matrix.getEPS() is used as the smallest non-zero number.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.det = function (lud) {
		_chkLUDecomposition('det', 1, lud);
		var eps = Matrix.getEPS();
		if (lud.m != lud.n) {
      idealwithError( '***ERROR: in LUDecomposition.det: argument 1 is not square.');
		}
		var d = lud.pivsign;
		with (lud) {
			for (var j = 0; j < n; j++) {
				var val = LU[j][j];
				d *= LU[j][j];
				if (abs(d) < eps)
					return 0;
			}
		}
		return d;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _arrange(mo,r): a private function which returns a new Matrix object
	//  comprisedof the rows of the Matrix object mo arranged according to
	//  the values in the array r.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _arrange(mo, r) {
		with (mo) {
			var res = Matrix.create(m, n);
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					res.mat[i][j] = mat[r[i]][j];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// LUDecomposition.solve(lud,bmat): if the LUDecomposition object lud is
	//   derived from the matrix A, and the Matrix object bmat represents the
	//   matrix b, then this function solves the matrix equation A*x = b,
	//   returning x as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (lud, bmat) {
		_chkMatrix('solve', 2, bmat);
		_chkLUDecomposition('solve', 1, lud);
		if (bmat.m != lud.m) {
      dealWithError( '***ERROR: in LUDecomposition.solve: matrix row dimensions do not agree.');
		}
		if (!this.isNonsingular(lud)) {
      dealWithError( '***ERROR: in LUDecomposition.solve: matrix is singular.');
		}
		// copy right hand side with pivoting
		var nx = bmat.n;
		var Xmat = _arrange(bmat, lud.piv);
		var X = Xmat.mat;
		// solve L*Y = B(piv,:)
		with (lud) {
			for (var k = 0; k < n; k++) {
				for (var i = k + 1; i < n; i++) {
					for (var j = 0; j < nx; j++) {
						X[i][j] -= X[k][j] * LU[i][k];
					}
				}
			}
			// solve U*X = Y
			for (var k = n - 1; k >= 0; k--) {
				for (var j = 0; j < nx; j++) {
					X[k][j] /= LU[k][k];
				}
				for (var i = 0; i < k; i++) {
					for (var j = 0; j < nx; j++) {
						X[i][j] -= X[k][j] * LU[i][k];
					}
				}
			}
		}
		return Xmat;
	}
	
}
/* ========================= QRDecomposition ==========================

Description: Javascript routines to decompose a matrix A into an
orthogonal matrix Q and an upper triangular matrix R so that Q*R = A.
Stored as methods of the global variable QRDecomposition.
Acknowledgement: This Javascript code is based on the source code of
JAMA, A Java Matrix package (http://math.nist.gov/javanumerics/jama/),
which states "Copyright Notice This software is a cooperative product
of The MathWorks and the National Institute of Standards and
Technology (NIST) which has been released to the public domain.
Neither The MathWorks nor NIST assumes any responsibility whatsoever
for its use by other parties, and makes no guarantees, expressed
or implied, about its quality, reliability, or any other
characteristic."
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: The conversion of the JAMA source to Javascript is
copyright Peter Coxhead, 2008, and is released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 Dec 2008
 */
var version = 'QRDecomposition 1.00';
/*

Uses Matrix.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

QR Decomposition (from the JAMA package)

For an m-by-n matrix A with m >= n, the QR decomposition is an m-by-n
orthogonal matrix Q and an n-by-n upper triangular matrix R so that
A = Q*R.

The QR decompostion always exists, even if the matrix does not have
full rank, so the constructor will never fail.  The primary use of the
QR decomposition is in the least squares solution of nonsquare systems
of simultaneous linear equations.  This will fail if isFullRank(qrd)
returns false for the QRDecomposition object qrd.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

 ***NOTE*** The functions in QRDecomposition.js should NOT normally be
used directly.  Their main use to provide 'services' to the functions
in Matrix.js.

QRDecomposition.create(mo): given a Matrix object mo, it returns an
object from which Q and R can be accessed.

QRDecomposition.isFullRank(qrd): given an QRDecomposition object qrd, it
determines whether the matrix from which it was derived is of full
rank or not. The constant Matrix.EPS is used as the smallest non-zero
number.

QRDecomposition.getH(qrd): given an QRDecomposition object qrd, it
creates and returns the Householder vectors, H, as a Matrix object.
QRDecomposition.getR(qrd): given an QRDecomposition object qrd, it creates
and returns the upper triangular factor, R, as a Matrix object.
QRDecomposition.getQ(qrd): given an QRDecomposition object qrd, it creates
and returns the orthogonal factor, Q, as a Matrix object.

QRDecomposition.solve(qrd,B): if the QRDecomposition object qrd is
derived from the matrix A, and the Matrix object B represents the matrix
B, then this function returns the least squares solution to A*X = B,
returning x as a Matrix object.
B must have as many rows as A but may have any number of columns.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

var QRDecomposition = new createQRDecompositionPackage();
function createQRDecompositionPackage() {
	this.version = version;
	
	var abs = Math.abs; // local synonym
	var sqrt = Math.sqrt; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is a Matrix object
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, argno, arg) {
		if (!(arg instanceof Object && arg.isMatrix)) {
      dealWithError( '***ERROR: in QRDecomposition.' + fname + ': argument ' + argno +
			' is not a 2D matrix (Matrix).');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to check that an argument is a QRDecomposition object
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkQRDecomposition(fname, argno, arg) {
		if (!(arg instanceof Object && arg.isQRDecomposition)) {
      dealWithError( '***ERROR: in QRDecomposition.' + fname + ': argument ' + argno +
			' is not an QRDecomposition.');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Private function to find sqrt(a^2 + b^2) reliably
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _hypot(a, b) {
		var r;
		if (abs(a) > abs(b)) {
			r = b / a;
			r = abs(a) * sqrt(1 + r * r);
		} else if (b != 0) {
			r = a / b;
			r = abs(b) * sqrt(1 + r * r);
		} else {
			r = 0.0;
		}
		return r;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.create(mo): given a Matrix object mo, it returns an
	//   object from which Q and R can be accessed.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (mo) {
		_chkMatrix('create', 1, mo);
		var eps = Matrix.getEPS();
		if (mo.m < mo.n) {
      dealWithError( '***ERROR: in QRDecomposition.create: matrix has fewer rows than columns.');
		}
		// initialize
		var QR = (Matrix.create(mo.mat)).mat;
		var m = mo.m;
		var n = mo.n;
		var Rdiag = new Array(n);
		// main loop
		for (var k = 0; k < n; k++) { // compute 2-norm of k-th column without under/overflow.
			var nrm = 0;
			for (var i = k; i < m; i++) {
				nrm = _hypot(nrm, QR[i][k]);
			}
			if (abs(nrm) > eps) { // Form k-th Householder vector.
				if (QR[k][k] < 0) {
					nrm = -nrm;
				}
				for (var i = k; i < m; i++) {
					QR[i][k] /= nrm;
				}
				QR[k][k] += 1.0;
				// apply transformation to remaining columns
				for (var j = k + 1; j < n; j++) {
					var s = 0.0;
					for (var i = k; i < m; i++) {
						s += QR[i][k] * QR[i][j];
					}
					s = -s / QR[k][k];
					for (var i = k; i < m; i++) {
						QR[i][j] += s * QR[i][k];
					}
				}
			}
			Rdiag[k] = -nrm;
		}
		var qrd = new Object();
		qrd.QR = QR; // array for internal storage of decomposition.
		qrd.m = m; // row dimension
		qrd.n = n; // col dimension
		qrd.Rdiag = Rdiag; // array for internal storage of diagonal of R
		qrd.isQRDecomposition = true;
		return qrd;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.isFullRank(qrd): given an QRDecomposition object qrd,
	//   it determines whether the matrix from which it was derived is of full
	//   rank or not. The constant eps is used as the smallest non-zero
	//   number.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.isFullRank = function (qrd) {
		_chkQRDecomposition('isFullRank', 1, qrd);
		var eps = Matrix.getEPS();
		with (qrd) {
			for (var j = 0; j < n; j++) {
				if (abs(Rdiag[j]) < eps)
					return false;
			}
			return true;
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.getH(qrd): given an QRDecomposition object qrd, it
	//   creates and returns the Householder vectors, H, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getH = function (qrd) {
		_chkQRDecomposition('getH', 1, qrd);
		with (qrd) {
			var X = Matrix.create(m, n);
			var H = X.mat;
			for (var i = 0; i < m; i++) {
				for (var j = 0; j < n; j++) {
					if (i >= j) {
						H[i][j] = QR[i][j];
					} else {
						H[i][j] = 0.0;
					}
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.getR(qrd): given an QRDecomposition object qrd, it
	//   creates and returns the upper triangular factor, R, as a Matrix
	//   object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getR = function (qrd) {
		_chkQRDecomposition('getR', 1, qrd);
		with (qrd) {
			var X = Matrix.create(n, n);
			var R = X.mat;
			for (var i = 0; i < n; i++) {
				for (var j = 0; j < n; j++) {
					if (i < j)
						R[i][j] = QR[i][j];
					else if (i == j)
						R[i][j] = Rdiag[i];
					else
						R[i][j] = 0.0;
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.getQ(qrd): given an QRDecomposition object qrd, it
	//   creates and returns the orthogonal factor, Q, as a Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.getQ = function (qrd) {
		_chkQRDecomposition('getQ', 1, qrd);
		with (qrd) {
			var X = Matrix.create(m, n);
			var Q = X.mat;
			for (var k = n - 1; k >= 0; k--) {
				for (var i = 0; i < m; i++)
					Q[i][k] = 0.0;
				Q[k][k] = 1.0;
				for (var j = k; j < n; j++) {
					if (QR[k][k] != 0) {
						var s = 0.0;
						for (var i = k; i < m; i++) {
							s += QR[i][k] * Q[i][j];
						}
						s = -s / QR[k][k];
						for (var i = k; i < m; i++) {
							Q[i][j] += s * QR[i][k];
						}
					}
				}
			}
		}
		return X;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// QRDecomposition.solve(qrd,B): if the QRDecomposition object qrd is
	//   derived from the matrix A, and the Matrix object B represents the
	//   matrix B, then this function returns the least squares solution to
	//   A*X = B, returning x as a Matrix object.
	//   B must have as many rows as A but may have any number of columns.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (qrd, B) {
		_chkQRDecomposition('solve', 1, qrd);
		_chkMatrix('solve', 2, B);
		with (qrd) {
			if (B.m != m) {
        dealWithError( '***ERROR: in QRDecomposition.solve: matrix row dimensions don\'t agree.');
			}
			if (!QRDecomposition.isFullRank(qrd)) {
        dealWithError( '***ERROR: in QRDecomposition.solve: matrix is rank deficient.');
			}
			// copy right hand side
			var nx = B.n;
			var Xm = Matrix.create(B.mat);
			var X = Xm.mat;
			// compute Y = transpose(Q)*B
			for (var k = 0; k < n; k++) {
				for (var j = 0; j < nx; j++) {
					var s = 0.0;
					for (var i = k; i < m; i++) {
						s += QR[i][k] * X[i][j];
					}
					s = -s / QR[k][k];
					for (var i = k; i < m; i++) {
						X[i][j] += s * QR[i][k];
					}
				}
			}
			// Solve R*X = Y;
			for (var k = n - 1; k >= 0; k--) {
				for (var j = 0; j < nx; j++) {
					X[k][j] /= Rdiag[k];
				}
				for (var i = 0; i < k; i++) {
					for (var j = 0; j < nx; j++) {
						X[i][j] -= X[k][j] * QR[i][k];
					}
				}
			}
			// only need the first n rows
			var resmat = new Array(n);
			for (var i = 0; i < n; i++) {
				resmat[i] = X[i];
			}
		}
		return Matrix.create(resmat);
	}
	
}
function abs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.abs);
}

function acos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.acos);
}

function add(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a + b;
    });
}

add.base = 0;
function and(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a && b;
    });
}

and.base = true;
/**
 * Converts an array to object
 * Recursive, but only if neccessary.
 * If the array is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Array} arr  array to convert
 * @return {Object}      converted object
 */
function arrayToObject(arr) {
    if (arr instanceof Array) {
        var obj = {}; // Initialize the object
        for (var key in arr) {
            // go through each element in the object
            // and add them to the array at the same key

            if (arr instanceof Array) {
                obj[key] = arrayToObject(arr[key]);
            } else {
                obj[key] = arr[key];
            }
        }
        return obj;
    } else {
        return arr;
    }
}
function asin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.asin);
}

function at(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + '@' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (y instanceof Array) {
        // Recursive step, y is an array
        var result = [];
        for (var key in y) {
            result[key] = at(x, y[key]);
        }
        return result;
    } else {
        if (!isNaN(y)) {
            y = Math.round(y);
        }
        // Base: y is a scalar
        if (x instanceof Array) {
            if (x[y] === undefined) {
                return [];
            } else {
                return x[y];
            }
        } else {
            //If x is scalar we simply use x instead of x[y]
            return x;
        }
    }
}
function atan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.atan);
}

function atan2(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return Math.atan2(a, b);
    });
}
function bin(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (b > a) {
            return 0;
        } else {
            return factorial(a) / (factorial(b) * factorial(a - b));
        }
    });
}
/**
 * 
 * Applies the given function on the given array. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}   a        array taking the role of the first input of the function
 * @param  {Array}   b        array taking the role of the second input of the function
 * @param  {Function} func function that should be applied
 * @return {Array}            Resulting array.
 *
 * @memberof Model.Library
 */
function binaryZip(a, b, func) {
    var isScalarA = !(a instanceof Array);
    var isScalarB = !(b instanceof Array);

    if (!isScalarA || !isScalarB) {
        // Recursive step, a or b is an array
        var result = [];
        var key;

        if (isScalarA) {
            // Case, a is a scalar, b is an array
            for (key in b) {
                result[key] = binaryZip(a, b[key], func);
            }
            return result;
        }
        if (isScalarB) {
            // Case, b is a scalar, a is an array
            for (key in a) {
                result[key] = binaryZip(a[key], b, func);
            }
            return result;
        }
        // Case, a and b are both arrays
        for (key in a) {
            if (b[key] !== undefined) {
                result[key] = binaryZip(a[key], b[key], func);
            }
        }
        return result;
    } else {
        // Base: a and b are both scalar
        return func(a, b);
    }
}
/**
 * Placeholder function for the button function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @return {Array}     Empty array
 */
function button() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'button' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [];
}

button.isTimeDependent = true;
function ceil(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.ceil);
}

/**
 * Placeholder function for the check function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @param  {Boolean} def default value of the checkbox
 * @return {Array}     Singleton array with def
 */
function check(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'check' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (typeof def === 'boolean') {
        return [def];
    } else {
        throw new Error('Argument of check must be true or false');
    }
}

check.isTimeDependent = true;
var MINURLDELAY = 1000;
// every call to a url is protected by a timer to prevent bandwith exhaustion: one URL shall not be called more frequently than
// once every MINURLDELAY millisec. Calls that occur more frequently will simply return the same value as the previous call
// to that URL. A URL, here, is interpreted as the part prior to the question mark. Indeed, a same host can be spammed by a
// high frequent series of calls each time with different parameters. We don't both the same host more often than
// once every MINURLDELY millisec. On the other hand, we ensure that the parameters of every call are different, so that
// browsers cannot cache results ,thereby hiding any changes in server-side state.
var putChanTimers = [];
var getChanTimers = [];
// entries in the array urlTimers are distinguished by the host. That is, all calls to the keyMap-url are scheduled via the same array urlTimers. For this
// reason, there should not be two or more calls to getUrl in one script. In case multiple in- or out channels are needed, we can use the keyMap server, but
// then we need to schedule them based on the key-name. For this reason, we have two extra arrays with timers.

var urlTimers = [];

var E = Math.E;

var PI = Math.PI;
function cos(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.cos);
}

function cursorB() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.mouseButtonPressed;
}

cursorB.isTimeDependent = true;
function cursorX() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.mouseX;
}

cursorX.isTimeDependent = true;
function cursorY() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return exe.mouseY;
}

cursorY.isTimeDependent = true;
function debug(c, v) {
    if (typeof c === "string") {
        if (v instanceof Array) {
            var val = '';
            if (v['return'] !== undefined) {
                for (var k in v) {
                    val = val.concat(k).concat(":").concat(JSON.stringify(v[k])).concat(",");
                }
                // TODO, write message to debug windo or something
                //console.log(c + ": " + val.substring(0, val.length - 1));
                return v['return'];
            } else {
                throw new Error("\nFor function debug(), the second argument must be a vector, which must contain an element named 'return'");
            }
        } else {
            throw new Error("\nFor function debug(), the second argument must be a vector, the first element of which is returned to the caller");
        }
    } else {
        throw new Error("\nFor function debug(), the first argument must be a string (= text to help identify the debug output)");
    }
}
function divide(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a / b;
    });
}
function __do__(code, args) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (typeof code === "string") {
        if (args instanceof Object) {
            for (var arg in args) {
                var target = new RegExp('_' + arg, "g");
                code = code.replace(target, JSON.stringify(args[arg]));
                try {
                    // this is to protect against all disasters like syntax errors in the script string code we can't foresee
                    var res = (new Function(code))();
                    return res;
                } catch (err) {
                    return 'ERROR';
                }
            }
        } else {
            throw new Error("\nFor function do(), second argument must be a vector");
  
        }
    } else {
        throw new Error("\nFor function do(), first argument must be a string (= a code fragment)");
    }
}
function equal(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a == b;
    });
}
function exp(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.exp);
}

function factorial(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, function(a) {

        var factNum = [
            1,
            1,
            2,
            6,
            24,
            120,
            720,
            5040,
            40320,
            362880,
            3628800,
            39916800,
            479001600,
            6227020800,
            87178291200,
            1307674368000,
            20922789888000,
            355687428096000,
            6402373705728000,
            121645100408832000,
            2432902008176640000,
            51090942171709440000,
            1124000727777607680000,
            25852016738884976640000,
            620448401733239439360000,
            15511210043330985984000000,
            403291461126605635584000000,
            10888869450418352160768000000,
            304888344611713860501504000000,
            8841761993739701954543616000000,
            265252859812191058636308480000000,
            8222838654177922817725562880000000,
            263130836933693530167218012160000000,
            8683317618811886495518194401280000000,
            295232799039604140847618609643520000000,
            10333147966386144929666651337523200000000,
            371993326789901217467999448150835200000000,
            13763753091226345046315979581580902400000000,
            523022617466601111760007224100074291200000000,
            20397882081197443358640281739902897356800000000,
            815915283247897734345611269596115894272000000000,
            33452526613163807108170062053440751665152000000000,
            1405006117752879898543142606244511569936384000000000,
            60415263063373835637355132068513997507264512000000000,
            2658271574788448768043625811014615890319638528000000000,
            119622220865480194561963161495657715064383733760000000000,
            5502622159812088949850305428800254892961651752960000000000,
            258623241511168180642964355153611979969197632389120000000000,
            12413915592536072670862289047373375038521486354677760000000000,
            608281864034267560872252163321295376887552831379210240000000000,
            30414093201713378043612608166064768844377641568960512000000000000,
            1551118753287382280224243016469303211063259720016986112000000000000,
            80658175170943878571660636856403766975289505440883277824000000000000,
            4274883284060025564298013753389399649690343788366813724672000000000000,
            230843697339241380472092742683027581083278564571807941132288000000000000,
            12696403353658275925965100847566516959580321051449436762275840000000000000,
            710998587804863451854045647463724949736497978881168458687447040000000000000,
            40526919504877216755680601905432322134980384796226602145184481280000000000000,
            2350561331282878571829474910515074683828862318181142924420699914240000000000000,
            138683118545689835737939019720389406345902876772687432540821294940160000000000000,
            8320987112741390144276341183223364380754172606361245952449277696409600000000000000,
            507580213877224798800856812176625227226004528988036003099405939480985600000000000000,
            31469973260387937525653122354950764088012280797258232192163168247821107200000000000000,
            1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000,
            126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000,
            8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000,
            544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000,
            36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000,
            2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000,
            171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000,
            11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000,
            850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000,
            61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000,
            4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000,
            330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000,
            24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000,
            1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000,
            145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000,
            11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000,
            894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000,
            71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000,
            5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000,
            475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000,
            39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000,
            3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000,
            281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000,
            24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000,
            2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000,
            185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000,
            16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000,
            1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000,
            135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000,
            12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000,
            1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000,
            108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000,
            10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000,
            991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000,
            96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000,
            9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000,
            933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000,
            93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000
        ];

        if (a > 100 || a < 0) {
            throw new Error("The factorial of numbers less than 0 or greater than 100 are not supported.");
        } else {
            a = Math.round(a);
            return factNum[a];
        }
    });
}
function floor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.floor);
}

function foldl(a, func) {
    var result = func.base;
    if (a instanceof Array) {
        var length = a.length;
        for (var i = 0; i < length; i++) {
            result = func(result, a[i]);
        }
    } else {
        result = func(result, a);
    }
    return result;
}
function getChan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof x) == 'string') {
        var fnd = false;
        for (var i = 0; i < getChanTimers.length; i++) {
            if (getChanTimers[i].chanName == x) {
                // ithis channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - getChanTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return getChanTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from channel ' + x + '; status=' + status.response);
                            getChanTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    getChanTimers[i].time = chanTime;
                    return getChanTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = getChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            getChanTimers[k] = {
                'returnValue': 0,
                'time': chanTime,
                'chanName': x
            };
            var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from channel; status=' + status.response);
                    getChanTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getChan() must be a string");
    }

}
function getTime() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return Date.now();
}

getTime.isTimeDependent = true;
function getUrl(url) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof url) == 'string') {
        var comps = url.split('?');
        // comps[0] is the part of the URL. Check if this occurs in the array 
        var fnd = false;
        for (var i = 0; i < urlTimers.length; i++) {
            if (urlTimers[i].baseName == comps[0]) {
                // it exists. See at what time we called it.
                fnd = true;
                var urlDate = new Date();
                var urlTime = urlDate.getTime();
                if (urlTime - urlTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return urlTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from server; status=' + status.response);
                            urlTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    urlTimers[i].time = urlTime;
                    return urlTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = urlTimers.length;
            var urlDate = new Date();
            var urlTime = urlDate.getTime();
            urlTimers[k] = {
                'returnValue': 0,
                'time': urlTime,
                'baseName': comps[0]
            };
            var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from server; status=' + status.response);
                    urlTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getURL() must be a string");
    }

}
function greaterThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a > b;
    });
}
function greaterThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a >= b;
    });
}
function history(quantity, time) {
    if (time < 1) {
        throw new Error('For delayed quantities, the value must be at least 1');
    }

    quantity = exe[quantity];
    if (time > quantity.timespan) {
        quantity.timespan = time;
    }

    var historyValue = quantity.hist[time];
    if (historyValue === undefined) {
        return 0;
    } else {
        return historyValue;
    }
}//This function was taken from keesvanoverveld.com
function iConvolve(x,y,n1,n2,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (y instanceof Array) {
                var p1 = y.length;
                if (y[0] instanceof Array) {
                    var p2 = y[0].length;
                    if (!(n1 instanceof Array) && !(n2 instanceof Array)) {
                        n1 = Math.round(n1);
                        n2 = Math.round(n2);
                        var res = [];
                        var index1, index2;
                        switch (m) {
                            case 0:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            while (index1 < 0)
                                                index1 += r1;
                                            while (index1 >= r1)
                                                index1 -= r1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                while (index2 < 0)
                                                    index2 += r2;
                                                while (index2 >= r2)
                                                    index2 -= r2;
                                                res[i][ii] += x[index1][index2] * y[j][jj];
                                            }
                                        }
                                    }
                                }
                                return res;
                            case 1:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                if (index1 >= 0 && index1 < r1) {
                                                    if (index2 >= 0 && index2 < r2) {
                                                        res[i][ii] += x[index1][index2] * y[j][jj];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                return res;
                            case 2:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            index1 = index1 < 0 ? 0 : index1 >= r1 ? r1 - 1 : index1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                index2 = index2 < 0 ? 0 : index2 >= r2 ? r2 - 1 : index2;
                                                res[i][ii] += x[index1][index2] * y[j][jj];
                                            }
                                        }
                                    }
                                }
                                return res;
                            default:
                                throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                        }
                    } else {
                        throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
                    }
                } else {
                    return [];
                }
            } else {
                return [];
            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    n1 = Math.round(n1);
    n2 = Math.round(n2);
    if (n1 >= 0 && n2 >= 0) {
        var t = [];
        var sum = 0;
        var x1 = -(n1 - 1) / 2;
        var x2 = -(n2 - 1) / 2;
        var denom1 = 2 * s1 * s1;
        var denom2 = 2 * s2 * s2;
        for (i = 0; i < n1; i++) {
            t[i] = [];
            x2 = -(n2 - 1) / 2;
            for (j = 0; j < n2; j++) {
                t[i][j] = Math.exp(-x1 * x1 / denom1 - x2 * x2 / denom2);
                sum += t[i][j];
                x2 += 1;
            }
            x1 += 1;
        }
        for (i = 0; i < n1; i++) {
            for (j = 0; j < n2; j++)
                t[i][j] /= sum;

        }
        return t;
    } else {
        throw new Error("\niGaussian: cannot make an array with <0 elements");
    }
}
//This function was taken from keesvanoverveld.com
function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r1 = Math.round(nrRows);
    var r2 = Math.round(nrCols);
    if (r1 >= 0 && r2 >= 0) {
        var rr = [];
        for (i = 0; i < r1; i++) {
            rr[i] = [];
            for (j = 0; j < r2; j++) {
                rr[i][j] = x;
            }
        }
        return rr;
    } else {
        return [];
    }
}
function iMedian(x,n,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = objectToArray(x);
    n = objectToArray(n);
    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var nn = ((2 * n + 1) * (2 * n + 1) - 1) / 2;
                var j = 0;
                var jj = 0;
                var res = [];
                var st = [];
                var ppp, index1, index2;
                switch (m) {
                    case 0:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                st = [];
                                for (j = -n; j <= n; j++) {
                                    index1 = i + j;
                                    while (index1 < 0)
                                        index1 += r1;
                                    while (index1 >= r1)
                                        index1 -= r1;
                                    for (jj = -n; jj <= n; jj++) {
                                        index2 = ii + jj;
                                        while (index2 < 0)
                                            index2 += r2;
                                        while (index2 >= r2)
                                            index2 -= r2;
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                    case 1:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                st = [];
                                for (j = -n; j <= n; j++) {
                                    if (i + j >= 0 && i + j < r1) {
                                        for (jj = -n; jj <= n; jj++) {
                                            if (ii + jj >= 0 && ii + jj < r2) {
                                                st.push(x[i + j][ii + jj]);
                                            }
                                        }
                                    }
                                }
                                st.sort();
                                ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                    case 2:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                st = [];
                                for (j = -n; j <= n; j++) {
                                    index1 = i + j;
                                    index1 = index1 < 0 ? 0 : (index1 >= r1 ? r1 - 1 : index1);
                                    for (jj = -n; jj <= n; jj++) {
                                        index2 = ii + jj;
                                        index2 = index2 < 0 ? 0 : (index2 >= r2 ? r2 - 1 : index2);
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                    default:
                        throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
            }

        } else {
            return [];
        }
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function iSpike(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r1 = Math.round(y1);
    var r2 = Math.round(y2);
    var p1 = Math.round(x1);
    var p2 = Math.round(x2);
    var rr = [];
    for (i = 0; i < r1; i++) {
        rr[i] = [];
        for (j = 0; j < r2; j++) {
            if (i == p1 && j == p2) {
                rr[i][j] = 1;
            } else {
                rr[i][j] = 0;
            }
        }
    }
    return rr;
}
function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    function doIf(cond, tr, fa) {
        if (cond) {
            return tr;
        } else {
            return fa;
        }
    }

    if (condition instanceof Array) {
        return zip([condition, ifTrue, ifFalse], doIf);
    } else {
        return doIf(condition, ifTrue, ifFalse);
    }
}
function imply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return !a || b;
    });
}
/**
 * Placeholder function for the input function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @param  {Number|String|Boolean} def Default value of input field
 * @return {Array}     Singleton array with def
 * @memberof Model.Library
 */
function input(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'input' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [def];
}

input.isTimeDependent = true;
function lessThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a < b;
    });
}
function lessThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a <= b;
    });
}
function ln(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.log);
}

function log(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        return Math.log(a) / Math.log(10);

    });   
}
/*  ======================================= MATRICES =====================================

Description: Javascript routines to handle matrices (2D arrays).
Stored as methods of the global variable Matrix.
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: Peter Coxhead, 2008-2009; released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 July 2009
 */
var version = 'Matrix 1.01';
var errorCallback=null;
/*

Uses IOUtils.js, LUDecomposition.js, QRDecomposition.js, EVDecomposition.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

The useful fields of a Matrix object are:
m    number of rows
n    number of columns
mat  the matrix as an array of m entries, each being arrays of n entries.

Matrix.getEPS(): in any matrix calculation, an absolute value less than Matrix.getEPS()
is replaced by 0. The default value is 2^-40 (~9e-13). Set to a different value if you
want more or less precision.
Matrix.setEPS(newEPS): see above.

Matrix.create(arr): creates a Matrix object to represent the two-dimensional
array arr. The value of arr is copied.
Matrix.create(m,n): creates a Matrix object to represent an m-by-n matrix,
whose values are undefined.

Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity matrix.
Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-m unit matrix.
Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
random values such that 0 <= result[i][j] < 1.

Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
m-by-n.

Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
Matrix object mo.

Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
mo.
Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
function then returns an m-by-m Matrix object with this vector as its diagonal
and all off-diagonal elements set to 0.

Matrix.max(mo): returns the largest entry in the matrix.
Matrix.min(mo): returns the smallest entry in the matrix.

Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
scaled by scalar.

Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and mo2.

Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
each element of the Matrix object mo.  f must be a function of one argument.
Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
to each element of the Matrix object mo1 and the corresponding element of the Matrix
element mo2 (which must be of the same dimension).  f must be a function of two
arguments.

Matrix.trace(mo): returns the trace of the Matrix object mo.
Matrix.det(mo): returns the determinant of the Matrix object mo, which must be square.

Matrix.inverse(mo): returns the inverse of the Matrix object mo.

Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
If A is square, the solution is exact; if A has more rows than columns, the solution
is least squares. (No solution is possible if A has fewer rows than columns.)
Uses LUDecomposition.js and QEDecomposition.js.

Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
fields contain the eigenvectors and eigenvalues. The fields are as follows:
V    the columnwise eigenvectors as a Matrix object
lr   the real parts of the eigenvalues as an array
li   the imaginary parts of the eigenvalues as an array
L    the block diagonal eigenvalue matrix as a Matrix object
isSymmetric   whether the matrix is symmetric or not (boolean).

Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
omitted, the default in IOUtils.js is used.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, EVDecomposition.js and LUDecomposition.js.)

with (Matrix){ var A = create([[1,2,4],[8,2,1],[-2,3,0]]);
println('A');
display(A,0);

var Ainv = inverse(A);
nl(); println('inverse(A)*A');
display(mult(Ainv,A));
nl(); println('inverse(A)*A - I');
display(sub(mult(Ainv,A),identity(A.n,A.m)));

var B = random(3,2);
nl(); println('B');
display(B);
var X = solve(A,B);
nl(); println('X obtained by solving A*X = B');
display(X);
nl(); println('A*X - B');
display(sub(mult(A,X),B));

var es = eigenstructure(A);

nl(); println('V (eigenvectors for A)');
display(es.V);
nl(); println('L (block diagonal eigenvalue matrix for A)');
display(es.L);
nl(); println('A*V - V*L');
display(sub(mult(A,es.V),mult(es.V,es.L)));
nl(); println('A - V*L*inverse(V)');
display(sub(A,mult(es.V,mult(es.L,inverse(es.V)))));
}

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

var Matrix = new createMatrixPackage();

function dealWithError(a){
  if(errorCallback){
    errorCallback("Error occurred in matrix package ("+a+")");
  } else {
    alert("Error occurred in matrix package ("+a+"), but no errorCallback function was installed.");
  }
}
function createMatrixPackage() {
  
  
  
  
  // the provision of an errorCallback function was added by Kees van Overveld
  // (March 2012). This function can be defined externally;
  // it is called whenever an error condition occurs.
  // In case no error callback is installed, the error is communicated via an alert box.


  this.setErrorCallback=function(a){
    errorCallback=a;
  }


	this.version = version;
	
	var abs = Math.abs; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Any number whose absolute value is < EPS is taken to be 0.
	// Matrix.getEPS(): returns the current value of EPS.
	// Matrix.setEPS(): changes the current value of EPS.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var EPS = Math.pow(2, -40);
	this.getEPS = function () {
		return EPS;
	}
	this.setEPS = function (newEPS) {
		EPS = newEPS;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkNum is a private function used in replacing small values by 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkNum(x) {
		return (abs(x) < EPS) ? 0 : x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkMatrix is a private function which checks that argument i of
	//   the function whose name is fname and whose value is arg is a
	//   Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, i, arg) {
		if (!arg.isMatrix) {
      dealWithError('***ERROR: Argument ' + i + ' of Matrix.' + fname +
			' is not a Matrix; its value is "' + arg + '".');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.create(arr): creates a Matrix object to represent the two-dimensional
	//   array arr. The contents of arr are copied.
	// Matrix.create(m,n): creates a Matrix object to represent an m x n matrix,
	//   whose values are undefined.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (a1, a2) { // check args
		var isMatArg1 = a1 instanceof Array;
		if (!isMatArg1 && (typeof a1 != 'number')) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is not an array or a number.');
		}
		if (isMatArg1 && a2 != null) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is an array but argument 2 is also present.');
		}
		if (isMatArg1)
			return _createMatrixfromArray(a1);
		else
			return _createMatrixfromDimensions(a1, a2);
	}
	function _createMatrixfromArray(arr) {
		var m = arr.length;
		for (var i = 0; i < m; i++) {
			if (!(arr[i]instanceof Array)) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 is not a 2D array.');
			}
			if (arr[i].length != arr[0].length) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 has different length rows.');
			}
		}
		var n = arr[0].length;
		var res = new Array(m);
		for (var i = 0; i < m; i++) {
			res[i] = new Array(n);
			for (var j = 0; j < n; j++)
				res[i][j] = _chkNum(arr[i][j]);
		}
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = res;
		x.isMatrix = true;
		return x;
	}
	function _createMatrixfromDimensions(m, n) {
		var arr = new Array(m);
		for (var i = 0; i < m; i++)
			arr[i] = new Array(n);
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = arr;
		x.isMatrix = true;
		return x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity
	//   matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.identity = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = 0;
			for (var i = 0; i < Math.min(m, n); i++)
				mat[i][i] = 1;
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-n unit matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.unit = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = 1;
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
	//   random values such that 0 <= result[i][j] < 1.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.random = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(Math.random());
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
	//   of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
	//   m by n.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.copy = function (mo, fromRow, fromCol, m, n) {
		_chkMatrix('copy', 1, mo);
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = mo.mat[i + fromRow][j + fromCol];
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
	//   Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.transpose = function (mo) {
		_chkMatrix('transpose', 1, mo);
		var res = _createMatrixfromDimensions(mo.n, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = mo.mat[j][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
	//   an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
	//   mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diagOf = function (mo) {
		_chkMatrix('diagOf', 1, mo);
		var res = _createMatrixfromDimensions(Math.min(mo.m, mo.n), 1);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][0] = mo.mat[i][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
	//   function then returns an m-by-m Matrix object with this vector as its diagonal
	//   and all off-diagonal elements set to 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diag = function (mo) {
		_chkMatrix('diag', 1, mo);
		if (mo.n != 1) {
      dealWithError( '***ERROR: in Matrix.diag: argument 1 is not a column vector.');
		}
		var res = Matrix.identity(mo.m, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][i] = mo.mat[i][0];
		}
		return res;
	}
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.max(mo): returns the largest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.max = function (mo) {
		_chkMatrix('max', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] > res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.min(mo): returns the smallest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.min = function (mo) {
		_chkMatrix('min', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] < res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
	//   scaled by scalar.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.scale = function (mo, scalar) {
		_chkMatrix('scale', 1, mo);
		var res = _createMatrixfromArray(mo.mat);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = _chkNum(scalar * mat[i][j]);
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.add = function (mo1, mo2) {
		_chkMatrix('add', 1, mo1);
		_chkMatrix('add', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.add: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] + mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.sub = function (mo1, mo2) {
		_chkMatrix('sub', 1, mo1);
		_chkMatrix('sub', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      delaWithError( '***ERROR: in Matrix.sub: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] - mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and
	//   mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.mult = function (mo1, mo2) {
		_chkMatrix('mult', 1, mo1);
		_chkMatrix('mult', 2, mo2);
		if (mo1.n != mo2.m) {
      dealWithError( '***ERROR: in Matrix.mult: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo2.n);
		var temp;
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++) {
				temp = 0;
				for (var k = 0; k < mo1.n; k++)
					temp += mo1.mat[i][k] * mo2.mat[k][j];
				mat[i][j] = _chkNum(temp);
			}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
	//   each element of the Matrix object mo.  f must be a function of one argument.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.map = function (f, mo) {
		_chkMatrix('map', 2, mo);
		var res = _createMatrixfromDimensions(mo.m, mo.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
	//   to each element of the Matrix object mo1 and the corresponding element of the Matrix
	//   element mo2 (which must be of the same dimension).  f must be a function of two
	//   arguments.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.combine = function (f, mo1, mo2) {
		_chkMatrix('combine', 1, mo1);
		_chkMatrix('combine', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.combine: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo1.mat[i][j], mo2.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.trace(mo): returns the trace of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.trace = function (mo) {
		_chkMatrix('trace', 1, mo);
		var t = 0;
		with (mo)
		for (var i = 0; i < Math.min(m, n); i++)
			t += mat[i][i];
		return _chkNum(t);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.det(mo): returns the determinant of the Matrix object mo, which be square.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.det = function (mo) {
		_chkMatrix('det', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.det: argument is not square.');
		}
		with (LUDecomposition)
		return _chkNum(det(create(mo)));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.inverse(mo): returns the inverse of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.inverse = function (mo) {
		_chkMatrix('inverse', 1, mo);
		return Matrix.solve(mo, Matrix.identity(mo.m, mo.m));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
	//   If A is square, the solution is exact; if A has more rows than columns, the solution
	//   is least squares. (No solution is possible if A has fewer rows than columns.)
	//   Uses LUDecomposition.js and QRDecomposition.js.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (A, B) {
		_chkMatrix('solve', 1, A);
		_chkMatrix('solve', 2, B);
		if (A.m == A.n)
			with (LUDecomposition)return solve(create(A), B);
		else if (A.m > A.n)
			with (QRDecomposition) {
				var temp = create(A);
				return solve(temp, B);
			}
		else
      dealWithError( '***ERROR: in Matrix.solve: argument 1 has fewer rows than columns.');
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
	//    fields contain the eigenvectors and eigenvalues. The fields are as follows:
	//    V    the columnwise eigenvectors as a Matrix object
	//    lr   the real parts of the eigenvalues as an array
	//    li   the imaginary parts of the eigenvalues as an array
	//    L    the block diagonal eigenvalue matrix as a Matrix object
	//    isSymmetric   whether the matrix is symmetric or not (boolean).
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.eigenstructure = function (mo) {
		_chkMatrix('eigenstructure', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.eigenstructure: argument is not a square matrix.');
		}
		return EVDecomposition.create(mo);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
	//  omitted, the default in IOUtils.js is used.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.display = function (mo, dp) {
		_chkMatrix('display', 1, mo);
		if (dp == null)
			dp = 3;
		displayMat(mo.mat, null, null, dp);
	}
	
}
function max(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a,b) {
        return a < b ? b : a;
    });
}

max.base = -Infinity;
function min(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a,b) {
        return a < b ? a : b;
    });
}

min.base = Infinity;
function modulo(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (b !== 0.0) {
            var mm = a % b;
            if (mm >= 0) {
                return mm;
            } else {
                return mm + b;
            }
        } else {
            throw new Error("\ndivision by zero in modulo");
        }
    });
}
/**
 * Applies the given function on the given array of arrays. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 * @memberof Model.Library
 */
function multiaryZip(x, func) {
    var numArgs = x.length;
    var allScalar = true;
    for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
        if (x[inKey] instanceof Array) {
            // Determine if there is an array in the input.
            allScalar = false;
            break;
        }
    }
    if (allScalar) {
        // Base: all elements in x are scalar
        return func.apply(this, x);
    } else {
        // Return variable.
        var result = [];
        // Set of keys that are valid candidates for matching with the rest of the input,
        // thus having a potential place in the output.
        var referenceKeys;
        // Number of keys in the set of referenceKeys.
        var numKeys;
        var inkey;
        for (inKey = numArgs - 1; inKey >= 0; inKey--) {
            if (x[inKey] instanceof Array) {
                // Keys of contender for input of reference found.
                referenceKeys = Object.keys(x[inKey]);
                numKeys = referenceKeys.length;
                // Cut off the loop as soon as possible
                break;
            }
        }
        // True if resultKey occurs in every input in x.
        var isCommonKey;
        // Input to be used for the recursive call.
        var recursiveInput;
        for (var resultKey = numKeys - 1; resultKey >= 0; resultKey--) {
            // Start with empty input
            recursiveInput = [];
            // Key occurs in every input until proven otherwise.
            isCommonKey = true;
            // Loop over all inputs in x.
            for (inKey = numArgs - 1; inKey >= 0; inKey--) {
                if (x[inKey] instanceof Array) {
                    // Check if keys contained in all objects
                    if (x[inKey][referenceKeys[resultKey]] !== undefined) {
                        recursiveInput[inKey] = x[inKey][referenceKeys[resultKey]];
                    } else {
                        // Key does not occur in this array.
                        isCommonKey = false;
                        // Cut short loop to save processing time.
                        break;
                    }
                } else {
                    // Input x[inKey] is a scalar.
                    recursiveInput[inKey] = x[inKey];
                }
            }
            // Key occurs in all non-scalar inputs.
            if (isCommonKey) {
                // Put the recursive result in the representative key.
                result[referenceKeys[resultKey]] = multiaryZip(recursiveInput, func);
            }
        }
        return result;
    }
}
function multiply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a * b;
    });
}

multiply.base = 1;
function not(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        return !a;
    });
}
function notEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a != b;
    });
}
/**
 * Converts an object to array
 * Recursive, but only if neccessary.
 * If the object is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Object} obj object to convert
 * @param  {Boolean} Whether the function should be applied recursively.
 * @return {Array}      converted array
 */
function objectToArray(obj, nonRecursive) {
    if (!(obj instanceof Array) && obj instanceof Object) {
        var array = []; // Initialize the array
        for (var key in obj) {
            // go through each element in the object
            // and add them to the array at the same key

            if (!nonRecursive && !(obj[key] instanceof Array) && obj[key] instanceof Object) {
                array[key] = objectToArray(obj[key]);
            } else {
                array[key] = obj[key];
            }
        }
        return array;
    } else {
        return obj;
    }
}
function or(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a || b;
    });
}

or.base = false;
function paretoHor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function paretoMax(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function paretoMin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function paretoVer(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function plot(x) {
    exe.hasPlot = true;

    if (x instanceof Array) {
        exe.plot = x;
        if (exe.plotStatus === '') {
            return 'plot OK';
        } else {
            throw new Error(exe.plotStatus);
        }
    } else {
        var plotTypeError =
            "type mismatch in 'plot': argument must be of the form [graph1, graph2, ...]\n" +
            "so there must be a single argument which is a vector. Each of the (1 or more) graphs has the form\n" +
            "graphi=[control,data,data,data,...] where 'control' is a javascript array assigning values\n" +
            "to parameters, and the 'data'-elements are vectors of scalar data each.";
        throw new Error(plotTypeError);
    }
}
function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y, z], function(a, b, c) {
        if (a < 0 || b < 0) {
            throw new Error("The poisson of numbers less than 0 are not supported.");
        } else {
            if (!c) {
                return ((Math.pow(b, a) * Math.exp(-b)) / factorial(a));
            } else {
                var poisson;
                if (b < 20 && a < 20) {
                    poisson = 0;
                    var expY = Math.exp(-b);
                    var power = 1;
                    for (i = 0; i <= a; i++) {
                        poisson += expY * power / factorial(i);
                        power *= b;
                    }
                    return poisson;
                } else {
                    //from: http://www.questia.com/googleScholar.qst?docId=5000227714
                    a = Math.exp(-b);
                    poisson = a;
                    for (i = 2; i < a + 1; i++) {
                        a = a * b / (i - 1);
                        poisson += a;
                    }
                    return poisson;
                }
            }
        }
    });
}
function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (a >= 0) {
            return Math.pow(a, b);
        } else {
            // a<0
            if (b > 0) {
                return Math.pow(Math.abs(a), b);
            } else {
                if (b == parseInt(b)) {
                    if ((b % 2) === 0) {
                        return 1.0 / Math.pow(Math.abs(a), Math.abs(b));
                    } else {
                        return -1.0 / Math.pow(Math.abs(a), Math.abs(b));
                    }
                } else {
                    throw new Error("\npower of negative number to a non-integer exponent is not defined in the real numbers (would be a complex number)");
                }
            }
        }
    });
}
function putChan(myChannelName,myValue) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof myChannelName) == 'string') {
        var value = arrayToObject(myValue);
        var fnd = false;
        for (var i = 0; i < putChanTimers.length; i++) {
            if (putChanTimers[i].chanName == myChannelName) {
                // this channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - putChanTimers[i].time < MINURLDELAY) {
                    return myValue;
                } else {
                    // we can call the server again.
                    var encodedData = JSON.stringify(value);
                    var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl
                    });
                    putChanTimers[i].time = chanTime;
                    return myValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = putChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            putChanTimers[k] = {
                'returnValue': value,
                'time': chanTime,
                'chanName': myChannelName
            };
            var encodedData = JSON.stringify(value);
            var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl
            });
            return myValue;
        }
    } else {
        throw new Error("\nfirst argument of putChan() must be a string");
    }
}
function ramp(x, x1, y1, x2, y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var rmp = 0;
    if (x1 != x2) {
        if (x < x1) {
            rmp = y1;
        } else {
            if (x > x2) {
                rmp = y2;
            } else {
                rmp = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
            }
        }
    } else {
        rmp = ((x2 + y2)) / 2.0;
    }
    return rmp;
}
function random() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

	return Math.random();
}

random.isTimeDependent = true;
function round(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.round);
}

function sin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.sin);
}

/**
 * Placeholder function for the slider function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @pre min <= def <= max
 * @param  {Number} def Deafault value of the slider
 * @param  {Number} min Lower bound
 * @param  {Number} max Upper Bound
 * @return {Array}     Array with def,min,max
 */
function slider(def, min, max) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'Slider' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (isNaN(parseFloat(def)) || isNaN(parseFloat(min)) || isNaN(parseFloat(max))) {
        throw new Error('Arguments of slider must be numeric constants.');
    }

    if (min <= def && def <= max) {
        return [def, min, max];
    } else {
        throw new Error('For the slider, the default value must be between the lower and upper bound.' +
            ' Also the upper bound must be greater than the lower bound' +
            ' (Default = ' + def + ', lower = ' + min + ', upper = ' + max + ')');
    }
}

slider.isTimeDependent = true;
function sqrt(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.sqrt);
}

function subtract(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a - b;
    });
}
function sum() {
    return zip(arguments, function() {
        var _sum = 0;
        for (var i = arguments.length - 1; i >= 0; i--) {
            _sum += arguments[i];
        }
        return _sum;
    });
}
function tan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.tan);
}

/**
 * Applies the given function on the given array or scalar. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array | Number}   a        array or scalar to which the given function should be applied
 * @param  {Function} func function that should be applied
 * @return {Array | Number}            Result of applying operator.
 *
 * @memberof Model.Library
 */
function unaryZip(a, func) {
    if (a instanceof Array) {
        // Recursive step, a is an array
        var result = [];
        for (var key in a) {
            result[key] = unaryZip(a[key], func);
        }
        return result;
    } else {
        // Base: a is a scalar
        return func(a);
    }
}
function uniminus(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        return -a;
    });
}
//This function was taken from keesvanoverveld.com
function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var iLow, r;
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                iLow = Math.min(x.length, Math.max(0, z));
                r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                for (i = 0; i < y.length; i++) {
                    r[i + iLow] = y[i];
                }
                for (i = iLow; i < x.length; i++) {
                    r[i + y.length] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        } else {
            // we interpret the scala element to be inserted as if it is a vector with length 1
            if (!(z instanceof Array)) {
                iLow = Math.min(x.length, Math.max(0, z));
                r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                r[iLow] = y;
                for (i = iLow; i < x.length; i++) {
                    r[i + 1] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        }
    } else {
        throw new Error("vAggregate: first argument must be a vector");
    }
}
function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var result = [];
        for (var key in x) {
            result[key] = x[key];
        }
        result[x.length] = y;
        return result;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var p = [];
    var k;
    if (!(x instanceof Array)) {
        p.push(x);
    } else {
        for (k in x) {
            p.push(x[k]);
        }
    }
    if (!(y instanceof Array)) {
        p.push(y);
    } else {
        for (k in y) {
            p.push(y[k]);
        }
    }
    return p;
}

vConcat.base = [];
 //This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var r = x.length;
        if (y instanceof Array) {
            var p = y.length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var res = [];
                var rr, index;
                switch (m) {
                    case 0:
                        for (i = 0; i < r; i++) {
                            rr = 0;
                            for (j = 0; j < p; j++) {
                                index = i + j - n;
                                while (index < 0)
                                    index += r;
                                while (index >= r)
                                    index -= r;
                                rr += x[index] * y[j];
                            }
                            res[i] = rr;
                        }
                        return res;
                    case 1:
                        for (i = 0; i < r; i++) {
                            rr = 0;
                            for (j = 0; j < p; j++) {
                                index = i + j - n;
                                if (index >= 0 && index < r) {
                                    rr += x[index] * y[j];
                                }
                            }
                            res[i] = rr;
                        }
                        return res;
                    case 2:
                        for (i = 0; i < r; i++) {
                            rr = 0;
                            for (j = 0; j < p; j++) {
                                index = i + j - n;
                                index = index < 0 ? 0 : (index >= r ? r - 1 : index);
                                rr += x[index] * y[j];

                            }
                            res[i] = rr;
                        }
                        return res;
                    default:
                        throw new Error("convolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("convolution: auto-mapping is not supported, third argument must be scalar.");

            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var p = [];
        var key = 0;
        for (i = 0; i < x.length; i++) {
            p.push(i);
        }
        for (key in x) {
            if (isNaN(key)) {
                p.push(key);
            }
        }
        return p;
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function vDot(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var a = 0;
    var i;

    if (x instanceof Array) {
        if (y instanceof Array) {
            for (i in x) {
                if (y[i] !== undefined) {
                    if (!(x[i] instanceof Array) && !(y[i] instanceof Array)) {
                        a += (x[i] * y[i]);
                    }
                }
            }
            return a;
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    a += y * x[i];
                }
            }
            return a;
        }
    } else {
        if (!(y instanceof Array)) {
            return x * y;
        } else {
            for (i in y) {
                if (!(y[i] instanceof Array)) {
                    a += x * y[i];
                }
            }
            return a;
        }
    }
}
function vEigenSystem(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length === n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aEig = Matrix.eigenstructure(aA);
            // aEig.lr=the vector of real parts of the eigenvalues
            // aEig.li=the vector of imaginary parts of eigenvalues
            // eEig.V=matrix of eigenvectors
            var ttt = [];
            // first lr
            ttt[0] = [];
            for (i = 0; i < aEig.lr.length; i++) {
                ttt[0][i] = aEig.lr[i];
            }
            // next li
            ttt[1] = [];
            for (i = 0; i < aEig.li.length; i++) {
                ttt[1][i] = aEig.li[i];
            }
            // next V
            ttt[2] = [];
            for (i = 0; i < aEig.V.mat.length; i++) {
                var vvv = [];
                ttt[2][i] = [];
                for (var j = 0; j < aEig.V.mat[i].length; j++) {
                    vvv[j] = aEig.V.mat[i][j];
                }
                ttt[2][i] = vvv;
            }
            return ttt;
        } else {
            throw new Error("\nvEigenSystem: cannot calculate eigensystem for non-square matrix");
        }
    } else {
        return;
        // if x is a scalar, the real part of the eigenvalue is equal to that scalar;
        // the iumaginary part is 0, and the eigenvector is the vector [1]
        // [x, 0, [1]];
    }
}
function vExtend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var k;
    var p = [];
    if (!(x instanceof Array)) {
        if (y instanceof Array) {
            p.push(x);
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
            return p;
        } else {
            return [x, y];
        }
    } else {
        for (k in x) {
            p[k] = x[k];
        }
        if (y instanceof Array) {
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
        } else {
            p.push(y);
        }
        return p;
    }
}

vExtend.base = [];
//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof Array) && !(y instanceof Array)) {
        var n = Math.round(x);
        var s = y;
        if (n >= 0) {
            var t = [];
            var sum = 0;
            x = -(n - 1) / 2;
            var denom = 2 * s * s;
            for (i = 0; i < n; i++) {
                t[i] = Math.exp(-x * x / denom);
                sum += t[i];
                x += 1;
            }
            for (i = 0; i < n; i++) {
                t[i] /= sum;
            }
            return t;
        } else {
            throw new Error("vGaussian: cannot make a vector with <0 elements");
        }
    } else {
        throw new Error("vGaussian: both arguments must be scalar.");
    }
}
function vLen(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof Array)) {
        return 0;
    }
    
    return x.length;
}
function vMake(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    result = [];
    for (var i = 0; i < y; i++) {
        result[i] = x;
    }

    return result;
}
function vMatInverse(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aInv = Matrix.inverse(aA);
            for (i = 0; i < aInv.mat.length; i++) {
                var tt = [];
                for (j = 0; j < aInv.mat[i].length; j++) {
                    tt[j] = aInv.mat[i][j];
                }
                t[i] = tt;
            }
            return t;
        } else {
            throw new Error("\nvMatInverse: cannot take inverse of non-square matrix");
        }
    } else {
        return 1 / x;
    }
}
//This function was taken from keesvanoverveld.com
function vMatMatMul(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var trueMatrix1, i, j, k, a, m, r;
    if (x instanceof Array) {
        var trueMatrix0 = false;
        for (i in x) {
            if (x[i] instanceof Array) {
                trueMatrix0 = true;
            }
        }
        if (trueMatrix0) {
            if (y instanceof Array) {
                trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    m = [];
                    for (i in x) {
                        r = [];
                        for (j in y) {
                            if (y[j] instanceof Array) {
                                for (k in y[j]) {
                                    if (x[i][j] !== undefined) {
                                        if (y[j][k] !== undefined) {
                                            if (!(x[i][j] instanceof Array) && !(y[j][k] instanceof Array)) {
                                                var t = x[i][j] * y[j][k];
                                                if (r[k]) {
                                                    r[k] += t;
                                                } else {
                                                    r[k] = t;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        m[i] = r;
                    }
                    return m;
                } else {
                    // y is not a matrix but a vector; x is a true matrix. So this is a matrix-vector product or a matrix-scalar product.
                    r = [];
                    for (i in x) {
                        a = 0;
                        if (x[i] instanceof Array) {
                            for (j in x[i]) {
                                if (y[j] !== undefined) {
                                    if (!(x[i][j] instanceof Array) && !(y[j] instanceof Array)) {
                                        a += x[i][j] * y[j];
                                    }
                                }
                            }
                            r[i] = a;
                        }
                    }
                    return r;
                }
            } else {
                // x is a matrix and y is a scalar. Return the matrix, multiplied by the scalar (this would
                // also be achieved by auto mapping the multiplication)
                m = [];
                for (i in x) {
                    r = [];
                    if (x[i] instanceof Array) {
                        for (j in x[i]) {
                            if (!(x[i][j] instanceof Array)) {
                                r[j] = x[i][j] * y;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            }
        } else {
            // the argument x is a vector of scalars, not a true matrix. Perhaps y is a matrix.
            if (y instanceof Array) {
                trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    // yes, so we do a matrix-vector product
                    r = [];
                    for (i in x) {
                        if (y[i] !== undefined) {
                            if (y[i] instanceof Array) {
                                for (j in y[i]) {
                                    if (!(y[i][j] instanceof Array)) {
                                        if (r[j] !== undefined) {
                                            r[j] += x[i] * y[i][j];
                                        } else {
                                            r[j] = x[i] * y[i][j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return r;
                } else {
                    // y is not a matrix but a vector; x is also a vector. So we calculate the dot product -
                    // treating the vector y as a column rather than as the row that it actually is..
                    a = 0;
                    for (i in x) {
                        if (y[i] !== undefined) {
                            if (!(y[i] instanceof Array)) {
                                a += x[i] * y[i];
                            }
                        }
                    }
                    // what should we do - return this as a number or as a 1x1 matrix? Choose to return it as a number.
                    return a;
                }
            } else {
                // so x is a vector and y is a scalar.
                r = [];
                for (i in x) {
                    if (!(x[i] instanceof Array)) {
                        r[i] = x[i] * y;
                    }
                }
                return r;
            }
        }
    } else {
        // x is a scalar. Perhaps y is a matrix.
        if (y instanceof Array) {
            trueMatrix1 = false;
            for (i in y) {
                if (y[i] instanceof Array)
                    trueMatrix1 = true;
            }
            if (trueMatrix1) {
                // so x is a scalar and y is a matrix.
                m = [];
                for (i in y) {
                    r = [];
                    if (y[i] instanceof Array) {
                        for (j in y[i]) {
                            if (!(y[i][j] instanceof Array)) {
                                r[j] = y[i][j] * x;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            } else {
                // x is a scalar and y is a vector.
                r = [];
                for (i in y) {
                    if (!(y[i] instanceof Array)) {
                        r[i] = y[i] * x;
                    }
                }
                return r;
            }
        } else {
            // x is a scalar and y is a scalar: just return their product
            return x * y;
        }
    }
}
function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    var isOK = true;
    var t = [];
    var u = [];

    if (mm instanceof Array) {
        // n is number of rows; m is number of columns of the matrix (=mm)
        var n = mm.length;
        if (mm[0] instanceof Array) {
            var m = mm[0].length;
            if (v instanceof Array) {
                if (m <= n && v.length == n) {
                    for (i = 0; i < n; i++) {
                        t[i] = [];
                        if (mm[i] instanceof Array) {
                            if (mm[i].length == m) {
                                for (j = 0; j < m; j++) {
                                    if (!(mm[i][j] instanceof Array)) {
                                        t[i][j] = mm[i][j];
                                    } else {
                                        throw new Error("\nvMatSolve: every matrix element must be scalar");
                                    }
                                }
                            } else {
                                throw new Error("\nvMatSolve: every row in left hand side must be of equal length");
                            }
                        } else {
                            throw new Error("\nvMatSolve: every row in left hand side must be a vector");
                        }
                    }
                    // next assemble the right hand vector
                    for (i = 0; i < n; i++) {
                        if (!(v[i] instanceof Array)) {
                            u[i] = [];
                            u[i][0] = v[i];
                        } else {
                            throw new Error("\nvMatSolve: non-scalar element found in right-hand side");
                        }
                    }
                } else {
                    throw new Error("\nvMatSolve: nr. rows of right hand side must be equal to nr. columns of left hand side, and the number of rows of the matrix must not be smaller than the number of columns");
                }
            } else {
                throw new Error("\nvMatSolve: right hand side must be vector");
            }
        } else {
            throw new Error("\nvMatSolve: left hand side must be vector of vectors");
        }
    } else {
        throw new Error("\nvMatSolve: first argument must be vector");
    }
    if (isOK) {
        var aA = Matrix.create(t);
        var aB = Matrix.create(u);
        var aSol = Matrix.solve(aA, aB);
        var tt = [];
        for (i = 0; i < aSol.mat.length; i++) {
            tt[i] = aSol.mat[i][0];
        }
        return tt;
    }
}
//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += Math.abs(x[i]);
            }
        }
        return a;
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormEuclid(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return Math.sqrt(a);
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        // we support also strings that are to be concatenated.
        // Hence the initialisation cannot simply be var a=0; we must leave the type of a open until after
        // the first assignment;
        var a;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                if (a !== undefined) {
                    a += x[i];
                } else {
                    a = x[i];
                }
            }
        }
        return a;
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormSq(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return a;
    } else {
        return x * x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormalize(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var a = 0;
    var i;

    if (x instanceof Array) {
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        var nn = Math.sqrt(a);
        var rr = [];
        if (nn > 0) {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = x[i] / nn;
                } else {
                    rr[i] = x[i];
                }
            }
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = 0;
                } else {
                    rr[i] = x[i];
                }
            }
        }
        return rr;
    } else {
        return 1;
    }
}
//This function was taken from keesvanoverveld.com
function vRange(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var p = [];
        for (var k in x) {
            p.push(x[k]);
        }
        return p;
    } else {
        return [x];
    }
}
//This function was taken from keesvanoverveld.com
function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        if (!(y instanceof Array)) {
            if (!(z instanceof Array)) {
                var iLow = Math.max(0, y);
                var iHi = Math.min(x.length, z);
                var r = [];
                var i;
                for (i = iLow; i < iHi; i++) {
                    r[i - iLow] = x[i];
                }
                i = iHi - iLow;
                while (i < z - y) {
                    r[i] = 0;
                    i++;
                }
                return r;
            } else {
                throw new Error("vSegment: third argument must be a scalar.");
            }
        } else {
            throw new Error("vSegment: second argument must be a scalar.");
        }
    } else {
        throw new Error("vSegment: first argument must be a vector.");
    }
}
//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof Array) && !(y instanceof Array)) {
        var p = [];
        for (var k = x; k < y; k++) {
            p.push(k);
        }
        return p;
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function vSequence(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return vSeq(x, y);
}
//This function was taken from keesvanoverveld.com
function vSpike(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r = Math.round(y);
    var p = Math.round(x);
    var rr = [];
    for (var i = 0; i < r; i++) {
        if (i === p) {
            rr[i] = 1;
        } else {
            rr[i] = 0;
        }
    }
    return rr;
}
//This function was taken from keesvanoverveld.com
function vTranspose(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var trueMatrix = false;
        var i;

        for (i in x) {
            if (x[i] instanceof Array)
                trueMatrix = true;
        }
        if (trueMatrix) {
            var r = [];
            var j;
            for (i in x) {
                if (x[i] instanceof Array) {
                    for (j in x[i]) {
                        if (r[j] === undefined) {
                            r[j] = [];
                        }
                        r[j][i] = x[i][j];
                    }
                } else {
                    if (r[j] === undefined) {
                        r[j] = [];
                    }
                    r[j][0] = x[i];
                }
            }
            return r;
        } else {
            // x is a vector, but not a matrix. Tow options:
            // consider the argument as [[1,2,3]] and return [[1],[2],[3]] - or consider it just as a list [1,2,3]  and merely return [1,2,3]. We prefer the latter.
            return x;
        }
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vVecRamp(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    // arguments: x is a vector of abcissae
    // y is a vector of ordinates
    // z is an abcissa-value
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                // simply ignore elements at the tail in case on of the two vectors is too long
                var len = Math.min(x.length, y.length);
                // it may be necessary to sort the keys - hopefully not, but it takes
                // little time at least to check
                var sorted = false;
                var scalarOK = true;
                while (!sorted && scalarOK) {
                    sorted = true;
                    for (var i = 0; i < len - 1; i++) {
                        if (!(x[i] instanceof Array)) {
                            if (!(x[i + 1] instanceof Array)) {
                                if (x[i] > x[i + 1]) {
                                    var swap = x[i];
                                    x[i] = x[i + 1];
                                    x[i + 1] = swap;
                                    // don't forget to swap the ordinate values as well!
                                    swap = y[i];
                                    y[i] = y[i + 1];
                                    y[i + 1] = swap;
                                    sorted = false;
                                }
                            } else
                                scalarOK = false;
                        } else
                            scalarOK = false;
                    }
                }
                if (scalarOK) {
                    //first do a binary search - assume that the keys are sorted!
                    //We have to find the index i such that the probe is enclosed between heap(i) and heap(i+1).
                    var lo = 0;
                    var hi = len;
                    var mi = len / 2;
                    if (z <= x[0]) {
                        return y[0];
                    }
                    if (z >= x[len - 1]) {
                        return y[len - 1];
                    }
                    var nrtrials = 0;
                    while (hi > lo + 1 && nrtrials < 20) {
                        mi = Math.round((hi + lo) / 2);
                        if (z >= x[mi])
                            lo = mi;
                        if (z <= x[mi])
                            hi = mi;
                        nrtrials++;
                    }
                    if (nrtrials < 20) {
                        if (x[lo + 1] > x[lo]) {
                            return y[lo] + (z - x[lo]) * (y[lo + 1] - y[lo]) / (x[lo + 1] - x[lo]);
                        } else {
                            return 0.5 * (y[lo] + y[lo + 1]);
                        }
                    } else {
                        throw new Error("vVecRamp: could not find enclosing interval for abcissa.");
                    }
                } else {
                    throw new Error("vVecRamp: not all the abcissae values are scalar.");
                }
            } else {
                throw new Error("vVecRamp: third argument of vVecRamp must be scalar (abcissa-value).");
            }
        } else {
            throw new Error("vVecRamp: second argument of vVecRamp must be vector (of ordinates).");
        }
    } else {
        throw new Error("vVecRamp: first argument of vVecRamp must be vector (of abcissae).");
    }
}
/**
 * Applies the given function on the given array of inputs. The function is aplied recursively,
 * so also to nested arrays. This fucntion is to be called by anything that wants to use either map, binaryZip or nzip.
 * This function automatically calls the most efficient function for the job.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 * @memberof Model.Library
 */
function zip(x, func) {
    var numArgs = x.length;
    switch (numArgs) {
        case 0:
            throw new error("Cannot zip with zero arguments, attempted by: " + arguments.callee.caller.name);
        case 1:
            return unaryZip(x[0], func);
        case 2:
            return binaryZip(x[0], x[1], func);
        default:
            return multiaryZip(x, func);
    }
}
function getChan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof x) == 'string') {
        var fnd = false;
        for (var i = 0; i < getChanTimers.length; i++) {
            if (getChanTimers[i].chanName == x) {
                // ithis channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - getChanTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return getChanTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from channel ' + x + '; status=' + status.response);
                            getChanTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    getChanTimers[i].time = chanTime;
                    return getChanTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = getChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            getChanTimers[k] = {
                'returnValue': 0,
                'time': chanTime,
                'chanName': x
            };
            var cmpUrl = "php/keyMapDBI.php?task=getTerm&key=" + x + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    getChanTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from channel; status=' + status.response);
                    getChanTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getChan() must be a string");
    }

}
function getTime() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return Date.now();
}

getTime.isTimeDependent = true;
function getUrl(url) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof url) == 'string') {
        var comps = url.split('?');
        // comps[0] is the part of the URL. Check if this occurs in the array 
        var fnd = false;
        for (var i = 0; i < urlTimers.length; i++) {
            if (urlTimers[i].baseName == comps[0]) {
                // it exists. See at what time we called it.
                fnd = true;
                var urlDate = new Date();
                var urlTime = urlDate.getTime();
                if (urlTime - urlTimers[i].time < MINURLDELAY) {
                    // it is not yet 2 seconds ago before we called this server .Let it sleep a little while more, and
                    return urlTimers[i].returnValue;
                    // just return the cached value.
                } else {
                    // we can call the server again.
                    var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl,
                        success: function(data, status) {
                            urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                        },
                        error: function(status) {
                            alert('ajax reports a problem retrieving data from server; status=' + status.response);
                            urlTimers[i].returnValue = "error";
                        },
                        dataType: "text"
                    });
                    urlTimers[i].time = urlTime;
                    return urlTimers[i].returnValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = urlTimers.length;
            var urlDate = new Date();
            var urlTime = urlDate.getTime();
            urlTimers[k] = {
                'returnValue': 0,
                'time': urlTime,
                'baseName': comps[0]
            };
            var cmpUrl = "php/otherSite.php?url=" + url + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl,
                success: function(data, status) {
                    urlTimers[i].returnValue = objectToArray(JSON.parse(data));
                },
                error: function(status) {
                    alert('ajax reports a problem retrieving data from server; status=' + status.response);
                    urlTimers[k].returnValue = "error";
                },
                dataType: "text"
            });
            return "error";
        }
    } else {
        throw new Error("\nargument of getURL() must be a string");
    }

}
function greaterThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a > b;
    });
}
function greaterThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a >= b;
    });
}
function history(quantity, time) {
    if (time < 1) {
        throw new Error('For delayed quantities, the value must be at least 1');
    }

    quantity = exe[quantity];
    if (time > quantity.timespan) {
        quantity.timespan = time;
    }

    var historyValue = quantity.hist[time];
    if (historyValue === undefined) {
        return 0;
    } else {
        return historyValue;
    }
}//This function was taken from keesvanoverveld.com
function iConvolve(x,y,n1,n2,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (y instanceof Array) {
                var p1 = y.length;
                if (y[0] instanceof Array) {
                    var p2 = y[0].length;
                    if (!(n1 instanceof Array) && !(n2 instanceof Array)) {
                        n1 = Math.round(n1);
                        n2 = Math.round(n2);
                        var res = [];
                        var index1, index2;
                        switch (m) {
                            case 0:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            while (index1 < 0)
                                                index1 += r1;
                                            while (index1 >= r1)
                                                index1 -= r1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                while (index2 < 0)
                                                    index2 += r2;
                                                while (index2 >= r2)
                                                    index2 -= r2;
                                                res[i][ii] += x[index1][index2] * y[j][jj];
                                            }
                                        }
                                    }
                                }
                                return res;
                            case 1:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                if (index1 >= 0 && index1 < r1) {
                                                    if (index2 >= 0 && index2 < r2) {
                                                        res[i][ii] += x[index1][index2] * y[j][jj];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                return res;
                            case 2:
                                for (i = 0; i < r1; i++) {
                                    res[i] = [];
                                    for (ii = 0; ii < r2; ii++) {
                                        res[i][ii] = 0;
                                        for (j = 0; j < p1; j++) {
                                            index1 = i + j - n1;
                                            index1 = index1 < 0 ? 0 : index1 >= r1 ? r1 - 1 : index1;
                                            for (jj = 0; jj < p2; jj++) {
                                                index2 = ii + jj - n2;
                                                index2 = index2 < 0 ? 0 : index2 >= r2 ? r2 - 1 : index2;
                                                res[i][ii] += x[index1][index2] * y[j][jj];
                                            }
                                        }
                                    }
                                }
                                return res;
                            default:
                                throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                        }
                    } else {
                        throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
                    }
                } else {
                    return [];
                }
            } else {
                return [];
            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function iGaussian(n1,n2,s1,s2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    n1 = Math.round(n1);
    n2 = Math.round(n2);
    if (n1 >= 0 && n2 >= 0) {
        var t = [];
        var sum = 0;
        var x1 = -(n1 - 1) / 2;
        var x2 = -(n2 - 1) / 2;
        var denom1 = 2 * s1 * s1;
        var denom2 = 2 * s2 * s2;
        for (i = 0; i < n1; i++) {
            t[i] = [];
            x2 = -(n2 - 1) / 2;
            for (j = 0; j < n2; j++) {
                t[i][j] = Math.exp(-x1 * x1 / denom1 - x2 * x2 / denom2);
                sum += t[i][j];
                x2 += 1;
            }
            x1 += 1;
        }
        for (i = 0; i < n1; i++) {
            for (j = 0; j < n2; j++)
                t[i][j] /= sum;

        }
        return t;
    } else {
        throw new Error("\niGaussian: cannot make an array with <0 elements");
    }
}
//This function was taken from keesvanoverveld.com
function iMake(x,nrRows,nrCols) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r1 = Math.round(nrRows);
    var r2 = Math.round(nrCols);
    if (r1 >= 0 && r2 >= 0) {
        var rr = [];
        for (i = 0; i < r1; i++) {
            rr[i] = [];
            for (j = 0; j < r2; j++) {
                rr[i][j] = x;
            }
        }
        return rr;
    } else {
        return [];
    }
}
function iMedian(x,n,m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    x = objectToArray(x);
    n = objectToArray(n);
    if (x instanceof Array) {
        var r1 = x.length;
        if (x[0] instanceof Array) {
            var r2 = x[0].length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var nn = ((2 * n + 1) * (2 * n + 1) - 1) / 2;
                var j = 0;
                var jj = 0;
                var res = [];
                var st = [];
                var ppp, index1, index2;
                switch (m) {
                    case 0:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                st = [];
                                for (j = -n; j <= n; j++) {
                                    index1 = i + j;
                                    while (index1 < 0)
                                        index1 += r1;
                                    while (index1 >= r1)
                                        index1 -= r1;
                                    for (jj = -n; jj <= n; jj++) {
                                        index2 = ii + jj;
                                        while (index2 < 0)
                                            index2 += r2;
                                        while (index2 >= r2)
                                            index2 -= r2;
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                    case 1:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                st = [];
                                for (j = -n; j <= n; j++) {
                                    if (i + j >= 0 && i + j < r1) {
                                        for (jj = -n; jj <= n; jj++) {
                                            if (ii + jj >= 0 && ii + jj < r2) {
                                                st.push(x[i + j][ii + jj]);
                                            }
                                        }
                                    }
                                }
                                st.sort();
                                ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                    case 2:
                        for (i = 0; i < r1; i++) {
                            res[i] = [];
                            for (ii = 0; ii < r2; ii++) {
                                res[i][ii] = 0;
                                st = [];
                                for (j = -n; j <= n; j++) {
                                    index1 = i + j;
                                    index1 = index1 < 0 ? 0 : (index1 >= r1 ? r1 - 1 : index1);
                                    for (jj = -n; jj <= n; jj++) {
                                        index2 = ii + jj;
                                        index2 = index2 < 0 ? 0 : (index2 >= r2 ? r2 - 1 : index2);
                                        st.push(x[index1][index2]);
                                    }
                                }
                                st.sort();
                                ppp = st[nn];
                                res[i][ii] = ppp;
                            }
                        }
                        return res;
                    default:
                        throw new Error("\nconvolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("\nconvolution: auto-mapping is not supported, third argument must be scalar.");
            }

        } else {
            return [];
        }
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function iSpike(x1,x2,y1,y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r1 = Math.round(y1);
    var r2 = Math.round(y2);
    var p1 = Math.round(x1);
    var p2 = Math.round(x2);
    var rr = [];
    for (i = 0; i < r1; i++) {
        rr[i] = [];
        for (j = 0; j < r2; j++) {
            if (i == p1 && j == p2) {
                rr[i][j] = 1;
            } else {
                rr[i][j] = 0;
            }
        }
    }
    return rr;
}
function __if__(condition, ifTrue, ifFalse) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    function doIf(cond, tr, fa) {
        if (cond) {
            return tr;
        } else {
            return fa;
        }
    }

    if (condition instanceof Array) {
        return zip([condition, ifTrue, ifFalse], doIf);
    } else {
        return doIf(condition, ifTrue, ifFalse);
    }
}
function imply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return !a || b;
    });
}
/**
 * Placeholder function for the input function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @param  {Number|String|Boolean} def Default value of input field
 * @return {Array}     Singleton array with def
 * @memberof Model.Library
 */
function input(def) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'input' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return [def];
}

input.isTimeDependent = true;
function lessThan(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a < b;
    });
}
function lessThanEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a <= b;
    });
}
function ln(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.log);
}

function log(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        return Math.log(a) / Math.log(10);

    });   
}
/*  ======================================= MATRICES =====================================

Description: Javascript routines to handle matrices (2D arrays).
Stored as methods of the global variable Matrix.
Author: Peter Coxhead (http://www.cs.bham.ac.uk/~pxc/)
Copyright: Peter Coxhead, 2008-2009; released under GPLv3
(http://www.gnu.org/licenses/gpl-3.0.html).
Last Revision: 9 July 2009
 */
var version = 'Matrix 1.01';
var errorCallback=null;
/*

Uses IOUtils.js, LUDecomposition.js, QRDecomposition.js, EVDecomposition.js.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

The useful fields of a Matrix object are:
m    number of rows
n    number of columns
mat  the matrix as an array of m entries, each being arrays of n entries.

Matrix.getEPS(): in any matrix calculation, an absolute value less than Matrix.getEPS()
is replaced by 0. The default value is 2^-40 (~9e-13). Set to a different value if you
want more or less precision.
Matrix.setEPS(newEPS): see above.

Matrix.create(arr): creates a Matrix object to represent the two-dimensional
array arr. The value of arr is copied.
Matrix.create(m,n): creates a Matrix object to represent an m-by-n matrix,
whose values are undefined.

Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity matrix.
Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-m unit matrix.
Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
random values such that 0 <= result[i][j] < 1.

Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
m-by-n.

Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
Matrix object mo.

Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
mo.
Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
function then returns an m-by-m Matrix object with this vector as its diagonal
and all off-diagonal elements set to 0.

Matrix.max(mo): returns the largest entry in the matrix.
Matrix.min(mo): returns the smallest entry in the matrix.

Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
scaled by scalar.

Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and mo2.

Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
each element of the Matrix object mo.  f must be a function of one argument.
Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
to each element of the Matrix object mo1 and the corresponding element of the Matrix
element mo2 (which must be of the same dimension).  f must be a function of two
arguments.

Matrix.trace(mo): returns the trace of the Matrix object mo.
Matrix.det(mo): returns the determinant of the Matrix object mo, which must be square.

Matrix.inverse(mo): returns the inverse of the Matrix object mo.

Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
If A is square, the solution is exact; if A has more rows than columns, the solution
is least squares. (No solution is possible if A has fewer rows than columns.)
Uses LUDecomposition.js and QEDecomposition.js.

Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
fields contain the eigenvectors and eigenvalues. The fields are as follows:
V    the columnwise eigenvectors as a Matrix object
lr   the real parts of the eigenvalues as an array
li   the imaginary parts of the eigenvalues as an array
L    the block diagonal eigenvalue matrix as a Matrix object
isSymmetric   whether the matrix is symmetric or not (boolean).

Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
omitted, the default in IOUtils.js is used.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

Example
-------

(Also uses IOUtils.js, EVDecomposition.js and LUDecomposition.js.)

with (Matrix){ var A = create([[1,2,4],[8,2,1],[-2,3,0]]);
println('A');
display(A,0);

var Ainv = inverse(A);
nl(); println('inverse(A)*A');
display(mult(Ainv,A));
nl(); println('inverse(A)*A - I');
display(sub(mult(Ainv,A),identity(A.n,A.m)));

var B = random(3,2);
nl(); println('B');
display(B);
var X = solve(A,B);
nl(); println('X obtained by solving A*X = B');
display(X);
nl(); println('A*X - B');
display(sub(mult(A,X),B));

var es = eigenstructure(A);

nl(); println('V (eigenvectors for A)');
display(es.V);
nl(); println('L (block diagonal eigenvalue matrix for A)');
display(es.L);
nl(); println('A*V - V*L');
display(sub(mult(A,es.V),mult(es.V,es.L)));
nl(); println('A - V*L*inverse(V)');
display(sub(A,mult(es.V,mult(es.L,inverse(es.V)))));
}

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

var Matrix = new createMatrixPackage();

function dealWithError(a){
  if(errorCallback){
    errorCallback("Error occurred in matrix package ("+a+")");
  } else {
    alert("Error occurred in matrix package ("+a+"), but no errorCallback function was installed.");
  }
}
function createMatrixPackage() {
  
  
  
  
  // the provision of an errorCallback function was added by Kees van Overveld
  // (March 2012). This function can be defined externally;
  // it is called whenever an error condition occurs.
  // In case no error callback is installed, the error is communicated via an alert box.


  this.setErrorCallback=function(a){
    errorCallback=a;
  }


	this.version = version;
	
	var abs = Math.abs; // local synonym
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Any number whose absolute value is < EPS is taken to be 0.
	// Matrix.getEPS(): returns the current value of EPS.
	// Matrix.setEPS(): changes the current value of EPS.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	var EPS = Math.pow(2, -40);
	this.getEPS = function () {
		return EPS;
	}
	this.setEPS = function (newEPS) {
		EPS = newEPS;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkNum is a private function used in replacing small values by 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkNum(x) {
		return (abs(x) < EPS) ? 0 : x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// _chkMatrix is a private function which checks that argument i of
	//   the function whose name is fname and whose value is arg is a
	//   Matrix object.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	function _chkMatrix(fname, i, arg) {
		if (!arg.isMatrix) {
      dealWithError('***ERROR: Argument ' + i + ' of Matrix.' + fname +
			' is not a Matrix; its value is "' + arg + '".');
		}
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.create(arr): creates a Matrix object to represent the two-dimensional
	//   array arr. The contents of arr are copied.
	// Matrix.create(m,n): creates a Matrix object to represent an m x n matrix,
	//   whose values are undefined.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.create = function (a1, a2) { // check args
		var isMatArg1 = a1 instanceof Array;
		if (!isMatArg1 && (typeof a1 != 'number')) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is not an array or a number.');
		}
		if (isMatArg1 && a2 != null) {
      dealWithError('***ERROR: in Matrix.create: argument 1 is an array but argument 2 is also present.');
		}
		if (isMatArg1)
			return _createMatrixfromArray(a1);
		else
			return _createMatrixfromDimensions(a1, a2);
	}
	function _createMatrixfromArray(arr) {
		var m = arr.length;
		for (var i = 0; i < m; i++) {
			if (!(arr[i]instanceof Array)) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 is not a 2D array.');
			}
			if (arr[i].length != arr[0].length) {
        dealWithError( '***ERROR: in Matrix.create: argument 1 has different length rows.');
			}
		}
		var n = arr[0].length;
		var res = new Array(m);
		for (var i = 0; i < m; i++) {
			res[i] = new Array(n);
			for (var j = 0; j < n; j++)
				res[i][j] = _chkNum(arr[i][j]);
		}
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = res;
		x.isMatrix = true;
		return x;
	}
	function _createMatrixfromDimensions(m, n) {
		var arr = new Array(m);
		for (var i = 0; i < m; i++)
			arr[i] = new Array(n);
		var x = new Object();
		x.m = m;
		x.n = n;
		x.mat = arr;
		x.isMatrix = true;
		return x;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.identity(m,n): returns a Matrix object corresponding to the m-by-n identity
	//   matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.identity = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = 0;
			for (var i = 0; i < Math.min(m, n); i++)
				mat[i][i] = 1;
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.unit(m,n): returns a Matrix object corresponding to the m-by-n unit matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.unit = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = 1;
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.random(m,n): returns a Matrix object corresponding to a m-by-n matrix with
	//   random values such that 0 <= result[i][j] < 1.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.random = function (m, n) {
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(Math.random());
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.copy(mo,fromRow,fromCol,m,n): given an Matrix object mo returns a copy
	//   of the submatrix whose first entry is at [fromRow][fromCol] and which is of size
	//   m by n.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.copy = function (mo, fromRow, fromCol, m, n) {
		_chkMatrix('copy', 1, mo);
		var res = _createMatrixfromDimensions(m, n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = mo.mat[i + fromRow][j + fromCol];
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.transpose(mo): returns a Matrix object corresponding to the transpose of the
	//   Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.transpose = function (mo) {
		_chkMatrix('transpose', 1, mo);
		var res = _createMatrixfromDimensions(mo.n, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = mo.mat[j][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diagOf(mo): returns the diagonal of a Matrix object mo as a column vector (i.e.
	//   an l-by-1 Matrix object), where l is the minimum of the number of rows and columns of
	//   mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diagOf = function (mo) {
		_chkMatrix('diagOf', 1, mo);
		var res = _createMatrixfromDimensions(Math.min(mo.m, mo.n), 1);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][0] = mo.mat[i][i];
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.diag(mo): mo must be a column vector, i.e. an m-by-1 Matrix object; the
	//   function then returns an m-by-m Matrix object with this vector as its diagonal
	//   and all off-diagonal elements set to 0.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.diag = function (mo) {
		_chkMatrix('diag', 1, mo);
		if (mo.n != 1) {
      dealWithError( '***ERROR: in Matrix.diag: argument 1 is not a column vector.');
		}
		var res = Matrix.identity(mo.m, mo.m);
		with (res) {
			for (var i = 0; i < m; i++)
				mat[i][i] = mo.mat[i][0];
		}
		return res;
	}
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.max(mo): returns the largest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.max = function (mo) {
		_chkMatrix('max', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] > res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.min(mo): returns the smallest entry in the matrix.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.min = function (mo) {
		_chkMatrix('min', 1, mo);
		with (mo) {
			var res = mat[0][0];
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					if (mat[i][j] < res)
						res = mat[i][j];
		}
		return _chkNum(res);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.scale(mo,scalar): returns a Matrix object corresponding to the Matrix object mo
	//   scaled by scalar.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.scale = function (mo, scalar) {
		_chkMatrix('scale', 1, mo);
		var res = _createMatrixfromArray(mo.mat);
		with (res) {
			for (var i = 0; i < m; i++)
				for (var j = 0; j < n; j++)
					mat[i][j] = _chkNum(scalar * mat[i][j]);
		}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.add(mo1,mo2): returns the matrix addition of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.add = function (mo1, mo2) {
		_chkMatrix('add', 1, mo1);
		_chkMatrix('add', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.add: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] + mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.sub(mo1,mo2): returns the matrix subtraction of the Matrix objects mo1 and mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.sub = function (mo1, mo2) {
		_chkMatrix('sub', 1, mo1);
		_chkMatrix('sub', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      delaWithError( '***ERROR: in Matrix.sub: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(mo1.mat[i][j] - mo2.mat[i][j]);
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.mult(mo1,mo2): returns the matrix multiplication of the Matrix objects mo1 and
	//   mo2.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.mult = function (mo1, mo2) {
		_chkMatrix('mult', 1, mo1);
		_chkMatrix('mult', 2, mo2);
		if (mo1.n != mo2.m) {
      dealWithError( '***ERROR: in Matrix.mult: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo2.n);
		var temp;
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++) {
				temp = 0;
				for (var k = 0; k < mo1.n; k++)
					temp += mo1.mat[i][k] * mo2.mat[k][j];
				mat[i][j] = _chkNum(temp);
			}
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.map(f,mo): returns a Matrix object obtained by applying the function f to
	//   each element of the Matrix object mo.  f must be a function of one argument.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.map = function (f, mo) {
		_chkMatrix('map', 2, mo);
		var res = _createMatrixfromDimensions(mo.m, mo.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.combine(f,mo1,mo2): returns a Matrix object obtained by applying the function f
	//   to each element of the Matrix object mo1 and the corresponding element of the Matrix
	//   element mo2 (which must be of the same dimension).  f must be a function of two
	//   arguments.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.combine = function (f, mo1, mo2) {
		_chkMatrix('combine', 1, mo1);
		_chkMatrix('combine', 2, mo2);
		if (mo1.m != mo2.m || mo1.n != mo2.n) {
      dealWithError( '***ERROR: in Matrix.combine: matrix dimensions don\'t match.');
		}
		var res = _createMatrixfromDimensions(mo1.m, mo1.n);
		with (res)
		for (var i = 0; i < m; i++)
			for (var j = 0; j < n; j++)
				mat[i][j] = _chkNum(f(mo1.mat[i][j], mo2.mat[i][j]));
		return res;
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.trace(mo): returns the trace of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.trace = function (mo) {
		_chkMatrix('trace', 1, mo);
		var t = 0;
		with (mo)
		for (var i = 0; i < Math.min(m, n); i++)
			t += mat[i][i];
		return _chkNum(t);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.det(mo): returns the determinant of the Matrix object mo, which be square.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.det = function (mo) {
		_chkMatrix('det', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.det: argument is not square.');
		}
		with (LUDecomposition)
		return _chkNum(det(create(mo)));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.inverse(mo): returns the inverse of the Matrix object mo.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.inverse = function (mo) {
		_chkMatrix('inverse', 1, mo);
		return Matrix.solve(mo, Matrix.identity(mo.m, mo.m));
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.solve(A,B): solves the matrix equation A*X = B, returning x as a Matrix object.
	//   If A is square, the solution is exact; if A has more rows than columns, the solution
	//   is least squares. (No solution is possible if A has fewer rows than columns.)
	//   Uses LUDecomposition.js and QRDecomposition.js.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.solve = function (A, B) {
		_chkMatrix('solve', 1, A);
		_chkMatrix('solve', 2, B);
		if (A.m == A.n)
			with (LUDecomposition)return solve(create(A), B);
		else if (A.m > A.n)
			with (QRDecomposition) {
				var temp = create(A);
				return solve(temp, B);
			}
		else
      dealWithError( '***ERROR: in Matrix.solve: argument 1 has fewer rows than columns.');
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.eigenstructure(mo): given a square Matrix object mo, returns an object whose
	//    fields contain the eigenvectors and eigenvalues. The fields are as follows:
	//    V    the columnwise eigenvectors as a Matrix object
	//    lr   the real parts of the eigenvalues as an array
	//    li   the imaginary parts of the eigenvalues as an array
	//    L    the block diagonal eigenvalue matrix as a Matrix object
	//    isSymmetric   whether the matrix is symmetric or not (boolean).
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.eigenstructure = function (mo) {
		_chkMatrix('eigenstructure', 1, mo);
		if (mo.m != mo.n) {
      dealWithError( '***ERROR: in Matrix.eigenstructure: argument is not a square matrix.');
		}
		return EVDecomposition.create(mo);
	}
	
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	// Matrix.display(mo,dp): displays the Matrix object mo using dp decimal places. If dp is
	//  omitted, the default in IOUtils.js is used.
	// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
	this.display = function (mo, dp) {
		_chkMatrix('display', 1, mo);
		if (dp == null)
			dp = 3;
		displayMat(mo.mat, null, null, dp);
	}
	
}
function max(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a,b) {
        return a < b ? b : a;
    });
}

max.base = -Infinity;
function min(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a,b) {
        return a < b ? a : b;
    });
}

min.base = Infinity;
function modulo(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (b !== 0.0) {
            var mm = a % b;
            if (mm >= 0) {
                return mm;
            } else {
                return mm + b;
            }
        } else {
            throw new Error("\ndivision by zero in modulo");
        }
    });
}
/**
 * Applies the given function on the given array of arrays. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 * @memberof Model.Library
 */
function multiaryZip(x, func) {
    var numArgs = x.length;
    var allScalar = true;
    for (var inKey = numArgs - 1; inKey >= 0; inKey--) {
        if (x[inKey] instanceof Array) {
            // Determine if there is an array in the input.
            allScalar = false;
            break;
        }
    }
    if (allScalar) {
        // Base: all elements in x are scalar
        return func.apply(this, x);
    } else {
        // Return variable.
        var result = [];
        // Set of keys that are valid candidates for matching with the rest of the input,
        // thus having a potential place in the output.
        var referenceKeys;
        // Number of keys in the set of referenceKeys.
        var numKeys;
        var inkey;
        for (inKey = numArgs - 1; inKey >= 0; inKey--) {
            if (x[inKey] instanceof Array) {
                // Keys of contender for input of reference found.
                referenceKeys = Object.keys(x[inKey]);
                numKeys = referenceKeys.length;
                // Cut off the loop as soon as possible
                break;
            }
        }
        // True if resultKey occurs in every input in x.
        var isCommonKey;
        // Input to be used for the recursive call.
        var recursiveInput;
        for (var resultKey = numKeys - 1; resultKey >= 0; resultKey--) {
            // Start with empty input
            recursiveInput = [];
            // Key occurs in every input until proven otherwise.
            isCommonKey = true;
            // Loop over all inputs in x.
            for (inKey = numArgs - 1; inKey >= 0; inKey--) {
                if (x[inKey] instanceof Array) {
                    // Check if keys contained in all objects
                    if (x[inKey][referenceKeys[resultKey]] !== undefined) {
                        recursiveInput[inKey] = x[inKey][referenceKeys[resultKey]];
                    } else {
                        // Key does not occur in this array.
                        isCommonKey = false;
                        // Cut short loop to save processing time.
                        break;
                    }
                } else {
                    // Input x[inKey] is a scalar.
                    recursiveInput[inKey] = x[inKey];
                }
            }
            // Key occurs in all non-scalar inputs.
            if (isCommonKey) {
                // Put the recursive result in the representative key.
                result[referenceKeys[resultKey]] = multiaryZip(recursiveInput, func);
            }
        }
        return result;
    }
}
function multiply(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a * b;
    });
}

multiply.base = 1;
function not(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        return !a;
    });
}
function notEqual(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a != b;
    });
}
/**
 * Converts an object to array
 * Recursive, but only if neccessary.
 * If the object is a scalar value, we just return the value
 *
 * @memberof Model.Library
 * @param  {Object} obj object to convert
 * @param  {Boolean} Whether the function should be applied recursively.
 * @return {Array}      converted array
 */
function objectToArray(obj, nonRecursive) {
    if (!(obj instanceof Array) && obj instanceof Object) {
        var array = []; // Initialize the array
        for (var key in obj) {
            // go through each element in the object
            // and add them to the array at the same key

            if (!nonRecursive && !(obj[key] instanceof Array) && obj[key] instanceof Object) {
                array[key] = objectToArray(obj[key]);
            } else {
                array[key] = obj[key];
            }
        }
        return array;
    } else {
        return obj;
    }
}
function or(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a || b;
    });
}

or.base = false;
function paretoHor(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function paretoMax(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function paretoMin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function paretoVer(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return x;
}
function plot(x) {
    exe.hasPlot = true;

    if (x instanceof Array) {
        exe.plot = x;
        if (exe.plotStatus === '') {
            return 'plot OK';
        } else {
            throw new Error(exe.plotStatus);
        }
    } else {
        var plotTypeError =
            "type mismatch in 'plot': argument must be of the form [graph1, graph2, ...]\n" +
            "so there must be a single argument which is a vector. Each of the (1 or more) graphs has the form\n" +
            "graphi=[control,data,data,data,...] where 'control' is a javascript array assigning values\n" +
            "to parameters, and the 'data'-elements are vectors of scalar data each.";
        throw new Error(plotTypeError);
    }
}
function poisson(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return zip([x, y, z], function(a, b, c) {
        if (a < 0 || b < 0) {
            throw new Error("The poisson of numbers less than 0 are not supported.");
        } else {
            if (!c) {
                return ((Math.pow(b, a) * Math.exp(-b)) / factorial(a));
            } else {
                var poisson;
                if (b < 20 && a < 20) {
                    poisson = 0;
                    var expY = Math.exp(-b);
                    var power = 1;
                    for (i = 0; i <= a; i++) {
                        poisson += expY * power / factorial(i);
                        power *= b;
                    }
                    return poisson;
                } else {
                    //from: http://www.questia.com/googleScholar.qst?docId=5000227714
                    a = Math.exp(-b);
                    poisson = a;
                    for (i = 2; i < a + 1; i++) {
                        a = a * b / (i - 1);
                        poisson += a;
                    }
                    return poisson;
                }
            }
        }
    });
}
function pow(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        if (a >= 0) {
            return Math.pow(a, b);
        } else {
            // a<0
            if (b > 0) {
                return Math.pow(Math.abs(a), b);
            } else {
                if (b == parseInt(b)) {
                    if ((b % 2) === 0) {
                        return 1.0 / Math.pow(Math.abs(a), Math.abs(b));
                    } else {
                        return -1.0 / Math.pow(Math.abs(a), Math.abs(b));
                    }
                } else {
                    throw new Error("\npower of negative number to a non-integer exponent is not defined in the real numbers (would be a complex number)");
                }
            }
        }
    });
}
function putChan(myChannelName,myValue) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if ((typeof myChannelName) == 'string') {
        var value = arrayToObject(myValue);
        var fnd = false;
        for (var i = 0; i < putChanTimers.length; i++) {
            if (putChanTimers[i].chanName == myChannelName) {
                // this channel exists. See at what time we called it.
                fnd = true;
                var chanDate = new Date();
                var chanTime = chanDate.getTime();
                if (chanTime - putChanTimers[i].time < MINURLDELAY) {
                    return myValue;
                } else {
                    // we can call the server again.
                    var encodedData = JSON.stringify(value);
                    var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
                    $.ajax({
                        url: cmpUrl
                    });
                    putChanTimers[i].time = chanTime;
                    return myValue;
                }
            }
        }
        if (!fnd) {
            // it does not exist yet: create it
            var k = putChanTimers.length;
            var chanDate = new Date();
            var chanTime = chanDate.getTime();
            putChanTimers[k] = {
                'returnValue': value,
                'time': chanTime,
                'chanName': myChannelName
            };
            var encodedData = JSON.stringify(value);
            var cmpUrl = "php/keyMapDBI.php?task=setTerm&key=" + myChannelName + "&term=" + encodedData + "&zghekjrtpoi=" + Math.random();
            $.ajax({
                url: cmpUrl
            });
            return myValue;
        }
    } else {
        throw new Error("\nfirst argument of putChan() must be a string");
    }
}
function ramp(x, x1, y1, x2, y2) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var rmp = 0;
    if (x1 != x2) {
        if (x < x1) {
            rmp = y1;
        } else {
            if (x > x2) {
                rmp = y2;
            } else {
                rmp = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
            }
        }
    } else {
        rmp = ((x2 + y2)) / 2.0;
    }
    return rmp;
}
function random() {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

	return Math.random();
}

random.isTimeDependent = true;
function round(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.round);
}

function sin(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.sin);
}

/**
 * Placeholder function for the slider function.
 *
 * Performs checks on the arguments and returns the
 * arguments in an array.
 * In this way, the Analyser can easily extract the arguments
 * and check the arguments for errors
 *
 * @memberof Model.Library
 * @pre min <= def <= max
 * @param  {Number} def Deafault value of the slider
 * @param  {Number} min Lower bound
 * @param  {Number} max Upper Bound
 * @return {Array}     Array with def,min,max
 */
function slider(def, min, max) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + 'Slider' +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    if (isNaN(parseFloat(def)) || isNaN(parseFloat(min)) || isNaN(parseFloat(max))) {
        throw new Error('Arguments of slider must be numeric constants.');
    }

    if (min <= def && def <= max) {
        return [def, min, max];
    } else {
        throw new Error('For the slider, the default value must be between the lower and upper bound.' +
            ' Also the upper bound must be greater than the lower bound' +
            ' (Default = ' + def + ', lower = ' + min + ', upper = ' + max + ')');
    }
}

slider.isTimeDependent = true;
function sqrt(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.sqrt);
}

function subtract(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return binaryZip(x, y, function(a, b) {
        return a - b;
    });
}
function sum() {
    return zip(arguments, function() {
        var _sum = 0;
        for (var i = arguments.length - 1; i >= 0; i--) {
            _sum += arguments[i];
        }
        return _sum;
    });
}
function tan(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    return unaryZip(x, Math.tan);
}

/**
 * Applies the given function on the given array or scalar. The function is aplied recursively,
 * so also to nested arrays.
 * @param  {Array | Number}   a        array or scalar to which the given function should be applied
 * @param  {Function} func function that should be applied
 * @return {Array | Number}            Result of applying operator.
 *
 * @memberof Model.Library
 */
function unaryZip(a, func) {
    if (a instanceof Array) {
        // Recursive step, a is an array
        var result = [];
        for (var key in a) {
            result[key] = unaryZip(a[key], func);
        }
        return result;
    } else {
        // Base: a is a scalar
        return func(a);
    }
}
function uniminus(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return unaryZip(x, function(a) {
        return -a;
    });
}
//This function was taken from keesvanoverveld.com
function vAggregate(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var iLow, r;
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                iLow = Math.min(x.length, Math.max(0, z));
                r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                for (i = 0; i < y.length; i++) {
                    r[i + iLow] = y[i];
                }
                for (i = iLow; i < x.length; i++) {
                    r[i + y.length] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        } else {
            // we interpret the scala element to be inserted as if it is a vector with length 1
            if (!(z instanceof Array)) {
                iLow = Math.min(x.length, Math.max(0, z));
                r = [];
                for (i = 0; i < iLow; i++) {
                    r[i] = x[i];
                }
                r[iLow] = y;
                for (i = iLow; i < x.length; i++) {
                    r[i + 1] = x[i];
                }
                return r;
            } else {
                throw new Error("vAggregate: third argument must be a scalar.");
            }
        }
    } else {
        throw new Error("vAggregate: first argument must be a vector");
    }
}
function vAppend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var result = [];
        for (var key in x) {
            result[key] = x[key];
        }
        result[x.length] = y;
        return result;
    } else {
        return [x, y];
    }
}

vAppend.base = [];
function vConcat(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var p = [];
    var k;
    if (!(x instanceof Array)) {
        p.push(x);
    } else {
        for (k in x) {
            p.push(x[k]);
        }
    }
    if (!(y instanceof Array)) {
        p.push(y);
    } else {
        for (k in y) {
            p.push(y[k]);
        }
    }
    return p;
}

vConcat.base = [];
 //This function was taken from keesvanoverveld.com
function vConvolve(x, y, n, m) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var r = x.length;
        if (y instanceof Array) {
            var p = y.length;
            if (!(n instanceof Array)) {
                n = Math.round(n);
                var res = [];
                var rr, index;
                switch (m) {
                    case 0:
                        for (i = 0; i < r; i++) {
                            rr = 0;
                            for (j = 0; j < p; j++) {
                                index = i + j - n;
                                while (index < 0)
                                    index += r;
                                while (index >= r)
                                    index -= r;
                                rr += x[index] * y[j];
                            }
                            res[i] = rr;
                        }
                        return res;
                    case 1:
                        for (i = 0; i < r; i++) {
                            rr = 0;
                            for (j = 0; j < p; j++) {
                                index = i + j - n;
                                if (index >= 0 && index < r) {
                                    rr += x[index] * y[j];
                                }
                            }
                            res[i] = rr;
                        }
                        return res;
                    case 2:
                        for (i = 0; i < r; i++) {
                            rr = 0;
                            for (j = 0; j < p; j++) {
                                index = i + j - n;
                                index = index < 0 ? 0 : (index >= r ? r - 1 : index);
                                rr += x[index] * y[j];

                            }
                            res[i] = rr;
                        }
                        return res;
                    default:
                        throw new Error("convolution: fourth argument must be 0, 1 or 2.");
                }
            } else {
                throw new Error("convolution: auto-mapping is not supported, third argument must be scalar.");

            }
        } else {
            return [];
        }
    } else {
        return [];
    }
}
function vDom(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var p = [];
        var key = 0;
        for (i = 0; i < x.length; i++) {
            p.push(i);
        }
        for (key in x) {
            if (isNaN(key)) {
                p.push(key);
            }
        }
        return p;
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function vDot(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var a = 0;
    var i;

    if (x instanceof Array) {
        if (y instanceof Array) {
            for (i in x) {
                if (y[i] !== undefined) {
                    if (!(x[i] instanceof Array) && !(y[i] instanceof Array)) {
                        a += (x[i] * y[i]);
                    }
                }
            }
            return a;
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    a += y * x[i];
                }
            }
            return a;
        }
    } else {
        if (!(y instanceof Array)) {
            return x * y;
        } else {
            for (i in y) {
                if (!(y[i] instanceof Array)) {
                    a += x * y[i];
                }
            }
            return a;
        }
    }
}
function vEigenSystem(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length === n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aEig = Matrix.eigenstructure(aA);
            // aEig.lr=the vector of real parts of the eigenvalues
            // aEig.li=the vector of imaginary parts of eigenvalues
            // eEig.V=matrix of eigenvectors
            var ttt = [];
            // first lr
            ttt[0] = [];
            for (i = 0; i < aEig.lr.length; i++) {
                ttt[0][i] = aEig.lr[i];
            }
            // next li
            ttt[1] = [];
            for (i = 0; i < aEig.li.length; i++) {
                ttt[1][i] = aEig.li[i];
            }
            // next V
            ttt[2] = [];
            for (i = 0; i < aEig.V.mat.length; i++) {
                var vvv = [];
                ttt[2][i] = [];
                for (var j = 0; j < aEig.V.mat[i].length; j++) {
                    vvv[j] = aEig.V.mat[i][j];
                }
                ttt[2][i] = vvv;
            }
            return ttt;
        } else {
            throw new Error("\nvEigenSystem: cannot calculate eigensystem for non-square matrix");
        }
    } else {
        return;
        // if x is a scalar, the real part of the eigenvalue is equal to that scalar;
        // the iumaginary part is 0, and the eigenvector is the vector [1]
        // [x, 0, [1]];
    }
}
function vExtend(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var k;
    var p = [];
    if (!(x instanceof Array)) {
        if (y instanceof Array) {
            p.push(x);
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
            return p;
        } else {
            return [x, y];
        }
    } else {
        for (k in x) {
            p[k] = x[k];
        }
        if (y instanceof Array) {
            for (k in y) {
                if (!isNaN(k)) {
                    p.push(y[k]);
                } else {
                    p[k] = y[k];
                }
            }
        } else {
            p.push(y);
        }
        return p;
    }
}

vExtend.base = [];
//This function was taken from keesvanoverveld.com
function vGaussian(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof Array) && !(y instanceof Array)) {
        var n = Math.round(x);
        var s = y;
        if (n >= 0) {
            var t = [];
            var sum = 0;
            x = -(n - 1) / 2;
            var denom = 2 * s * s;
            for (i = 0; i < n; i++) {
                t[i] = Math.exp(-x * x / denom);
                sum += t[i];
                x += 1;
            }
            for (i = 0; i < n; i++) {
                t[i] /= sum;
            }
            return t;
        } else {
            throw new Error("vGaussian: cannot make a vector with <0 elements");
        }
    } else {
        throw new Error("vGaussian: both arguments must be scalar.");
    }
}
function vLen(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof Array)) {
        return 0;
    }
    
    return x.length;
}
function vMake(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    result = [];
    for (var i = 0; i < y; i++) {
        result[i] = x;
    }

    return result;
}
function vMatInverse(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var t = [];
        var n = x.length;
        var isOK = true;
        for (i = 0; i < n; i++) {
            t[i] = [];
            if (x[i] instanceof Array) {
                if (x[i].length == n) {
                    for (j = 0; j < n; j++) {
                        if (!(x[i][j] instanceof Array)) {
                            t[i][j] = x[i][j];
                        } else {
                            isOK = false;
                        }
                    }
                } else {
                    isOK = false;
                }
            } else {
                isOK = false;
            }
        }
        if (isOK) {
            var aA = Matrix.create(t);
            var aInv = Matrix.inverse(aA);
            for (i = 0; i < aInv.mat.length; i++) {
                var tt = [];
                for (j = 0; j < aInv.mat[i].length; j++) {
                    tt[j] = aInv.mat[i][j];
                }
                t[i] = tt;
            }
            return t;
        } else {
            throw new Error("\nvMatInverse: cannot take inverse of non-square matrix");
        }
    } else {
        return 1 / x;
    }
}
//This function was taken from keesvanoverveld.com
function vMatMatMul(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var trueMatrix1, i, j, k, a, m, r;
    if (x instanceof Array) {
        var trueMatrix0 = false;
        for (i in x) {
            if (x[i] instanceof Array) {
                trueMatrix0 = true;
            }
        }
        if (trueMatrix0) {
            if (y instanceof Array) {
                trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    m = [];
                    for (i in x) {
                        r = [];
                        for (j in y) {
                            if (y[j] instanceof Array) {
                                for (k in y[j]) {
                                    if (x[i][j] !== undefined) {
                                        if (y[j][k] !== undefined) {
                                            if (!(x[i][j] instanceof Array) && !(y[j][k] instanceof Array)) {
                                                var t = x[i][j] * y[j][k];
                                                if (r[k]) {
                                                    r[k] += t;
                                                } else {
                                                    r[k] = t;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        m[i] = r;
                    }
                    return m;
                } else {
                    // y is not a matrix but a vector; x is a true matrix. So this is a matrix-vector product or a matrix-scalar product.
                    r = [];
                    for (i in x) {
                        a = 0;
                        if (x[i] instanceof Array) {
                            for (j in x[i]) {
                                if (y[j] !== undefined) {
                                    if (!(x[i][j] instanceof Array) && !(y[j] instanceof Array)) {
                                        a += x[i][j] * y[j];
                                    }
                                }
                            }
                            r[i] = a;
                        }
                    }
                    return r;
                }
            } else {
                // x is a matrix and y is a scalar. Return the matrix, multiplied by the scalar (this would
                // also be achieved by auto mapping the multiplication)
                m = [];
                for (i in x) {
                    r = [];
                    if (x[i] instanceof Array) {
                        for (j in x[i]) {
                            if (!(x[i][j] instanceof Array)) {
                                r[j] = x[i][j] * y;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            }
        } else {
            // the argument x is a vector of scalars, not a true matrix. Perhaps y is a matrix.
            if (y instanceof Array) {
                trueMatrix1 = false;
                for (j in y) {
                    if (y[j] instanceof Array)
                        trueMatrix1 = true;
                }
                if (trueMatrix1) {
                    // yes, so we do a matrix-vector product
                    r = [];
                    for (i in x) {
                        if (y[i] !== undefined) {
                            if (y[i] instanceof Array) {
                                for (j in y[i]) {
                                    if (!(y[i][j] instanceof Array)) {
                                        if (r[j] !== undefined) {
                                            r[j] += x[i] * y[i][j];
                                        } else {
                                            r[j] = x[i] * y[i][j];
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return r;
                } else {
                    // y is not a matrix but a vector; x is also a vector. So we calculate the dot product -
                    // treating the vector y as a column rather than as the row that it actually is..
                    a = 0;
                    for (i in x) {
                        if (y[i] !== undefined) {
                            if (!(y[i] instanceof Array)) {
                                a += x[i] * y[i];
                            }
                        }
                    }
                    // what should we do - return this as a number or as a 1x1 matrix? Choose to return it as a number.
                    return a;
                }
            } else {
                // so x is a vector and y is a scalar.
                r = [];
                for (i in x) {
                    if (!(x[i] instanceof Array)) {
                        r[i] = x[i] * y;
                    }
                }
                return r;
            }
        }
    } else {
        // x is a scalar. Perhaps y is a matrix.
        if (y instanceof Array) {
            trueMatrix1 = false;
            for (i in y) {
                if (y[i] instanceof Array)
                    trueMatrix1 = true;
            }
            if (trueMatrix1) {
                // so x is a scalar and y is a matrix.
                m = [];
                for (i in y) {
                    r = [];
                    if (y[i] instanceof Array) {
                        for (j in y[i]) {
                            if (!(y[i][j] instanceof Array)) {
                                r[j] = y[i][j] * x;
                            }
                        }
                        m[i] = r;
                    }
                }
                return m;
            } else {
                // x is a scalar and y is a vector.
                r = [];
                for (i in y) {
                    if (!(y[i] instanceof Array)) {
                        r[i] = y[i] * x;
                    }
                }
                return r;
            }
        } else {
            // x is a scalar and y is a scalar: just return their product
            return x * y;
        }
    }
}
function vMatSolve(mm, v) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    
    var isOK = true;
    var t = [];
    var u = [];

    if (mm instanceof Array) {
        // n is number of rows; m is number of columns of the matrix (=mm)
        var n = mm.length;
        if (mm[0] instanceof Array) {
            var m = mm[0].length;
            if (v instanceof Array) {
                if (m <= n && v.length == n) {
                    for (i = 0; i < n; i++) {
                        t[i] = [];
                        if (mm[i] instanceof Array) {
                            if (mm[i].length == m) {
                                for (j = 0; j < m; j++) {
                                    if (!(mm[i][j] instanceof Array)) {
                                        t[i][j] = mm[i][j];
                                    } else {
                                        throw new Error("\nvMatSolve: every matrix element must be scalar");
                                    }
                                }
                            } else {
                                throw new Error("\nvMatSolve: every row in left hand side must be of equal length");
                            }
                        } else {
                            throw new Error("\nvMatSolve: every row in left hand side must be a vector");
                        }
                    }
                    // next assemble the right hand vector
                    for (i = 0; i < n; i++) {
                        if (!(v[i] instanceof Array)) {
                            u[i] = [];
                            u[i][0] = v[i];
                        } else {
                            throw new Error("\nvMatSolve: non-scalar element found in right-hand side");
                        }
                    }
                } else {
                    throw new Error("\nvMatSolve: nr. rows of right hand side must be equal to nr. columns of left hand side, and the number of rows of the matrix must not be smaller than the number of columns");
                }
            } else {
                throw new Error("\nvMatSolve: right hand side must be vector");
            }
        } else {
            throw new Error("\nvMatSolve: left hand side must be vector of vectors");
        }
    } else {
        throw new Error("\nvMatSolve: first argument must be vector");
    }
    if (isOK) {
        var aA = Matrix.create(t);
        var aB = Matrix.create(u);
        var aSol = Matrix.solve(aA, aB);
        var tt = [];
        for (i = 0; i < aSol.mat.length; i++) {
            tt[i] = aSol.mat[i][0];
        }
        return tt;
    }
}
//This function was taken from keesvanoverveld.com
function vNormAbs(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += Math.abs(x[i]);
            }
        }
        return a;
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormEuclid(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return Math.sqrt(a);
    } else {
        return Math.abs(x);
    }
}
//This function was taken from keesvanoverveld.com
function vNormFlat(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        // we support also strings that are to be concatenated.
        // Hence the initialisation cannot simply be var a=0; we must leave the type of a open until after
        // the first assignment;
        var a;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                if (a !== undefined) {
                    a += x[i];
                } else {
                    a = x[i];
                }
            }
        }
        return a;
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormSq(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var a = 0;
        for (var i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        return a;
    } else {
        return x * x;
    }
}
//This function was taken from keesvanoverveld.com
function vNormalize(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var a = 0;
    var i;

    if (x instanceof Array) {
        for (i in x) {
            if (!(x[i] instanceof Array)) {
                a += x[i] * x[i];
            }
        }
        var nn = Math.sqrt(a);
        var rr = [];
        if (nn > 0) {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = x[i] / nn;
                } else {
                    rr[i] = x[i];
                }
            }
        } else {
            for (i in x) {
                if (!(x[i] instanceof Array)) {
                    rr[i] = 0;
                } else {
                    rr[i] = x[i];
                }
            }
        }
        return rr;
    } else {
        return 1;
    }
}
//This function was taken from keesvanoverveld.com
function vRange(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var p = [];
        for (var k in x) {
            p.push(x[k]);
        }
        return p;
    } else {
        return [x];
    }
}
//This function was taken from keesvanoverveld.com
function vSegment(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        if (!(y instanceof Array)) {
            if (!(z instanceof Array)) {
                var iLow = Math.max(0, y);
                var iHi = Math.min(x.length, z);
                var r = [];
                var i;
                for (i = iLow; i < iHi; i++) {
                    r[i - iLow] = x[i];
                }
                i = iHi - iLow;
                while (i < z - y) {
                    r[i] = 0;
                    i++;
                }
                return r;
            } else {
                throw new Error("vSegment: third argument must be a scalar.");
            }
        } else {
            throw new Error("vSegment: second argument must be a scalar.");
        }
    } else {
        throw new Error("vSegment: first argument must be a vector.");
    }
}
//This function was taken from keesvanoverveld.com
function vSeq(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (!(x instanceof Array) && !(y instanceof Array)) {
        var p = [];
        for (var k = x; k < y; k++) {
            p.push(k);
        }
        return p;
    } else {
        return [];
    }
}
//This function was taken from keesvanoverveld.com
function vSequence(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    return vSeq(x, y);
}
//This function was taken from keesvanoverveld.com
function vSpike(x, y) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    var r = Math.round(y);
    var p = Math.round(x);
    var rr = [];
    for (var i = 0; i < r; i++) {
        if (i === p) {
            rr[i] = 1;
        } else {
            rr[i] = 0;
        }
    }
    return rr;
}
//This function was taken from keesvanoverveld.com
function vTranspose(x) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }

    if (x instanceof Array) {
        var trueMatrix = false;
        var i;

        for (i in x) {
            if (x[i] instanceof Array)
                trueMatrix = true;
        }
        if (trueMatrix) {
            var r = [];
            var j;
            for (i in x) {
                if (x[i] instanceof Array) {
                    for (j in x[i]) {
                        if (r[j] === undefined) {
                            r[j] = [];
                        }
                        r[j][i] = x[i][j];
                    }
                } else {
                    if (r[j] === undefined) {
                        r[j] = [];
                    }
                    r[j][0] = x[i];
                }
            }
            return r;
        } else {
            // x is a vector, but not a matrix. Tow options:
            // consider the argument as [[1,2,3]] and return [[1],[2],[3]] - or consider it just as a list [1,2,3]  and merely return [1,2,3]. We prefer the latter.
            return x;
        }
    } else {
        return x;
    }
}
//This function was taken from keesvanoverveld.com
function vVecRamp(x, y, z) {
    if (arguments.length != arguments.callee.length) {
        throw new Error('Wrong number of arguments for ' + arguments.callee.name +
            '. Expected: ' + arguments.callee.length + ', got: ' + arguments.length);
    }
    // arguments: x is a vector of abcissae
    // y is a vector of ordinates
    // z is an abcissa-value
    if (x instanceof Array) {
        if (y instanceof Array) {
            if (!(z instanceof Array)) {
                // simply ignore elements at the tail in case on of the two vectors is too long
                var len = Math.min(x.length, y.length);
                // it may be necessary to sort the keys - hopefully not, but it takes
                // little time at least to check
                var sorted = false;
                var scalarOK = true;
                while (!sorted && scalarOK) {
                    sorted = true;
                    for (var i = 0; i < len - 1; i++) {
                        if (!(x[i] instanceof Array)) {
                            if (!(x[i + 1] instanceof Array)) {
                                if (x[i] > x[i + 1]) {
                                    var swap = x[i];
                                    x[i] = x[i + 1];
                                    x[i + 1] = swap;
                                    // don't forget to swap the ordinate values as well!
                                    swap = y[i];
                                    y[i] = y[i + 1];
                                    y[i + 1] = swap;
                                    sorted = false;
                                }
                            } else
                                scalarOK = false;
                        } else
                            scalarOK = false;
                    }
                }
                if (scalarOK) {
                    //first do a binary search - assume that the keys are sorted!
                    //We have to find the index i such that the probe is enclosed between heap(i) and heap(i+1).
                    var lo = 0;
                    var hi = len;
                    var mi = len / 2;
                    if (z <= x[0]) {
                        return y[0];
                    }
                    if (z >= x[len - 1]) {
                        return y[len - 1];
                    }
                    var nrtrials = 0;
                    while (hi > lo + 1 && nrtrials < 20) {
                        mi = Math.round((hi + lo) / 2);
                        if (z >= x[mi])
                            lo = mi;
                        if (z <= x[mi])
                            hi = mi;
                        nrtrials++;
                    }
                    if (nrtrials < 20) {
                        if (x[lo + 1] > x[lo]) {
                            return y[lo] + (z - x[lo]) * (y[lo + 1] - y[lo]) / (x[lo + 1] - x[lo]);
                        } else {
                            return 0.5 * (y[lo] + y[lo + 1]);
                        }
                    } else {
                        throw new Error("vVecRamp: could not find enclosing interval for abcissa.");
                    }
                } else {
                    throw new Error("vVecRamp: not all the abcissae values are scalar.");
                }
            } else {
                throw new Error("vVecRamp: third argument of vVecRamp must be scalar (abcissa-value).");
            }
        } else {
            throw new Error("vVecRamp: second argument of vVecRamp must be vector (of ordinates).");
        }
    } else {
        throw new Error("vVecRamp: first argument of vVecRamp must be vector (of abcissae).");
    }
}
/**
 * Applies the given function on the given array of inputs. The function is aplied recursively,
 * so also to nested arrays. This fucntion is to be called by anything that wants to use either map, binaryZip or nzip.
 * This function automatically calls the most efficient function for the job.
 * @param  {Array}      x       array of inputs used in the function of interest, each of which may be an array itself
 * @param  {Function}   func    function that should be applied
 * @return {Array}              resulting array
 * @memberof Model.Library
 */
function zip(x, func) {
    var numArgs = x.length;
    switch (numArgs) {
        case 0:
            throw new error("Cannot zip with zero arguments, attempted by: " + arguments.callee.caller.name);
        case 1:
            return unaryZip(x[0], func);
        case 2:
            return binaryZip(x[0], x[1], func);
        default:
            return multiaryZip(x, func);
    }
}
