/**
 * @file baz.js My Baz.
 * @author Roy G. Biv
 * @version 1.2
 * @timestamp 12:34 May 6, 07
 */

/**
 * @class Baz
 * @description A little of {@link Foo}, a little of {@link Bar},
 * and a whole lot of extra stuff, such as blood, sweat, and tears
 * -- and 90% inspiration.
 * @extends Foo @extends Bar @extends Foo.Foo2
 * @implements Baz.That
 */

/**
 * Creates a new Baz.
 * @constructor Baz
 * @param {number} x The first number.
 * @param {optional number} y The second number.
 */
function Baz(x, y) {
    this.x = x;
    this.y = y || 0;
    this.z = this.x + this.y;
    this.incX = function() { this.x++; this.z = this.x + this.y };
    this.decX = function() { this.x--; this.z = this.x + this.y };
    return this;
}

/** @end Baz */

/** @interface Baz.This */
Baz.This = {
    /** @property {number} x */
    x: 0,
    /** @ifunction incX Increments {@link x}. */
    incX: function() {}
};
/** @end Baz.This */

/** @interface Baz.That @extends Baz.This */
Baz.That = {
    /** @property {number} z */
    z: 0,
    /**
     * @ifunction decX
     * Increments {@link x}.
     * @since 1.1
     * @see Baz.This#incX
     */
    decX: function() {},
    /** @ifunction clearX Clears {@link x}. @deprecated */
}
/** @end Baz.That */

