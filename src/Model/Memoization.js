/*
 * memoize.js
 * by @philogb and @addyosmani
 * further optimizations by @mathias, @DmitryBaranovsk & @GotNoSugarBaby
 * fixes by @AutoSponge
 * perf tests: http://bit.ly/q3zpG3
 *
 * Blog:
 * http://addyosmani.com/blog/faster-javascript-memoization/
 *
 * Source:
 * https://github.com/addyosmani/memoize.js
 *
 * Released under The MIT License (MIT).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode    = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: "scripts"
    });
}
/*******************************************************************/

define([], /** @lends Model */ function() {

    /**
     * @class Memoization
     * @classdesc Memoization caches the calls of a function,
     *            such that lengthy lookups can be minimized.
     */
    var Memoization = {

        /**
         * Adds memoization functionality to functions.
         *
         * @param  {function} func the function to memoize
         * @return {function}      the memoized function
         */
        memoize: function(func) {
            var stringifyJson = JSON.stringify,
                cache = {};

            var cachedfunc = function() {
                var hash = stringifyJson(arguments);
                return (hash in cache) ? cache[hash] : cache[hash] = func.apply(this, arguments);
            };

            cachedfunc.__cache = (function() {
                cache.remove || (cache.remove = function() {
                    var hash = stringifyJson(arguments);
                    return (delete cache[hash]);
                });
                return cache;
            }).call(this);

            return cachedfunc;
        }
    };

    // Exports are needed, such that other modules may invoke methods from this module file.
    return Memoization;
});
