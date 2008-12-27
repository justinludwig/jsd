/**
 * @file jsd.sh Main jsd code.
 */

/**
 * @class JSD
 * Main jsd class.
 */
function JSD(o) {
    // copy properties from o
    if (o)
        for (var i in o)
            this[i] = o[i];

    return this;
}

/**
 * @function {string} run
 * Runs jsd.
 * @param {string} s Input text.
 * @return Output text.
 */
JSD.prototype.run = function(s) {
    this.parse(s);
    this.model();
    return this.print();
}

JSD.prototype.parse = function(s) {
    this.input = s || this.input || "";
    this.tags = this.tags || [];

    for (var re = /\/\*\*([^\v]+?)\*\//g, a; a = re.exec(s);) {
        var comment = a[1];
        // strip leading and trailing asterixes
        comment = comment.replace(/^\*+|\*+$/g, "");
        // strip line-starting asterixes
        comment = comment.replace(/\s*\*+\s*/g, " ");
        this.parseComment(comment);
    }
    
    //Utl.log(Utl.dump(this.tags));
    return this.tags;
}

// parse special inner tags (ie {@link Foo})
JSD.prototype.parseInnerComment = function(s) {
    for (var re = /\{@([^\s}]+)\s*([^\s}]*)([^}]*)}/g, a; a = re.exec(s);) {
        var name = a[1];
        var value = a[2];
        var text = Utl.trim(a[3]);
    }
}

JSD.prototype.parseComment = function(s) {
    s = s || "";

    // temporarily remove inner tags (ie {@link Foo})
    s = s.replace(/\{@/g, "{#");

    for (var re = /([^\@]+?\s)?@([^\s@]+)\s*(?:\{([^\}]*)\}\s*)?([^\s@]*)([^@]*)/g, a; a = re.exec(s);) {
        var text0 = Utl.trim(a[1]);
        var name = a[2];
        var modifiers = Utl.trim(a[3]);
        var value = a[4];
        var text1 = Utl.trim(a[5]);

        // combine leading and following text
        var text = text0;
        if (text1) {
            if (text)
                text = text + " " + text1;
            else
                text = text1;
        }
        text = text.replace(/\{#/g, "{@");

        this.tags.push(new JSD.Tag(name, value, text, modifiers ? modifiers.split(/\s+/) : []));
    }
}

JSD.prototype.model = function(modelers) {
    this.modelers = modelers || this.modelers || [];
    for (var i = 0, m; m = this.modelers[i]; i++)
        m();
    return this;
}

JSD.prototype.print = function() {
    this.output = Utl.dump(this);
    return this.output;
}

/**
 * @class JSD.Tag
 * Represents a javadoc tag.
 */
JSD.Tag = function(name, value, text, modifiers) {
    this.name = name || "";
    this.value = value || "";
    this.text = text || "";
    this.modifiers = modifiers || [];
    return this;
}


