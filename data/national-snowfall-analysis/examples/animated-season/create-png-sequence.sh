#!/usr/bin/env bash

for tif_file in sequence/tif/*.tif; do
    mkdir -p tmp
    png_output=sequence/png/$(basename $tif_file .tif).png
    echo $png_output
    gdaldem color-relief -of PNG $tif_file color-ramp.txt $png_output
	rm -rf tmp
done
