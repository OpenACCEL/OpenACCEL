/*
 * Abstract class that represents a cross-over in a Genetic Optimization algorithm.
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

define(["model/emo/crossover/crossover", "model/emo/random", "model/emo/cloneobject"], /**@lends Model.EMO.CrossOver*/ function(CrossOver, Random, CloneObject) {

    /**
     * @class
     * @classdesc A UniformCrossOver takes two parents and produces two children,
     * based on a fixed mix ratio between the two parents.
     */
    function UniformCrossOver() {}

    UniformCrossOver.prototype = new CrossOver();

    /**
     * Takes two parents and produces two children,
     * based on the Uniform cross-over principle.
     *
     * One child has approximately half the values of the first parent,
     * and half the values of the second parent.
     * The second child is the complement of the first child.
     *
     * @param {Individual} parent1  the first parent
     * @param {Individual} parent2  the second parent
     * @pre parent1 != null or undefined
     * @pre parent2 != null or undefined
     * @return {Individual[]} the offspring, the result of the cross-over
     */
    UniformCrossOver.prototype.produce = function(parent1, parent2) {
        CrossOver.prototype.produce.call(this, parent1, parent2);
        // initialise the offspring by cloning the parents
        // ensures all general information,
        // i.e. precision, minimum, maximum, maximization, are copied over
        var offspring1 = CloneObject(parent1);
        var offspring2 = CloneObject(parent2);
        var parent;
        var dimension = parent1.inputvector.length;
        
        // loop over all dimensions of the input vector
        for (var i = dimension - 1; i >= 0; i--) {
            // select a random parent
            parent = Random.prototype.getRandomInt(1, 2);
            // assign the value of the first parent to the first child
            if (parent == 1) {
                offspring1.inputvector[i].value = parent1.inputvector[i].value;
                offspring2.inputvector[i].value = parent2.inputvector[i].value;
            }
            // assign the value of the second parent to the first child
            else { // parent == 2
                offspring1.inputvector[i].value = parent2.inputvector[i].value;
                offspring2.inputvector[i].value = parent1.inputvector[i].value;
            }
        }
        return [offspring1, offspring2];
    };

    return UniformCrossOver;
});
