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
 * @file rhino.js Rhino-specific javascript.
 */

load("src/utl.js");
load("src/jsd.js");
load("src/jst.js");

/** @namespace Utl.Rhino Rhino-specific utilities. */
Utl.Rhino = {

/**
 * @function {string} readDirectory
 * Reads the files in the specified directory (filtered by the optional filter)
 * and concatenates their contents together.
 * @param {java.io.File} file Directory to read.
 * @param {optional java.io.FileFilter} filter Filters the directory contents.
 * @param {optional string} header Header to prefix each file's contents.
 * May include properties from the <cite>java.io.File</cite> object,
 * such as &#x7b;name&#x7d; or &#x7b;path&#x7d; etc.
 * @param {optional string} footer Footer to suffix each file's contents.
 * @param {optional string} charset Character-encoding with which to read files.
 * @return The contents of the files in the specified directory.
 */
readDirectory: function(file, filter, header, footer, charset) {
    if (!file.exists()) return "";

    if (file.isDirectory()) {
        var a = [];
        var files = filter ? file.listFiles(filter) : file.listFiles();
        files.sort();
        for (var i = 0; i < files.length; i++)
            a.push(Utl.Rhino.readDirectory(files[i], filter, header, footer, charset));
        return a.join("");
    }

    header = header ? header.replace(/\{([^}]+)\}/g, function(s, s1) {
        var fn = "get" + s1.charAt(0).toUpperCase() + s1.substring(1);
        return file[fn]();
    }) : "";
    footer = footer || "";

    return header + readFile(file.getPath(), charset || "utf8") + footer;
},

/**
 * @function {string} readDirectories
 * Reads the files in the specified directories (filtered by the optional filter)
 * and concatenates their contents together.
 * @param {java.io.File[]} files Directories to read.
 * @param {optional java.io.FileFilter} filter Filters the directory contents.
 * @param {optional string} header Header to prefix each file's contents.
 * May include properties from the <cite>java.io.File</cite> object,
 * such as &#x7b;name&#x7d; or &#x7b;path&#x7d; etc.
 * @param {optional string} footer Footer to suffix each file's contents.
 * @param {optional string} charset Character-encoding with which to read files.
 * @return The contents of the files in the specified directories.
 */
readDirectories: function(files, filter, header, footer, charset) {
    var a = [];
    for (var i = 0; i < files.length; i++) {
        var file = new java.io.File(files[i]);
        a.push(Utl.Rhino.readDirectory(file, filter, header, footer, charset));
    }
    return a.join("");
},

/**
 * @function {java.io.FileFilter} createDirectoryAndFileTypeFilter
 * Creates a FileFilter that accepts directories, and files ending with the specified extension.
 * @param {string} type Space-delimited list of extensions (ie ".js .css .html").
 * @param {optional boolean} reject True to reject the specified types instead of accepting it.
 * @return Filter which accepts directories and accepts/rejects the specified file types.
 */
createDirectoryAndFileTypeFilter: function(type, reject) {
    if (type.constructor == String)
        type = type.split(/\s/);

    return new java.io.FileFilter({
        accept: function(file) {
            if (!reject && file.isDirectory()) return true;

            for (var i = 0, l = type.length; i < l; i++)
                if (file.getName().endsWith(type[i]))
                    return !reject;

            return !!reject;
        }
    });
},

/**
 * @function cleanDirectory Deletes the specified directory and its contents.
 * @param {string} dir Directory path to clean.
 */
cleanDirectory: function(dir) {
    // normalize dir path
    dir = dir || ".";
    if (!/\/$/.test(dir))
        dir += "/";

    var file = new java.io.File(dir);
    Utl.Rhino.deleteDirectory(file);
},

/**
 * @function deleteDirectory Deletes the specified directory and its contents.
 * @param {java.io.File} root Directory to delete.
 * @param {optional boolean} skipRoot If true, leaves the specified directory
 * but deletes the entire contents of the directory (defaults to false).
 */
deleteDirectory: function(root, skipRoot) {
    if (!root.exists())
        return;

    if (root.isDirectory())
        for (var i = 0, file, files = root.listFiles(); file = files[i]; i++)
            Utl.Rhino.deleteDirectory(file);

    if (!skipRoot)
        root["delete"](); // delete is js keyword
},

