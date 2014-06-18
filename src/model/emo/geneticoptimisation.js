/*
 * File containing the GeneticOptimisation class
 *
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

define(["model/emo/crossover/crossover",
    "model/emo/crossover/uniformcrossover",
    "model/emo/mutation/mutation",
    "model/emo/mutation/closemutation",
    "model/emo/mutation/arbitrarymutation",
    "model/emo/mutation/randommutation",
    "model/emo/tournament/binarytournament",
    "model/emo/individual",
    "model/emo/cloneobject"
], /**@lends Model.EMO*/ function(CrossOver, UniformCrossOver, Mutation, CloseMutation, ArbitraryMutation, RandomMutation, BinaryTournament, Individual, CloneObject) {

    /**
     * @class
     * @classdesc Class for a Genetic Optimisation algorithm
     * based on the Strength Pareto Evolutionary Algorithm (SPEA).
     */
    function GeneticOptimisation() {

        /**
         * The population.
         *
         * @type {Array}
         */
        this.population = [];

        /**
         * Reference to the executable.
         *
         * @type {Executable}
         */
        this.executable = {};

        /**
         * The external dominated set.
         *
         * @type {Array}
         */
        this.dominated = [];

        /**
         * The external nondominated set.
         *
         * @type {Array}
         */
        this.nondominated = [];

        /**
         * The mating pool.
         *
         * @type {Array}
         */
        this.matingpool = [];

        /**
         * The tournament used for the selection procedure.
         *
         * @type {BinaryTournament}
         */
        this.tournament = new BinaryTournament();

        /**
         * The cross-over used for the cross-over procedure.
         *
         * @type {CrossOver}
         */
        this.crossover = new UniformCrossOver();

        /**
         * The mutations used for the mutation procedure.
         *
         * @type {Array}
         */
        this.mutations = [];

        /**
         * Probability for a close mutation.
         *
         * @type {Number}
         */
        this.closeMutationProbability = 0.75;

        /**
         * Probability for an arbitrary mutation.
         *
         * @type {Number}
         */
        this.arbitraryMutationProbability = 0.875;

        /**
         * Desired pareto front ratio.
         *
         * @type {Number}
         */
        this.desiredParetoFrontRatio = 0.2;
    }

    /**
     * Initialises the Genetic Optimisation algorithm.
     *
     * Set up the mutations used.
     * Calculate the initial Pareto Front and fitness values;
     */
    GeneticOptimisation.prototype.initialise = function(script) {
        this.executable = script.exe;
        this.mutations.push(new CloseMutation());
        this.mutations.push(new ArbitraryMutation());
        this.mutations.push(new RandomMutation());
        this.calculateParetoFront();
        this.calculateFitness();
    };

    /**
     * The tournament to be used for the construction of the mating pool.
     */
    GeneticOptimisation.prototype.setTournament = function(tournament) {
        this.tournament = tournament;
    };

    /**
     * The cross-over to be used for the production of offspring.
     */
    GeneticOptimisation.prototype.setCrossOver = function(crossover) {
        this.crossover = crossover;
    };

    /**
     * Generates the next generation.
     */
    GeneticOptimisation.prototype.nextGeneration = function() {
        this.initialiseNewPopulation();
        this.constructMatingPool();
        this.produceOffspring();
        this.mutateOffspring();
        this.calculateParetoFront();
        this.calculateFitness();
    };

    /**
     * Initialises the new population.
     *
     * When there are too many individuals in the pareto front,
     * i.e. when desiredParetoFrontSize is exceeded,
     * a random individual from the pareto front is replaced by
     * a new random individual.
     */
    GeneticOptimisation.prototype.initialiseNewPopulation = function() {
        // calculate current and desired amount of individuals in the pareto front
        var currentParetoFrontSize = this.nondominated.length;
        var desiredParetoFrontSize = parseFloat((this.desiredParetoFrontRatio * this.population.length).toFixed(0));
        // initialise variables
        var individual;
        var quantity;
        // check if we have too many individuals in the pareto front
        while (currentParetoFrontSize > desiredParetoFrontSize) {
            individual = Random.prototype.getRandomElement(this.nondominated);
            // if needed, throw away random individuals in the pareto front
            if (individual.inParetoFront) {
                for (var i = individual.inputvector.length - 1; i >= 0; i--) {
                    // by replacing them with a random individual
                    quantity = individual.inputvector[i];
                    quantity.value = Random.prototype.getRandomDouble(quantity.minimum, quantity.maximum, quantity.precision);
                }
                // recalculate the pareto front
                this.calculateParetoFront();
                currentParetoFrontSize = this.nondominated.length;
            }
        }
    };

    /**
     * Calculates the nondominated individuals.
     */
    GeneticOptimisation.prototype.calculateParetoFront = function() {
        // save the size of the population
        var size = this.population.length;
        // initialise variable
        var individual;
        // calculate output values
        for (var i = size - 1; i >= 0; i--) {
            individual = this.population[i];
            this.executable.executeQuantities(individual.inputvector, individual.outputvector);
        }
        // mark all individuals as nondominated
        for (var i = size - 1; i >= 0; i--) {
            this.population[i].inParetoFront = true;
        }
        // compare all individuals with each other
        for (var i = size - 1; i >= 0; i--) {
            for (var j = size - 1; j >= 0; j--) {
                individual = this.population[j];
                // if they are dominated mark them as such
                if (this.population[i].dominates(individual)) {
                    individual.inParetoFront = false;
                }
            }
        }
        // initialise the dominated and nondominated set
        this.dominated = [];
        this.nondominated = [];
        // update the dominated and nondominated set
        for (var i = size - 1; i >= 0; i--) {
            individual = this.population[i];
            if (individual.inParetoFront) {
                this.nondominated.push(individual);
            } else {
                this.dominated.push(individual);
            }
        }
    };

    /**
     * Calculates the fitness values.
     *
     * The fitness value of an individual is determined
     * by the sum of strenth values of its dominators.
     */
    GeneticOptimisation.prototype.calculateFitness = function() {
        // calculate the strength values of the population
        this.calculateStrength();
        // save the size of the population
        var size = this.population.length;
        // initialise variables
        var sum;
        var individual;
        // compare all individuals with each other
        for (var i = size - 1; i >= 0; i--) {
            sum = 0;
            individual = this.population[i];
            for (var j = size - 1; j >= 0; j--) {
                var anotherIndividual = this.population[j];
                // update fitness if individual is dominated by another
                if (anotherIndividual.dominates(individual)) {
                    sum += anotherIndividual.strength;
                }
            }
            individual.fitness = sum;
        }
    };

    /**
     * Calculates strength values.
     *
     * The strength value of an individual is determined
     * by how many others it dominates.
     */
    GeneticOptimisation.prototype.calculateStrength = function() {
        // save the size of the population
        var size = this.population.length;
        // initialise variable
        var individual;
        // compare all individuals with each other
        for (var i = size - 1; i >= 0; i--) {
            individual = this.population[i];
            individual.strength = 0;
            for (var j = size - 1; j >= 0; j--) {
                // update strength if individual dominates another
                if (individual.dominates(this.population[j])) {
                    individual.strength++;
                }
            }
        }
    };

    /**
     * Constructs the mating pool.
     *
     * The mating pool is constructed by using the desired tournament with replacement.
     */
    GeneticOptimisation.prototype.constructMatingPool = function() {
        // initialise variables
        this.matingpool = [];
        var individual1;
        var individual2;
        // fill the mating pool
        while (this.matingpool.length < this.population.length - this.dominated.length) {
            individual1 = Random.prototype.getRandomElement(this.population);
            individual2 = Random.prototype.getRandomElement(this.population);
            // run a tournament to determine the winner and add a clone
            // (instead of a reference) to the mating pool
            this.matingpool.push(CloneObject(this.tournament.select(individual1, individual2)));
        }
    };

    /**
     * Produce offspring.
     *
     * All nondominated individuals survive.
     * The offspring is produced by applying the desired cross-over.
     */
    GeneticOptimisation.prototype.produceOffspring = function() {
        // initialise variables
        var offspring = [];
        var parent1;
        var parent2;
        // loop over pairs of individuals in the mating pool
        for (var i = this.matingpool.length - 1; i >= 0; i -= 2) {
            parent1 = this.matingpool[i];
            parent2 = this.matingpool[i - 1];
            // no second parent available anymore, mating pool has odd length
            // parent1 will be chosen as 'offspring'
            if (!parent2) {
                this.population[i] = this.matingpool[i];
                break;
            }
            // do a cross-over to produce two children
            offspring = this.crossover.produce(parent1, parent2);
            this.population[i] = offspring[0];
            this.population[i - 1] = offspring[1];
        }
    };

    /**
     * Mutate the offspring.
     *
     * Only the dominated individuals are mutated.
     * The offspring is mutated by applying the desired mutation.
     */
    GeneticOptimisation.prototype.mutateOffspring = function() {
        // initialise variable
        var mutation;
        // loop over all dominated individuals
        for (var i = this.dominated.length - 1; i >= 0; i--) {
            // decide which mutation to use
            mutation = Math.random();
            if (mutation <= this.closeMutationProbability) {
                mutation = new CloseMutation();
            } else if (mutation <= this.arbitraryMutationProbability) {
                mutation = new ArbitraryMutation();
            } else {
                mutation = new RandomMutation();
            }
            // apply the mutation
            mutation.mutate(this.dominated[i]);
        }
    };

    return GeneticOptimisation;
});
