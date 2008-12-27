/**
 * @file test/utl_test.js Test utilities.
 */

var TestUtl = new Utl.TestSuite();
Utl.TestAll.add("TestUtl", TestUtl);

function testTrim() {
    Utl.assert("" == Utl.trim(""), "test trim empty string");
    Utl.assert("" == Utl.trim(" \n "), "test trim all-whitespace string");
    Utl.assert("foo" == Utl.trim("foo"), "test trim no-whitespace string");
    Utl.assert("foo bar baz" == Utl.trim("foo bar baz"), "test trim interior-whitespace string");
    Utl.assert("foo bar baz" == Utl.trim(" \n foo bar baz"), "test trim leading-whitespace string");
    Utl.assert("foo bar baz" == Utl.trim("foo bar baz \n "), "test trim trailing-whitespace string");
    Utl.assert("foo bar baz" == Utl.trim(" \n foo bar baz \n "), "test trim leading-and-trailing-whitespace string");
}
TestUtl.add("testTrim", testTrim);

function testEscapeJS() {
    Utl.assert("" == Utl.escapeJS(""), "test escapeJS empty string");
    Utl.assert("foo" == Utl.escapeJS("foo"), "test escapeJS no-reserved-chars string");
    Utl.assert("\\\\\\\'\\\"\\n\\rfoo\\\\\\\'\\\"\\n\\r" == Utl.escapeJS("\\\'\"\n\rfoo\\\'\"\n\r"), "test escapeJS reserved-chars string");
}
TestUtl.add("testEscapeJS", testEscapeJS);

function testEquals() {
    Utl.assert(Utl.equals(), "assert undefined equals undefined");
    Utl.assert(Utl.equals(null), "assert null equals undefined");
    Utl.assert(Utl.equals(null, null), "assert null equals null");
    Utl.assert(!Utl.equals(""), "assert empty-string not equals undefined");
    Utl.assert(Utl.equals("", ""), "assert empty-string equals empty-string");
    Utl.assert(Utl.equals("foo", "foo"), "assert foo equals foo");
    Utl.assert(!Utl.equals("foo", "bar"), "assert foo not equals bar");
    Utl.assert(Utl.equals([], []), "assert empty-array equals empty-array");
    Utl.assert(Utl.equals(["foo"], ["foo"]), "assert foo-array equals foo-array");
    Utl.assert(!Utl.equals(["foo"], []), "assert foo-array not equals empty-array");
    Utl.assert(!Utl.equals([], ["foo"]), "assert empty-array not equals foo-array");
    Utl.assert(!Utl.equals(["foo"], ["bar"]), "assert foo-array not equals bar-array");
    Utl.assert(Utl.equals({}, {}), "assert empty-object equals empty-object");
    Utl.assert(Utl.equals({ x: 1, y: "foo", z: null }, { x: 1, y: "foo", z: null }), "assert object equals object");
    Utl.assert(Utl.equals({ x: [], y: { foo: "foo" }, z: { a: ["a","b"], o: { i: 1, j: 2 } } }, { x: [], y: { foo: "foo" }, z: { a: ["a","b"], o: { i: 1, j: 2 } } }), "assert complex-object equals complex-object");
    Utl.assert(!Utl.equals({ x: 1 }, { x: 2 }), "assert object property not equals object property");
    Utl.assert(!Utl.equals({ x: { y: 1 } }, { x: { y: 2 } }), "assert complex-object property not equals complex-object property");
    Utl.assert(!Utl.equals({ x: { y: 1, z: 2 } }, { x: { y: 1 } }), "assert object property missing in second");
    Utl.assert(!Utl.equals({ x: { y: 1 } }, { x: { y: 1, z: 2 } }), "assert object property missing in first");

}
TestUtl.add("testEquals", testEquals);
