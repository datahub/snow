#!/usr/bin/env bash

mkdir -p cropped

for input in daily-files/*.tif; do
    output=cropped/$(basename $input)
    echo $output
    mkdir -p tmp
	python ../../raster-mill.py knockout --less-than 0 $input tmp/knocked-out.tif
	rio clip --bounds "$(fio info geojson/wisconsin.json --bounds)" tmp/knocked-out.tif $output
	rm -rf tmp
done