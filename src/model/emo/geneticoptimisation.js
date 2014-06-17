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

define([], /**@lends Model.EMO*/ function() {

    /**
     * @class
     * @classdesc Class for a Genetic Optimisation algorithm based on
     * the Strength Pareto Evolutionary Algorithm.
     */
    function GeneticOptimisation() {

        /**
         * The population.
         *
         * @type {Array}
         */
        this.population = [];

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

        this.closeMutationProbability = 0.75;
        this.arbitraryMutationProbability = 0.875;

        this.frontRatio = 0.5;
    }

    GeneticOptimisation.prototype.initialise = function() {
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
        this.constructMatingPool();
        this.produceOffspring();
        this.calculateParetoFront();
        this.mutateOffspring();
        this.calculateParetoFront();
        this.calculateFitness();
        // this.checkMaxPercentageInParetoFront();
    };

    /**
     * Calculates the nondominated individuals.
     */
    GeneticOptimisation.prototype.calculateParetoFront = function() {
        // save the size of the population
        var size = this.population.length;
        // mark all individuals as nondominated
        for (var i = size - 1; i >= 0; i--) {
            this.population[i].inParetoFront = true;
        }
        var individual;
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
        var sum;
        var individual;
        var anotherIndividual;
        // compare all individuals with each other
        for (var i = size - 1; i >= 0; i--) {
            sum = 0;
            individual = this.population[i];
            for (var j = size - 1; j >= 0; j--) {
                anotherIndividual = this.population[j];
                // update fitness if individual is dominated by another
                if (anotherIndividual.dominates(individual)) {
                    sum += anotherIndividual.strength;
                }
            }
            // set the calculated fitness value
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
        // initialise the mating pool
        this.matingpool = [];
        var individual1;
        var individual2;
        // fill the mating pool
        while (this.matingpool.length < this.population.length - this.nondominated.length) {
            individual1 = Random.prototype.getRandomElement(this.dominated);
            individual2 = Random.prototype.getRandomElement(this.dominated);
            // run a tournament to determine the winner and add a clone
            // (instead of a reference) to the mating pool
            this.matingpool.push(this.tournament.select(individual1, individual2).clone());
        }
    };

    /**
     * Produce offspring.
     *
     * All nondominated individuals survive.
     * The offspring is produced by applying the desired cross-over.
     */
    GeneticOptimisation.prototype.produceOffspring = function() {
        // all nondominated individuals survive
        this.population = this.nondominated.slice();
        var parent1;
        var parent2;
        var offspring = [];
        // loop over pairs of individuals in the mating pool
        while (this.matingpool.length > 0) {
            // individuals have a 10% probability not to mate
            if (Math.random() <= 0.1) {
                this.population.push(this.matingpool.pop());
            } else {
                parent1 = this.matingpool.pop();
                parent2 = this.matingpool.pop();
                // no second parent available anymore, mating pool has odd length
                // parent1 will be chosen as 'offspring'
                if (!parent2) {
                    this.population.push(parent1);
                    break;
                }
                // do a cross-over to produce two children
                offspring = this.crossover.produce(parent1, parent2);
                this.population.push(offspring[0]);
                this.population.push(offspring[1]);
            }
        }
    };

    /**
     * Mutate the offspring.
     *
     * Only the dominated individuals are mutated.
     * The offspring is mutated by applying the desired mutation.
     */
    GeneticOptimisation.prototype.mutateOffspring = function() {
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

    GeneticOptimisation.prototype.checkMaxPercentageInParetoFront = function() {
        var index;
        var individual;
        while (this.nondominated.length / this.population.length > this.frontRatio) {
            index = Random.prototype.getRandomInt(0, this.nondominated.length - 1);
            individual = this.nondominated[index];
            individual.inParetoFront = false;
            if (index > -1) {
                this.nondominated.splice(index, 1);
            }
        }
    }
});
