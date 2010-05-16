#!/bin/sh
# Copyright (c) 2010 Justin Ludwig
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
# THE SOFTWARE.

JSD_HOME=`dirname $0`/..
OUT=$1

if [ -z "$OUT" ]; then
    OUT="$JSD_HOME/doc"
fi

# generate docs from src dir
java -cp "$JSD_HOME/lib/js.jar" org.mozilla.javascript.tools.shell.Main "$JSD_HOME/src/rhino.js" "$JSD_HOME/src $JSD_HOME/conf" "$OUT/api"

# generate docs for each template in templates dir
TEMPLATES="$JSD_HOME/template"
for TEMPLATE in `ls "$TEMPLATES"`; do
    java -cp "$JSD_HOME/lib/js.jar" org.mozilla.javascript.tools.shell.Main "$JSD_HOME/src/rhino.js" -e "JSD.srcType='.jst';" "$TEMPLATES/$TEMPLATE" "$OUT/template/$TEMPLATE"
done

