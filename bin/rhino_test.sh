#!/bin/sh

JSD_HOME=`dirname $0`/..
TEST=TestAll

java -cp $JSD_HOME/lib/js-14.jar org.mozilla.javascript.tools.shell.Main $JSD_HOME/src/test/rhino_test.js "$TEST"
