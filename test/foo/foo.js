/**
 * @file foo.js Foo file.
 */

/**
 * @project Foo The foo project.
 * This project provides an simple example
 * of tagging javascript code for jsd.
 * @author Alice Foo
 * @author Bob Bar
 * @version 4.1.1.2a
 */

/**
 * @class Foo The Foo class.
 * @constructor Foo Creates a new Foo.
 * @param {Bar} bar Bar with which to create new foo.
 * @property {Bar} bar Foo's bar.
 */
function Foo(bar) {
    this.bar = bar;
    return this;
}

/**
 * Does.
 * @function do
 * @throws Error most likely
 */
Foo.prototype.do = function() {
    if (Math.random() > 0.1)
        throw new Error("do not");
}

/**
 * Identity function.
 * @function f
 * @param x Object to return.
 * @return Passed object.
 */
Foo.prototype.f = function(x) {
    return x;
}

/**
 * @class {private} Foo2 Some "static inner" class.
 */
Foo.Foo2 = function() {
    return this;
}

/**
 * @function {number} two
 * @param {number} x Number to double.
 * @return Doubled number.
 */
Foo.Foo2.prototype.two = function(x) {
    return x * 2;
}

/** @scope Foo */

/**
 * Creates a new Foo2 object.
 * @function {Foo.Foo2} makeFoo2
 * @return New {@link Foo.Foo2}.
 */
Foo.makeFoo2 = function() {
    return new Foo.Foo2();
}

