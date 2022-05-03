#!/usr/bin/env bash

cd ./build || exit

jsFiles=$(find . -name "*.js")

echo "$jsFiles" | while read -r line; do
  echo "> Building file ${line%.*}.js"
#  todo replace all imports of src/toto to imports of /toto
#  sed -re 's/(import.*\"\/.*)\"/\1\.ns\"/g' "$line" > "${line%.*}.ns"
#  sed -i 's/(import \{\s*\w+\s*\}\s*from\s*")src(\/.+")/$1$2/g' "$line"
  perl -pi -e 's/(import \{\s*\w+\s*\}\s*from\s*")src(\/.+")/$1$2/g' "$line"
  mv "$line" "${line%.*}.js"
done

cd - || exit