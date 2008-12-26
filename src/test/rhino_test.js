/**
 * @file rhino_test.js Rhino tests.
 */

load("src/utl.js");
load("src/test/utl_test.js");
load("src/jsd.js");
load("src/test/jsd_test.js");

print("running...");

(function(args) {
    var tests = (args.pop() || "Utl.TestAll").split(/\s/);
    for (var i = 0; i < tests.length; i++) {
        var test = eval(tests[i]);
        if (test.run)
            test.run();
        else
            test();
    }
})(arguments);
