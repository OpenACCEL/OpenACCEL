/*
 * The BinaryTournament takes as input two individuals.
 * It compares the two individuals and returns the strongest one.
 *
 * @author Jacco Snoeren
 */

/* Browser vs. Node ***********************************************/
inBrowser = typeof window !== 'undefined';
inNode = !inBrowser;

if (inNode) {
    require = require('requirejs');
} else {
    require.config({
        baseUrl: 'scripts'
    });
}
/*******************************************************************/

define([], /**@lends Model.EMO*/ function() {

    /**
     * @class
     * @classdesc The BinaryTournament class compares two individuals
     * and returns the strongest one.
     */
    function BinaryTournament() {}

    /**
     * Compares two individuals and selects the strongest one.
     *
     * @param {Individual} individual1  the first individual
     * @param {Individual} individual2  the second individual
     * @pre individual1 != null or undefined
     * @pre individual2 != null or undefined
     * @return {Individual} the strongest individual
     */
    BinaryTournament.prototype.select = function(individual1, individual2) {
        if (!individual1) {
            throw new Error('BinaryTournament.select().pre violated:' +
                'individual1 is null or undefined');
        }
        if (!individual2) {
            throw new Error('BinaryTournament.select().pre violated:' +
                'individual2 is null or undefined');
        }
        return individual1.fitness <= individual2.fitness ? individual1 : individual2;
    };

    return BinaryTournament;
});
