
GENERATED_FILES = \
	txt/ghcnd-stations.txt \
	csv/mke-weather.csv \
	csv/mpls-weather.csv

all: $(GENERATED_FILES)

# Search txt/ghcnd-stations.txt to find...
# USW00014839 = Milwaukee Mitchell Airport weather station
# USW00014922 = Minneapolis Airport
txt/ghcnd-stations.txt:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://www1.ncdc.noaa.gov/pub/data/ghcn/daily/ghcnd-stations.txt'
	mv $@.download $@

dly/%.dly:
	mkdir -p $(dir $@)
	curl -o $@.download 'https://www1.ncdc.noaa.gov/pub/data/ghcn/daily/all/$(notdir $@)'
	mv $@.download $@

csv/mke-weather.csv: dly/USW00014839.dly
	mkdir -p $(dir $@)
	node bin/parse-ghcnd.js -i $< -o $@

csv/mpls-weather.csv: dly/USW00014922.dly
	mkdir -p $(dir $@)
	node bin/parse-ghcnd.js -i $< -o $@
