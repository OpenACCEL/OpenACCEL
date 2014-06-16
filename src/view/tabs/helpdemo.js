$(document).ready(
    function() {
        synchronizeCategories(['#all functions',
                               'Descartes',
                               'algebra',
                               'general',
                               'image',
                               'logic',
                               'optimisation',
                               'special',
                               'statistics',
                               'transcendental',
                               'vector']);

        synchronizeArticles(['@',
                             'abs',
                             'acos',
                             'add',
                             'and',
                             'asin']);

        var article = {
            help : "iGaussian(n1,n2,s1,s2) creates a vector of n1 vectors each of n2 scalar elements; indices are integers starting with 0. Element [i][j] has value P*exp(-(i-n1/2)*(i-n1/2)/(2*s1*s1)-(j-n2/2)*(j-n2/2)/(2*s2*s2)), where i ranges from 0 to n1-1, j from 0 to n2-1, and where P is such that the sum over all elements is one.",
            autoMapping : "Does not support auto-mapping.",
            details : "Notice 1:The third and fourth arguments plays the role of sigma in the standard definition of the Gaussian. These don't have to be integer. The Gaussian has an infinite support; parameters n1 and n2 are necessarily is finite. Therefore, the resulting Gaussian will always be a truncated version, even if the ratio between n and s is very large. The normalisation nevertheless ensures that the (truncated) Gaussian can serve e.g. as a stable low pass filter.<br>Notice 2:For even n, the resulting approximation has no single extreme apex. For odd n, there is a single extreme apex.",
            seeAlso : "vConvolve,vGaussian,iConvolve",
            external : "See <a href='http://en.wikipedia.org/wiki/Gaussian_function'>http://en.wikipedia.org/wiki/Gaussian_function</a>",
            abbreviation : "No abbreviation",
            example : ""
        };
        showHelpArticle(article);

        synchronizeDemoScripts(['anEveningInTheBar.txt',
                                'ballAndStick.txt',
                                'ballAndStickCtrl.txt',
                                'barChart.txt',
                                'biljart.txt',
                                'canon ball shooting.txt',
                                'chimneySweepers1.txt',
                                'chimneySweepers2.txt',
                                'clickDemo.txt']);
    }
);

//------------------------------------------------------------------------------

function searchHelp(phrase) {
    console.log('phrase: ' + phrase);
}

function selectHelpCategory(category) {
    console.log('category: ' + category);
}

function selectHelpArticle(article) {
    console.log('article: ' + article);
}

function loadDemoScript(demoscript) {
    console.log('demoscript: ' + demoscript);
}

//------------------------------------------------------------------------------

function synchronizeCategories(categories) {
    helpCategoryList.set(categories);
}

function synchronizeArticles(articles) {
    helpArticleList.set(articles);
}

function showHelpArticle(article) {
    helpTextBuffer.empty();

    helpTextBuffer.append('<h1>' + article + '</h1>');

    for(var member in article) {
        helpTextBuffer.append('<h3>' + member + '</h3>');
        helpTextBuffer.append('<p>' + article[member] + '</p>');
    }

    helpTextBuffer.flip();
}

function synchronizeDemoScripts(demoscripts) {
    demoScriptList.set(demoscripts);
}

//------------------------------------------------------------------------------

var helpCategoryList = new selectionList('#helpcategories', selectHelpCategory);
var helpArticleList = new selectionList('#helparticles', selectHelpArticle);
var demoScriptList = new selectionList('#demoscripts', loadDemoScript);

/**
 * Buffer to contain #helptext content
 * @type {HTMLbuffer}
 */
var helpTextBuffer = new HTMLbuffer('#helptext');
