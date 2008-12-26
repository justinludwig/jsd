/**
 * @file rhino.js Rhino-specific javascript.
 */

load("src/utl.js");
load("src/jsd.js");

Utl.readDirectory = function(file, filter, charset) {
    if (!file.exists()) return "";

    if (file.isDirectory()) {
        var a = [];
        var files = filter ? file.listFiles(filter) : file.listFiles();
        for (var i = 0; i < files.length; i++)
            a.push(Utl.readDirectory(files[i], filter, charset));
        return a.join("");
    }

    return readFile(file.getPath(), charset || "utf8");
}

// need a print statement here for some reason
print("running...");

(function(args) {
    var a = [];
    var files = (args.pop() || "").split(/\s/);
    var filter = new java.io.FileFilter({
        accept: function(file) {
            return (file.isDirectory() || file.getName().endsWith(".js"));
        }
    });
    for (var i = 0; i < files.length; i++) {
        var file = new java.io.File(files[i]);
        a.push(Utl.readDirectory(file, filter));
    }
    print(new JSD().run(a.join("")));
})(arguments);
