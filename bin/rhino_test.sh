#!/bin/sh

JSD_HOME=`dirname $0`/..
TEST="$1"

java -cp $JSD_HOME/lib/js.jar org.mozilla.javascript.tools.shell.Main $JSD_HOME/src/test/rhino_test.js "$TEST"
