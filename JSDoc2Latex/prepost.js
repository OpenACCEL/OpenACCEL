/**
    @overview Adds pre and postcondition data
    @module plugins/prepost
    @author Roel Jacobs
 */
'use strict';

/*
 * Defines the new tags.
 */
exports.defineTags = function(dictionary) {
    // @pre tag
    dictionary.defineTag('pre', {
        mustHaveValue: true,
        // When tag is found
        onTagged: function(doclet, tag) {
            // Initialize precondition array when undefined
            if (tag.value) {
                if (!doclet.pre) {
                    doclet.pre = []
                }
                doclet.pre.push(tag.value);
            }
        }
    })
        .synonym("precondition");

    // @post tag
    dictionary.defineTag('post', {
        mustHaveValue: true,
        // When tag is found
        onTagged: function(doclet, tag) {
            // Initialize postcondition array when undefined

            if (tag.value) {
                if (!doclet.post) {
                    doclet.post = []
                }
                doclet.post.push(tag.value);
            }
        }
    })
        .synonym("postcondition");;
}