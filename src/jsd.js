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

JSD.INNER_COMMENT = /\{@([^\s}]+)\s*([^\s}]*)([^}]*)}/g;

// parse special inner tags (ie {@link Foo})
JSD.prototype.parseInnerComment = function(s) {
    var inner = [];
    for (var re = JSD.INNER_COMMENT, a; a = re.exec(s);)
        inner.push(new JSD.Tag(a[1], a[2], Utl.trim(a[3])));
    return inner;
}

JSD.prototype.parseComment = function(s) {
    s = s || "";

    // temporarily remove inner tags (ie {@link Foo})
    s = s.replace(/\{@/g, "{#");

    for (var re = /([^\@]+?\s)?@([^\s@]+)\s*(?:\{([^\}]*)\}\s*)?([^\s@]*)([^@]*)/g, a; a = re.exec(s);) {
        var text0 = Utl.trim(a[1]);
        var name = a[2];
        var modifiers = Utl.trim(a[3]);
        modifiers = modifiers ? modifiers.split(/\s+/) : [];
        var value = a[4];
        var text1 = Utl.trim(a[5]);

        // combine leading and following text
        var text = Utl.trim(text0 + " " + text1).replace(/\{#/g, "{@");
        var inner = this.parseInnerComment(text);

        this.tags.push(new JSD.Tag(name, value, text, modifiers, inner));
    }
}

JSD.prototype.model = function(modelers) {
    this.modelers = modelers || this.modelers || [];
    for (var i = 0, m; m = this.modelers[i]; i++) {
        m.call(this, this);
    }
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
JSD.Tag = function(name, value, text, modifiers, inner) {
    this.name = (name || "").toLowerCase();
    this.value = value || "";
    this.text = text || "";
    this.modifiers = modifiers || [];
    this.inner = inner || [];
    return this;
}

JSD.Tag.sortByValue = function(list) {
    list.sort(function(x, y) {
        var xvalue = x.value || "", yvalue = y.value || "";
        if (xvalue < yvalue) return -1;
        if (xvalue > yvalue) return 1;
        return 0;
    });
    return list;
}

JSD.Tag.sortByArrayValue = function(list) {
    list.sort(function(x, y) {
        var xvalue = x[0].value || "", yvalue = y[0].value || "";
        if (xvalue < yvalue) return -1;
        if (xvalue > yvalue) return 1;
        return 0;
    });
    return list;
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
                    //Utl.log(tag.name + ": " +  tag.value + ", parent " + parent.name + ": " + parent.value);
                    // add child to foos array in parent tag
                    Utl.addToArrayProperty(parent, tag.name, tag, true);
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
        if (list.indexOf(tag.name) != -1)
            Utl.addToArrayProperty(this, tag.name, tag, true);
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
        // skip native Object functions like constructor
        if (typeof replacement == "string")
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
    var names = JSD.allNamespacesModeler.namespaceTags;
    if (!names) return;

    var nameslength = names.length;
    var tags = this.tags;

    // list including each namespace tag object
    var list = [];
    for (var i = 0, tag; tag = tags[i]; i++)
        // skip non-namespaces and global namespace
        if (tag.value && names.indexOf(tag.name) != -1) {
            list.push(tag);

            // prefix child namespaces
            for (var j = 0; j < nameslength; j++) {
                var children = tag[Utl.pluralize(names[j])];
                if (children)
                    for (var k = 0, child; child = children[k]; k++)
                        child.value = tag.value + "." + child.value;
            }
        }
    
    // create map of all namespaces; each value is a tag or array of tags
    var map = {};
    for (var i = 0, tag; tag = list[i]; i++) {
        var v = tag.value;
        var existing = map[v];

        if (!existing)
            map[v] = tag;
        else if (existing.constructor == Array)
            existing.push(tag);
        else
            map[v] = [existing, tag];
    }

    // combine arrays into single object, replacing references to each
    var remap = [];
    for (var i in map) {
        var multi = map[i];
        if (multi.constructor != Array) continue;

        // replace array with combined object
        var merged = Utl.merge(multi);
        // remove extra namespace/scope decls from tag name
        merged.name = merged.name.replace(/ namespace|namespace /g, "");
        map[i] = merged;

        // save originals to remap
        for (var j = 0, tag; tag = multi[j]; j++)
            remap.push({ original: tag, merged: merged });
    }

    // remap from multi-tags to merged tag
    for (var i = 0, tag; tag = tags[i]; i++)
        for (var j = 0; j < nameslength; j++) {
            var children = tag[Utl.pluralize(names[j])];
            if (children)
                for (var k = 0, child; child = children[k]; k++)
                    for (var m = 0, remapped; remapped = remap[m]; m++)
                        if (remapped == child)
                            children[k] = merged;
        }

    // create allNamespaces property
    this.allNamespaces = {
        sort: JSD.allNamespacesModeler.sort,
        sortChildren: JSD.allNamespacesModeler.sortChildren,
        top: JSD.allNamespacesModeler.top,
        containers: JSD.allNamespacesModeler.containers,
        map: map
    };
}

JSD.allNamespacesModeler.sort = function(jsd) {
    var map = jsd ? jsd.allNamespaces.map : this.map;

    // create list of all namespaces
    var list = [];
    for (var i in map)
        list.push(map[i]);
        
    return JSD.Tag.sortByValue(list);
}

JSD.allNamespacesModeler.sortChildren = function(tags, name) {
    var master = [];
    if (!tags || !tags.length) return master;
    
    // create master list of children
    var plural = Utl.pluralize(name);
    for (var i = 0, tag; tag = tags[i]; i++)
        for (var j = 0, child, children = tag[plural] || []; child = children[j]; j++)
            master.push(child);
        
    return JSD.Tag.sortByValue(master);
}

JSD.allNamespacesModeler.top = function(jsd) {
    var map = jsd ? jsd.allNamespaces.map : this.map;

    // create list of top-level namespaces
    var list = [];
    for (var i in map) {
        var tag = map[i];
        if (!/\./.test(tag.value))
            list.push(tag);
    }
        
    return JSD.Tag.sortByValue(list);
}

JSD.allNamespacesModeler.containers = function(jsd) {
    var map = jsd ? jsd.allNamespaces.map : this.map;
    var names = JSD.allNamespacesModeler.namespaceTags;

    // create list of namespaces with child namespaces
    var list = [];
    for (var i in map) {
        var tag = map[i];
        for (var k = 0, name; name = names[k]; k++) {
            var children = tag[Utl.pluralize(name)];
            if (children) {
                list.push(tag);
                break;
            }
        }
    }
        
    return JSD.Tag.sortByValue(list);
}

/**
 * @function emptyFileModeler
 * Modeler which removes empty file tags
 * (files tags with no other tags inside).
 */
JSD.emptyFileModeler = function() {
    var count = 1; // don't automatically remove first tag
    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++)
        if (tag.name == "file") {
            if (count < 1)
                tags.splice(i-- - 1, 1); // remove prev file tag
            count = 0;
        } else {
            count++;
        }
}

/**
 * @function linkModeler
 * Modeler which replaces inline link tags with an actual link.
 */
JSD.linkModeler = function() {
    var fn = JSD.linkModeler.createLink;
    if (!fn) return;
                
    // replace inner tag using linkFunction if tag is "link"
    var m = this;
    function replacement(comment, name, value, text) {
        return (name == "link" ? fn.call(m, tag, comment, value) : comment);
    }

    // search for tags with one or more inner "link" tags
    // and run replacement fn on text
    for (var i = 0, tag, tags = this.tags; tag = tags[i]; i++)
        for (var j = 0, t, tt = tag.inner; t = tt[j]; j++)
            if (t.name == "link") {
                tag.text = tag.text.replace(JSD.INNER_COMMENT, replacement);
                break;
            }
}

/**
 * @function {string} createLink
 * Creates the anchor tag for the specified link.
 * @param {JSD.Tag} tag Tag containing the link.
 * @param {string} comment Original inner comment (ex "{@link Foo.Foo2#two}").
 * @param {string} link Link (ex "Foo.Foo2#two").
 * @return Anchor tag or empty string ("").
 */
JSD.linkModeler.createLink = function(tag, comment, link) {
    var url = JSD.linkModeler.calculateUrl.call(this, tag, link);
    if (!url) return comment;

    return ["<a href='", url, "'>", link, "</a>"].join("");
}

/**
 * @function {string} calculateUrl
 * Calculates the url for the specified link.
 * @param {JSD.Tag} tag Tag containing the link.
 * @param {string} link Link (ex "Foo.Foo2#two").
 * @return Link url or empty string ("").
 */
JSD.linkModeler.calculateUrl = function(tag, link) {
    var a = /([^#(]*)(#[^(]*)?/.exec(link);
    if (!a) return "";

    var cls = a[1];
    var fn = a[2] || "";
    if (!cls) return fn;

    for (var i = 0, space, spaces = this.allNamespaces; space = spaces[i]; i++)
        if (cls == space.value)
            return cls.replace(/\./g, "/") + ".html" + fn;

    return "";
}

