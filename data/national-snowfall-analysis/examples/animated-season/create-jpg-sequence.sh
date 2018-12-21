#!/usr/bin/env bash

for png_file in sequence/png/*.png; do
    mkdir -p tmp
    jpg_output=sequence/jpg/$(basename $png_file .png).jpg
    echo $jpg_output
    convert $png_file -quality 50 $jpg_output
	rm -rf tmp
done
