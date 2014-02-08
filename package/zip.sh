#!/bin/bash
package=usaco-results-analytics.zip
rm -f $package
cd ..
zip -r $package . -x@package/exclude.lst
mv $package package/
cd -
