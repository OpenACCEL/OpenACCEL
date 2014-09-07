require.config({
    baseUrl: "scripts"
});

define(["View/HTMLBuffer", "Model/EMO/GeneticOptimisation"], /**@lends View*/ function(HTMLBuffer, GeneticOptimisation) {
    function Optimisation(canvasCreator) {
        this.individualPropertiesBuffer = new HTMLBuffer();

        /**
         * The main canvas where the user sees the generated population and select
         * an indiviual.
         */
        this.canvas = canvasCreator.createCanvas(new GeneticOptimisation(), 'optimisation_plot', 400, 400);

        this.geneticOptimisationValues = {
            population: 25,
            stepsize: 1,
            crossover: 90,
            mutation: [70, 85],
            maxfront: 50
        };

        $('#optimisation_populationsize').slider({
            range: "min",
            value: this.geneticOptimisationValues.population,
            min: 1,
            max: 500,
            step: 1,
            slide: (function(event, ui) {
                $('#optimisation_populationsizevalue').html('(' + ui.value + ')');

                this.geneticOptimisationValues.population = ui.value;
                //No controller call until the associated button is pressed
            }).bind(this)
        });

        $('#optimisation_stepsize').slider({
            range: "min",
            value: this.geneticOptimisationValues.stepsize,
            min: 1,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                $('#optimisation_stepsizevalue').html('(' + ui.value + ')');

                this.geneticOptimisationValues.stepsize = ui.value;
                //No controller call until the associated button is pressed
            }).bind(this)
        });

        $('#optimisation_crossover').slider({
            range: 'min',
            value: this.geneticOptimisationValues.crossover,
            min: 1,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                $('#optimisation_crossovervalue').html('(' + ui.value + '%)');

                this.geneticOptimisationValues.crossover = ui.value;
                try {
                    controller.setCrossover(this.geneticOptimisationValues.crossover);
                } catch (e) {}
            }).bind(this)
        });

        var mutationcontrol = $('#optimisation_mutation');
        //Add second range div
        mutationcontrol.prepend('<div class="ui-slider-range ui-widget-header ui-corner-all"></div>');
        //jQuery sliderify
        mutationcontrol.slider({
            range: true,
            values: this.geneticOptimisationValues.mutation,
            min: 0,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                var close = ui.values[0];
                var arbitrary = ui.values[1] - close;
                var random = 100 - arbitrary - close;

                $('#optimisation_mutation .ui-slider-range:first-child').css({
                    width: close + '%'
                });

                $('#optimisation_mutationvalue').html('' +
                        '<ul>' +
                            '<li>' +
                                '<div class = "legendbox" style = "background: #331144"></div>' +
                                'Close (' + close + '%)' +
                            '</li>' +
                            '<li>' +
                                '<div class = "legendbox" style = "background: #9900AA"></div>' +
                                'Arbitrary (' + arbitrary + '%)' +
                            '</li>' +
                            '<li>' +
                                '<div class = "legendbox" style = "background: #FFFFFF"></div>' +
                                'Random (' + random + '%)' +
                            '</li>' +
                        '</ul>');

                this.geneticOptimisationValues.mutation = ui.values;
                try {
                    controller.setMutation(this.geneticOptimisationValues.mutation);
                } catch (e) {

                }
            }).bind(this)
        });

        $('#optimisation_maxfront').slider({
            range: "min",
            value: this.geneticOptimisationValues.maxfront,
            min: 1,
            max: 100,
            step: 1,
            slide: (function(event, ui) {
                $('#optimisation_maxfrontvalue').html('(' + ui.value + '%)');

                this.geneticOptimisationValues.maxfront = ui.value;
                try {
                    controller.setMaxfront(this.geneticOptimisationValues.maxfront);
                } catch (e) {}
            }).bind(this)
        });

        var GOControls = $('.optimisation_control');
        GOControls.each(
            function(index, element) {
                var control = $(GOControls[index]);
                control.slider('option', 'slide').call(control, null, {
                    value: control.slider('option', 'value'),
                    values: control.slider('option', 'values')
                });
            }
        );

        $('#optimisation_init').on('click',
            (function() {
                controller.initialiseGeneticOptimisation(this.geneticOptimisationValues.population);
                this.individualPropertiesBuffer.empty();
                this.individualPropertiesBuffer.flip("#optimisation_properties");
            }).bind(this)
        );

        $('#optimisation_step').on('click',
            (function() {
                controller.nextGeneration(this.geneticOptimisationValues.stepsize);
                $('#optimisation_plot').trigger('click');
            }).bind(this)
        );

        $('#optimisation_plot').on('click',
            (function() {
                var individual = this.canvas.getClickedIndividual();
                var q;

                this.individualPropertiesBuffer.empty();

                if (individual === null) {
                    this.individualPropertiesBuffer.flip("#optimisation_properties");
                    return;
                }

                this.individualPropertiesBuffer.append('' +
                    '<h4>Category I quantities</h4>' +
                    '<div class = "divtable">' +
                        '<div>' +
                            '<div><em>name</em></div>' +
                            '<div><em>value</em></div>' +
                            '<div><em>minimum</em></div>' +
                            '<div><em>maximum</em></div>' +
                        '</div>');

                for (q in individual.inputvector) {
                    this.individualPropertiesBuffer.append('' +
                        '<div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].name + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].value + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].minimum + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.inputvector[q].maximum + '</div>' +
                        '</div>');
                }

                this.individualPropertiesBuffer.append('</div>');

                this.individualPropertiesBuffer.append('' +
                    '<h4>Category II quantities</h4>' +
                    '<div class = "divtable">' +
                        '<div>' +
                            '<div><em>name</em></div>' +
                            '<div><em>value</em></div>' +
                            '<div><em>optimisation</em></div>' +
                        '</div>');

                for (q in individual.outputvector) {
                    this.individualPropertiesBuffer.append('' +
                        '<div>' +
                            '<div class = "max128w ellipsis">' + individual.outputvector[q].name + '</div>' +
                            '<div class = "max128w ellipsis">' + individual.outputvector[q].value + '</div>' +
                            '<div class = "max128w ellipsis">' + (individual.outputvector[q].maximize ? 'Maximized' : 'Minimized') + '</div>' +
                        '</div>');
                }

                this.individualPropertiesBuffer.append('</div>');

                this.individualPropertiesBuffer.flip("#optimisation_properties");
            }).bind(this)
        );

        $('#optimisation_smartzoom').on('click',
            (function() {
                this.smartZoom();
            }).bind(this)
        );

        $('#optimisation_zoomtofit').on('click',
            (function() {
                this.zoomToFit();
            }).bind(this)
        );
    }

    /**
     * Event that gets called when this tab gets opened.
     */
    Optimisation.prototype.onEnterTab = function() {

    };

    /**
     * Event that gets called when this tab gets closed.
     */
    Optimisation.prototype.onLeaveTab = function() {

    };

    Optimisation.prototype.smartZoom = function() {
        this.canvas.smartZoom();
        this.canvas.draw();
    };

    Optimisation.prototype.zoomToFit = function(show) {
        this.canvas.zoomToFit();
        this.canvas.draw();
    };

    /**
     * Clears the plot canvas
     */
    Optimisation.prototype.clearCanvas = function() {
        this.canvas.clearCanvas();
    };

    /**
     * Updates the plot canvas
     */
    Optimisation.prototype.drawPlot = function() {
        this.canvas.draw();
    };

    return Optimisation;
});
