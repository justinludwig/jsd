/**
 * @file rhino_test.js Rhino tests.
 */

load("src/jsd.js");
load("src/test/jsd_test.js");

(function(args) {
    var tests = (args[0] || "").split(/\s/);
    for (var i = 0; i < tests.length; i++) {
        var test = eval(tests[i]);
        if (test.run)
            test.run();
        else
            test();
    }
})(arguments);
