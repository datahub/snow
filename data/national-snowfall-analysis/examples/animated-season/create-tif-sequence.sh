#!/usr/bin/env bash

mkdir -p sequence/tif sequence/png sequence/jpg

n=$(ls daily-files/ | wc -l)
all_files=($(ls -d cropped/*.tif))

for i in $(seq 1 $n); do
    mkdir -p tmp
    j=$(($i - 1))
    files="${all_files[@]:0:$i}"
    trailing_file="${all_files[$j]}"
    tif_output=sequence/tif/$(basename $trailing_file)
    echo $tif_output
    python ../../raster-mill.py aggregate $files tmp/aggregated.tif
    rio warp \
		--res 1000 \
		--resampling lanczos \
		--dst-crs '+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +units=m +no_defs' \
		tmp/aggregated.tif \
        $tif_output
	rm -rf tmp
done
