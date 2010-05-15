/*
Copyright (c) 2010 Justin Ludwig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * @file default.conf
 * This is the default jsd config file.
 * It is itself a javascript file.
 */

/** @scope JSD */

/** @property {static string} template Space-separated list of .jst template directories. */
JSD.template = "template/default";
/** @property {static string} templateType Space-separated list of .jst template extensions. */
JSD.templateType = ".jst";
/** @property {static string} srcType Space-separated list of src extensions. */
JSD.srcType = ".js";
/** @property {static string} ignoreType Space-separated list of extensions of files in template directory to ignore. */
JSD.ignoreType = ".svn ~ .swp .DS_Store";

/** @property {static function[]} modelers Array of functions to execute on JSD model. */
JSD.modelers = [
    JSD.Modeler.synonym, // replace synonyms with canonical name
    JSD.Modeler.emptyFile, // clean up empty file tags
    JSD.Modeler.parentChild, // add child arrays to parent tags
    JSD.Modeler.endNamespace, // clean up "end" tags
    JSD.Modeler.name, // replace parent's value with "name" tag
    JSD.Modeler.description, // merge "description" tags into parent's text
    JSD.Modeler.topLevel, // add top-level arrays for top-level tags
    JSD.Modeler.nsMap, // create map of ns (namespace) tags
    JSD.Modeler.nsDisjoint, // add child arrays to parent tags based on namespaces
    JSD.Modeler.nsTop, // create list of top-level ns tags
    JSD.Modeler.nsContainers, // create list of ns tags which contain other top-level tags
    JSD.Modeler.nsGlobals, // include pseudo "globals" tag in ns.all, ns.top, and ns.containers
    JSD.Modeler.objectHierarchy, // create graph of object-hierarchy (based on "extends", etc)
    JSD.Modeler.project // creates master "project" jsd property
];

/** @end */

/** @property {string[string]} JSD.Modeler.synonym.tagToReplacement Map of tag names to replacement-names. */
JSD.Modeler.synonym.tagToReplacement = {
    scope: "namespace",
    "var": "property"
};

/** @property {string[]} JSD.Modeler.topLevel.topLevelTags Array of tags to add to the top-level. */
JSD.Modeler.topLevel.topLevelTags = [
    "class",
    "end",
    "event",
    "file",
    "function",
    "ifunction",
    "interface",
    "module",
    "namespace",
    "project",
    "property",
    "struct"
];

/** @property {string[]} JSD.Modeler.nsMap.namespaceTags Array of namespace-able tags. */
JSD.Modeler.nsMap.namespaceTags = [
    "class",
    "event",
    "function",
    "ifunction",
    "interface",
    "module",
    "namespace",
    "property",
    "struct"
];

/** @property {JSD.Tag} JSD.Modeler.nsGlobals.globalsTag Special "globals" namespace. */
JSD.Modeler.nsGlobals.globalsTag = new JSD.Tag("namespace", "Globals", "Global variables and functions.");

/** @property {private string[string]} JSD.Modeler.parentChild._abbr Groups of tag names
 * repeated in the {@link #childToParents} config setting. */
JSD.Modeler.parentChild._abbr = {
    classes: ["class", "end", "interface", "namespace"]
};

/** @property {string[string[]]} JSD.Modeler.parentChild.childToParents Map of child tag names to possible parent tag names. */
JSD.Modeler.parentChild.childToParents = {
    "...": ["param"],
    author: JSD.Modeler.topLevel.topLevelTags,
    constructor: ["class"],
    description: JSD.Modeler.topLevel.topLevelTags,
    deprecated: JSD.Modeler.nsMap.namespaceTags,
    event: JSD.Modeler.parentChild._abbr.classes,
    "extends": ["class", "function", "ifunction", "interface", "struct"],
    "function": JSD.Modeler.parentChild._abbr.classes,
    ifunction: JSD.Modeler.parentChild._abbr.classes,
    "implements": ["class", "function"],
    inheritdesc: ["class", "event", "function", "ifunction", "interface", "property", "struct"],
    name: JSD.Modeler.topLevel.topLevelTags,
    paramset: ["constructor", "event", "function", "ifunction"],
    param: ["constructor", "event", "function", "ifunction", "paramset"],
    property: ["class", "end", "interface", "namespace", "struct"],
    requires: ["module"],
    "return": ["function", "ifunction"],
    see: JSD.Modeler.topLevel.topLevelTags,
    since: JSD.Modeler.topLevel.topLevelTags,
    struct: JSD.Modeler.parentChild._abbr.classes,
    "throws": ["function", "ifunction"],
    timestamp: ["file", "project"],
    version: ["file", "project"]
};

/** @property {JSD.Tag} JSD.Modeler.project.projectTag Default project tag. */
JSD.Modeler.project.projectTag = new JSD.Tag("project", "JS Docs");

/** @property {string[string]} JSD.Modeler.objectHierarchy.relations Map of child relation to parent relation. */
JSD.Modeler.objectHierarchy.relations = {
    "extends": "extendedBy",
    "implements": "implementedBy"
};

