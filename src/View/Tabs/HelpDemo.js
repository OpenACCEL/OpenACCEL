require.config({
    baseUrl: "scripts"
});

define(["View/Input", "View/HTMLBuffer"], /**@lends View*/ function(Input, HTMLBuffer) {
    /**
     * @class
     * @classdesc The HelpDemo tab.
     */
    function HelpDemo() {
        /**
         * Buffer to contain #helptext content
         * @memberof View
         * @type {HTMLbuffer}
         */
        this.helpTextBuffer = new HTMLBuffer('#helptext');

        this.Input = new Input(this.helpTextBuffer);

        this.helpCategoryList = new this.Input.SelectionList('#helpcategories', this.selectHelpCategory);
        this.helpArticleList = new this.Input.SelectionList('#helparticles', this.selectHelpArticle);
        this.demoScriptList = new this.Input.SelectionList('#demoscripts', this.loadDemoScript);

        this.synchronizeCategories(['#all functions',
            'Descartes',
            'algebra',
            'general',
            'image',
            'logic',
            'optimisation',
            'special',
            'statistics',
            'transcendental',
            'vector'
        ]);

        this.synchronizeArticles(['@',
            'abs',
            'acos',
            'add',
            'and',
            'asin'
        ]);

        this.article = {
            help: "iGaussian(n1,n2,s1,s2) creates a vector of n1 vectors each of n2 scalar elements; indices are integers starting with 0. Element [i][j] has value P*exp(-(i-n1/2)*(i-n1/2)/(2*s1*s1)-(j-n2/2)*(j-n2/2)/(2*s2*s2)), where i ranges from 0 to n1-1, j from 0 to n2-1, and where P is such that the sum over all elements is one.",
            autoMapping: "Does not support auto-mapping.",
            details: "Notice 1:The third and fourth arguments plays the role of sigma in the standard definition of the Gaussian. These don't have to be integer. The Gaussian has an infinite support; parameters n1 and n2 are necessarily is finite. Therefore, the resulting Gaussian will always be a truncated version, even if the ratio between n and s is very large. The normalisation nevertheless ensures that the (truncated) Gaussian can serve e.g. as a stable low pass filter.<br>Notice 2:For even n, the resulting approximation has no single extreme apex. For odd n, there is a single extreme apex.",
            seeAlso: "vConvolve,vGaussian,iConvolve",
            external: "See <a href='http://en.wikipedia.org/wiki/Gaussian_function'>http://en.wikipedia.org/wiki/Gaussian_function</a>",
            abbreviation: "No abbreviation",
            example: ""
        };
        
        this.showHelpArticle(this.article);

        this.synchronizeDemoScripts(['anEveningInTheBar.txt',
            'ballAndStick.txt',
            'ballAndStickCtrl.txt',
            'barChart.txt',
            'biljart.txt',
            'canon ball shooting.txt',
            'chimneySweepers1.txt',
            'chimneySweepers2.txt',
            'clickDemo.txt'
        ]);
    }

    HelpDemo.prototype.searchHelp = function(phrase) {
        console.log('phrase: ' + phrase);
    }

    HelpDemo.prototype.selectHelpCategory = function(category) {
        console.log('category: ' + category);
    }

    HelpDemo.prototype.selectHelpArticle = function(article) {
        console.log('article: ' + article);
    }

    HelpDemo.prototype.loadDemoScript= function(demoscript) {
        console.log('demoscript: ' + demoscript);
    }

    HelpDemo.prototype.synchronizeCategories = function(categories) {
        this.helpCategoryList.set(categories);
    }

    HelpDemo.prototype.synchronizeArticles = function(articles) {
        this.helpArticleList.set(articles);
    }

    HelpDemo.prototype.showHelpArticle = function(article) {
        this.helpTextBuffer.empty();

        this.helpTextBuffer.append('<h1>' + article + '</h1>');

        for (var member in article) {
            this.helpTextBuffer.append('<h3>' + member + '</h3>');
            this.helpTextBuffer.append('<p>' + this.article[member] + '</p>');
        }

        this.helpTextBuffer.flip();
    }

    HelpDemo.prototype.synchronizeDemoScripts = function(demoscripts) {
        this.demoScriptList.set(demoscripts);
    }

    return HelpDemo;
});
