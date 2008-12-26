/**
 * @file bar.js My Bar.
 */

/** My Bar class. @class Bar */

/**
 * Creates a new Bar.
 * @constructor Bar
 * @param {Foo} foo Foo with which to make bar.
 */
function Bar(foo) {
    this.foo = foo;
    return this;
}

/** @scope */

/** @function makeBar Creates a new Bar. */
function makeBar() {
    var bar = new Bar();
    bar.foo = new Foo(bar);
    return bar;
}

/** @property Bar.re Regexp for Bar. */
Bar.re = /bar/;

/** @scope Bar */

/**
 * Gets this Bar's foo.
 * @function {Foo} getFoo
 * @return This bar's foo.
 */
Bar.prototype.getFoo = function() {
    return this.foo;
}

