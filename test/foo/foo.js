/**
 * @file foo.js Foo file.
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
 */
Foo.prototype.do = function() {
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
 * @class {private} Foo.Foo2 Some "static inner" class.
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
