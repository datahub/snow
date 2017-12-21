#!/usr/bin/env node

const fs = require('fs');
const d3 = require('d3');
const exec = require('child_process').exec;
const program = require('commander');

function includes(array, value) {
    return array.indexOf(value) > -1;
}

// Example URLs:
// https://www.nohrsc.noaa.gov/snowfall/data/201712/sfav2_CONUS_6h_2017120512.tif
// https://www.nohrsc.noaa.gov/snowfall/data/201712/sfav2_CONUS_24h_2017120100.tif
// https://www.nohrsc.noaa.gov/snowfall/data/201712/sfav2_CONUS_48h_2017121900.tif
// https://www.nohrsc.noaa.gov/snowfall/data/201712/sfav2_CONUS_72h_2017120812.tif
// https://www.nohrsc.noaa.gov/snowfall/data/201712/sfav2_CONUS_2017093012_to_2017121912.tif
function createUrl(timespan, date) {
    const time = d3.timeFormat('%Y%m%d%H')(date);
    const year_month = d3.timeFormat('%Y%m')(date);
    if (timespan === 'season') {
        if (date.getHours() !== 12) throw new Error('Season accumulation must end at noon of the specified date.');
        const start_time = d3.timeFormat('%Y093012')(date);
        return `https://www.nohrsc.noaa.gov/snowfall/data/${year_month}/sfav2_CONUS_${start_time}_to_${time}.tif`;
    }
    return `https://www.nohrsc.noaa.gov/snowfall/data/${year_month}/sfav2_CONUS_${timespan}h_${time}.tif`;
}

function coerceDate(value) {
    const parts = value.split('-');
    const year = +parts[0];
    const month = +parts[1];
    const day = +parts[2];
    const hours = +parts[3];
    return new Date(year, month - 1, day, hours);
}

const timespans = ['6', '24', '48', '72', 'season'];

function coerceTimespan(value) {
    const timespan = value.trim();
    if (!includes(timespans, timespan)) throw new Error('Invalid timespan');
    return timespan;
}

program
    .version('0.1.0')
    .option('-d, --date <YYYY-MM-DD-HH>', 'Date of snow accumulation', coerceDate)
    .option('-t, --timespan <timespan>', 'Timespan of accumulation: 6, 24, 48, 72 or season', coerceTimespan)
    .option('-o, --output <file>', 'Output GeoTIFF file')
    .parse(process.argv);

const date = program.date;
const timespan = program.timespan;
const output = program.output;

const url = createUrl(timespan, date);

exec(`curl -o ${output} ${url}`, (error) => {
    if (error) throw error;
});