/**
 * @function copyDirectories
 * Creates a (recursive) copy of the first directory/file at the second location.
 * @param {java.io.File} src Directory to copy.
 * @param {java.io.File} dst Location of copy to create.
 * @param {optional java.io.FileFilter} filter Filter to restrict files to copy.
 */
copyDirectories: function(src, dst, filter) {
    // allow array of src directories
    if (src.constructor == Array) {
        for (var i = 0, l = src.length; i < l; i++)
            Utl.Rhino.copyDirectories(src[i], dst, filter);
        return;
    }

    // coerce src to file
    if (src.constructor == String)
        src = new java.io.File(src);
    if (!src.exists()) return;

    // coerce dst to file
    if (dst.constructor == String)
        dst = new java.io.File(dst);

    // copy directory recursively
    if (src.isDirectory()) {
        dst.mkdirs();

        var files = filter ? src.listFiles(filter) : src.listFiles();
        for (var i = 0; i < files.length; i++)
            Utl.Rhino.copyDirectories(files[i], new java.io.File(dst, files[i].getName()), filter);
        return;
    }

    // copy file content
    var buf = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 0x400);
    try {
        var input = new java.io.FileInputStream(src);
        var out = new java.io.FileOutputStream(dst);

        var len = input.read(buf);
        while (len != -1) {
            out.write(buf, 0, len);
            len = input.read(buf);
        }

    // clean up
    } finally {
        if (input) input.close();
        if (out) out.close();
    }
},

/**
 * @function writeToDirectory
 * Writes the specified content to the specified directory root.
 * Uses {@link Utl.splitIntoFiles} to split the content into individual files,
 * relative to the root directory.
 * @param {string} dir Directory root to which to write.
 * @param {string} s Content to write.
 */
writeToDirectory: function(dir, s) {
    // normalize dir path
    dir = dir || ".";
    if (!/\/$/.test(dir))
        dir += "/";

    // write files
    var files = Utl.splitIntoFiles(s);
    for (var i in files)
        try {
            // make directory structure
            var file = new java.io.File(dir + i);
            var parent = file.getParentFile();
            parent.mkdirs();
            // write file
            Utl.Rhino.writeFile(file, files[i]);
        } catch (e) {
            Utl.log(e, "ERROR", "rhino");
        }
},

/**
 * @function writeFile Writes the specified content to the specified file.
 * @param {java.io.File} file File to which to write.
 * @param {string} s Content to write.
 */
writeFile: function(file, s) {
    try {
        var out = new java.io.FileWriter(file);
        out.write(new java.lang.String(s).toCharArray());
    } catch (e) {
        Utl.log(e, "ERROR", "rhino");
    } finally {
        if (out)
            out.close();
    }
}

}; /** @end Utl.Rhino */

// need a print statement here for some reason
print("running...");

// this is the "main" function
(function(args) {
    // src and out are the very last two args
    var out = (args.pop() || "");
    var src = (args.pop() || "").split(/\s/);

    args = Utl.mapArgs(args);
    // check other args for "-c" or "--conf" etc
    var conf = args.c || args.conf || args.config || "conf/default.conf.js";
    load(conf);

    // check other args for "-e" or "--eval" etc
    var literal = args.e || args.eval;
    if (literal)
        eval(literal);

    // find template directory (make it into an array of template dirs)
    var tpl = JSD.template;
    if (tpl.constructor == String)
        tpl = tpl.split(/\s/);

    // init the template-driven jsd instance
    var jsd = new JSD.TemplateDriven({
        input: Utl.Rhino.readDirectories(src, Utl.Rhino.createDirectoryAndFileTypeFilter(JSD.srcType || ".js"), "\n/** @file {path} */\n", "\n/** @end */\n"),
        template: Utl.Rhino.readDirectories(tpl, Utl.Rhino.createDirectoryAndFileTypeFilter(JSD.templateType || ".jst")),
        modelers: JSD.modelers
    });

    // wipe output directory
    Utl.Rhino.cleanDirectory(out);
    // run jsd
    Utl.Rhino.writeToDirectory(out, jsd.run());
    // copy non-template files (.css, .gif, etc) to output directory
    Utl.Rhino.copyDirectories(tpl, out, Utl.Rhino.createDirectoryAndFileTypeFilter((JSD.templateType || ".jst") + " " + (JSD.ignoreType || ""), true));

})(arguments);
