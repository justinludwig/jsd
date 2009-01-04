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

    for (var re = /\/\*\*([^\v]+?)\*\//g, a; a = re.exec(this.input);) {
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
        m.call(this, this);
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
    this.name = (name || "").toLowerCase();
    this.value = value || "";
    this.text = text || "";
    this.modifiers = modifiers || [];
    return this;
}

/**
 * @class JSD.TemplateDriven
 * Template-driven class jsd.
 */
JSD.TemplateDriven = function(o) {
    var jsd = new JSD(o);
    for (var i in jsd)
        if (!this[i])
            this[i] = jsd[i];
    return this;
}

JSD.TemplateDriven.prototype.print = function(s) {
    this.template = s || this.template;
    return new JST().run(this.template, { jsd: this });
}

/** @scope JSD */

/**
 * @function hierarchicalModeler
 * Modeler which popuplates "parent" tags
 * with an array of their "children",
 * based on the childToParents conf setting.
 */
JSD.hierarchicalModeler = function() {
    var map = JSD.hierarchicalModeler.childToParents;
    if (!map) return;

    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++) {
        var parents = map[tag.name];
        if (parents)
            for (var j = i - 1; j >= 0; j--) {
                var parent = tags[j];
                if (parents.indexOf(parent.name) != -1) {
                    Utl.addToArrayProperty(this, tag.name, tag, true);
                    break;
                }
            }
    }
}

/**
 * @function topLevelModeler
 * Modeler which populates arrays of top-level tags
 * in the main jsd object,
 * based on the topLevelTags conf setting.
 */
JSD.topLevelModeler = function() {
    var list = JSD.topLevelModeler.topLevelTags;
    if (!list) return;

    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++)
        if (list.indexOf(tag.name) != -1) {
            Utl.addToArrayProperty(this, tag.name, tag, true);
            break;
        }
}

/**
 * @function synonymModeler
 * Modeler which replaces tag names with their synonyms,
 * based on the tagToReplacement conf setting.
 */
JSD.synonymModeler = function() {
    var map = JSD.synonymModeler.tagToReplacement;
    if (!map) return;

    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++) {
        var replacement = map[tag.name];
        if (replacement)
            tag.name = replacement;
    }
}

/**
 * @function endNamespaceModeler
 * Modeler which clears out any extra "end" tag data
 * (so as to make it work like a global "scope" tag).
 */
JSD.endNamespaceModeler = function() {
    if (!this.ends) return;

    for (var i = 0, tag, tags = this.ends; tag = tags[i]; i++) {
        tag.value = "";
        tag.text = "";
        tag.modifiers = [];
    }
}

JSD.allNamespacesModeler = function() {
    var list = JSD.allNamespacesModeler.namespaceTags;
    if (!list) return;

    // recursively prefix each local name with the appropriate full namesapce
    function normalize(parent, space) {
        for (var i = 0, name; name = list[i]; i++) {
            var tags = parent[Utl.pluralize(name)];
            if (tags)
                for (var j = 0, tag; tag = tags[j]; j++) {
                    tag.value = space + tag.value;
                    normalize(tag, tag.value + ".");
                }
        }
    }
    normalize(this, "");

    // create list/map of all namespaces
    var all = [],  map = {};
    for (var i = 0, name; name = list[i]; i++) {
        var tags = parent[Utl.pluralize(name)];
        if (tags)
            for (var j = 0, tag; tag = tags[j]; j++) {
                all.push(tag.value);

                // use this tag as cannonical for name
                // if existing tag doesn't have any descriptive text
                var existing = map[tag.value];
                if (!existing && !existing.text)
                    map[tag.value] = tag;
            }
    }
    
    // create sorted master array of all namespaces
    all.sort();
    this.allNamespaces = [];
    for (var i = 0, a; a = all[i]; i++)
        if (i == 0 || a != all[i-1])
            this.allNamespaces.push(map[a]);
}
