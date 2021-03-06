#!/bin/bash

cd ./build || exit

rm -f resources/manifest.txt
touch resources/manifest.txt

jsFile=$(find . -type f -name "*.js" -not -name "*Bitburner.t*" -a -not -name "all-servers.js")

echo "$jsFile" | while read -r line; do
  echo "$line" >> resources/manifest.txt
done

cd - || exit