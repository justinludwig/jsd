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
 * @file test/utl_test.js Test utilities.
 */

var TestUtl = new Utl.TestSuite();
Utl.TestAll.add("TestUtl", TestUtl);

function testTrim() {
    Utl.assertEquals("", Utl.trim(null), "test trim null");
    Utl.assertEquals("", Utl.trim(""), "test trim empty string");
    Utl.assertEquals("", Utl.trim(" \n "), "test trim all-whitespace string");
    Utl.assertEquals("foo", Utl.trim("foo"), "test trim no-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim("foo bar baz"), "test trim interior-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim(" \n foo bar baz"), "test trim leading-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim("foo bar baz \n "), "test trim trailing-whitespace string");
    Utl.assertEquals("foo bar baz", Utl.trim(" \n foo bar baz \n "), "test trim leading-and-trailing-whitespace string");
}
TestUtl.add("testTrim", testTrim);

function testEscapeHTML() {
    Utl.assertEquals("", Utl.escapeHTML(null), "test escapeHTML null");
    Utl.assertEquals("", Utl.escapeHTML(""), "test escapeHTML empty string");
    Utl.assertEquals("foo", Utl.escapeHTML("foo"), "test escapeHTML no-reserved-chars string");
    Utl.assertEquals("&amp;&lt;&gt;&quot;&#39;", Utl.escapeHTML("&<>\"\'"), "test escapeHTML reserved-chars string");
}
TestUtl.add("testEscapeHTML", testEscapeHTML);

function testEscapeJS() {
    Utl.assertEquals("", Utl.escapeJS(null), "test escapeJS null");
    Utl.assertEquals("foo", Utl.escapeJS("foo"), "test escapeJS no-reserved-chars string");
    Utl.assertEquals("\\\\\\\'\\\"\\n\\rfoo\\\\\\\'\\\"\\n\\r", Utl.escapeJS("\\\'\"\n\rfoo\\\'\"\n\r"), "test escapeJS reserved-chars string");
}
TestUtl.add("testEscapeJS", testEscapeJS);

function testEscapeURI() {
    Utl.assertEquals("", Utl.escapeURI(""), "test escapeURI empty string");
    Utl.assertEquals("foo", Utl.escapeURI("foo"), "test escapeURI no-reserved-chars string");
    Utl.assertEquals("%3F%26%3D%3C%3E%22%27.-_~", Utl.escapeURI("?&=<>\"\'.-_~").toUpperCase(), "test escapeURI reserved-chars string");
}
TestUtl.add("testEscapeURI", testEscapeURI);

function testSafeURIScheme() {
    Utl.assertEquals("", Utl.safeURIScheme(null), "test safeURIScheme null");
    Utl.assertEquals("", Utl.safeURIScheme(""), "test safeURIScheme empty string");
    Utl.assertEquals("https://foo", Utl.safeURIScheme("https://foo"), "test safeURIScheme safe scheme");
    Utl.assertEquals("./foo", Utl.safeURIScheme("./foo"), "test safeURIScheme safe path");
    Utl.assertEquals("./foo", Utl.safeURIScheme("foo"), "test safeURIScheme unsafe path");
}
TestUtl.add("testSafeURIScheme", testSafeURIScheme);

function testSafeNumber() {
    Utl.assertEquals(0, Utl.safeNumber(null), "test safeNumber null");
    Utl.assertEquals(0, Utl.safeNumber(""), "test safeNumber empty string");
    Utl.assertEquals(1, Utl.safeNumber(true), "test safeNumber boolean true");
    Utl.assertEquals(1.23, Utl.safeNumber(1.23), "test safeNumber number");
    Utl.assertEquals(1.23, Utl.safeNumber("1.23"), "test safeNumber string number");
    Utl.assertEquals(0, Utl.safeNumber("1px"), "test safeNumber string non-number");
}
TestUtl.add("testSafeNumber", testSafeNumber);

function testSafeBoolean() {
    Utl.assertEquals(false, Utl.safeBoolean(null), "test safeBoolean null");
    Utl.assertEquals(false, Utl.safeBoolean(""), "test safeBoolean empty string");
    Utl.assertEquals(true, Utl.safeBoolean(true), "test safeBoolean boolean true");
    Utl.assertEquals(true, Utl.safeBoolean(1.23), "test safeBoolean number");
    Utl.assertEquals(true, Utl.safeBoolean("true"), "test safeBoolean string true");
    Utl.assertEquals(true, Utl.safeBoolean("TRUE"), "test safeBoolean string upper-case true");
    Utl.assertEquals(true, Utl.safeBoolean("1.23"), "test safeBoolean string number");
    Utl.assertEquals(false, Utl.safeBoolean("1px"), "test safeBoolean string non-number");
}
TestUtl.add("testSafeBoolean", testSafeBoolean);

function testRelUrl() {
    Utl.assertEquals("", Utl.relUrl(), "assert null relUrl");
    Utl.assertEquals("", Utl.relUrl("", ""), "assert empty relUrl");
    Utl.assertEquals("foo.html", Utl.relUrl("", "foo.html"), "assert simple file relUrl");
    Utl.assertEquals("baz/bar/foo.html", Utl.relUrl("", "baz/bar/foo.html"), "assert simple path relUrl");
    Utl.assertEquals("foo.html", Utl.relUrl("x", "foo.html"), "assert simple file relUrl 2");
    Utl.assertEquals("baz/bar/foo.html", Utl.relUrl("x", "baz/bar/foo.html"), "assert simple path relUrl 2");
    Utl.assertEquals("../../foo.html", Utl.relUrl("x/y/z.html", "foo.html"), "assert complex file relUrl");
    Utl.assertEquals("../../baz/bar/foo.html", Utl.relUrl("x/y/z.html", "baz/bar/foo.html"), "assert complex path relUrl");
    Utl.assertEquals("foo.html", Utl.relUrl("x/y/z.html", "x/y/foo.html"), "assert common relUrl");
    Utl.assertEquals("y/foo.html", Utl.relUrl("x/y.html", "x/y/foo.html"), "assert common lower relUrl");
    Utl.assertEquals("../foo.html", Utl.relUrl("x/y/z.html", "x/foo.html"), "assert common higher relUrl");
}
TestUtl.add("testRelUrl", testRelUrl);

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

function testSplitIntoFiles() {
    Utl.assertEquals({}, Utl.splitIntoFiles(), "test null split into files");
    Utl.assertEquals({}, Utl.splitIntoFiles(""), "test empty-string split into files");
    Utl.assertEquals({}, Utl.splitIntoFiles("foo"), "test no-op split into files");
    Utl.assertEquals({ "d/f1.txt": "bar", "d/f2.txt": "baz" }, Utl.splitIntoFiles("foo\n==========d/f1.txt==========\nbar\n==========d/f2.txt==========\nbaz"), "test simple split into files");
}
TestUtl.add("testSplitIntoFiles", testSplitIntoFiles);

function testMap() {
    function fn(x, i) {
        return x + i;
    }
    Utl.assertEquals([], Utl.map(), "test map null");
    Utl.assertEquals([], Utl.map([], fn), "test map empty array");
    Utl.assertEquals([1], Utl.map([1], fn), "test map 1");
    Utl.assertEquals([1, 3, 5], Utl.map([1, 2, 3], fn), "test map 1, 2, 3");
}
TestUtl.add("testMap", testMap);

function testMerge() {
    Utl.assertEquals({}, Utl.merge(), "test merge null");
    Utl.assertEquals({}, Utl.merge([]), "test merge empty array");
    Utl.assertEquals({
        a: 1, b: "b", c: ["c", 3], x: 2, y: "y", z: ["z", 6]
    }, Utl.merge([{
        a: 1, b: "b", c: ["c", 3]
    }, {
        x: 2, y: "y", z: ["z", 6]
    }]), "test merge no overlap");
    Utl.assertEquals({
        a: 1, b: "b y", c: ["c", 3, "z", 6]
    }, Utl.merge([{
        a: 1, b: "b", c: ["c", 3]
    }, {
        a: 2, b: "y", c: ["z", 6]
    }]), "test merge complete overlap");
    Utl.assertEquals({
        a: 1, b: "b", c: ["c", 3]
    }, Utl.merge([{
        a: 1, b: "b", c: ["c", 3]
    }, {
        a: 1, b: "b", c: ["c", 3]
    }]), "test merge complete duplication");
    Utl.assertEquals({
        a: 1, b: "b b y", c: ["c", 3, "z", 6]
    }, Utl.merge([{
        a: 1, b: "b", c: ["c", 3]
    }, {
        a: 2, b: "b y", c: ["c", "z", 3, 6]
    }]), "test merge partial duplication");
}
TestUtl.add("testMerge", testMerge);

function testPluralize() {
    Utl.assertEquals("", Utl.pluralize(), "test pluralize null");
    Utl.assertEquals("", Utl.pluralize(""), "test pluralize empty-string");
    Utl.assertEquals("foos", Utl.pluralize("foo"), "test pluralize foo");
    Utl.assertEquals("fooses", Utl.pluralize("foos"), "test pluralize foos");
    Utl.assertEquals("fooies", Utl.pluralize("fooy"), "test pluralize fooy");
}
TestUtl.add("testPluralize", testPluralize);

function testFirstSentence() {
    Utl.assertEquals("", Utl.firstSentence(), "test firstSentence null");
    Utl.assertEquals("", Utl.firstSentence(""), "test firstSentence empty-string");
    Utl.assertEquals("foo", Utl.firstSentence("foo"), "test firstSentence foo");
    Utl.assertEquals("foo bar baz", Utl.firstSentence(" foo bar baz "), "test firstSentence foo bar baz");
    Utl.assertEquals("foo.", Utl.firstSentence(" foo. bar baz "), "test firstSentence foo. bar baz");
    Utl.assertEquals("foo bar.", Utl.firstSentence(" foo bar. baz "), "test firstSentence foo bar. baz");
    Utl.assertEquals("foo bar baz.", Utl.firstSentence(" foo bar baz. "), "test firstSentence foo bar baz.");
    Utl.assertEquals("foo:\n1.2,\n3.4.", Utl.firstSentence("foo:\n1.2,\n3.4.\nbar"), "test firstSentence false foo");
    Utl.assertEquals("fo...", Utl.firstSentence("foo", 2), "test firstSentence foo 2");
}
TestUtl.add("testFirstSentence", testFirstSentence);
