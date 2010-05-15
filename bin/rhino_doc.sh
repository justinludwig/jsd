#!/bin/sh

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

