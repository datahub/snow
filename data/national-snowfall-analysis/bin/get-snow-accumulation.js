#!/usr/bin/env node

const fs = require('fs');
const exec = require('child_process').exec;
const d3 = require('d3');
const request = require('request');
const cheerio = require('cheerio');
const program = require('commander');

const formatDate = d3.timeFormat('%Y-%m-%d--%H');

function parseUrl(url) {

    // Timespan
    let timespan;
    if (/CONUS_\d{10}_to_\d{10}/.test(url)) timespan = 'season';
    else timespan = /CONUS_(\d+)h_/.exec(url)[1] + 'h';

    // Date
    let date;
    if (timespan === 'season') date = /CONUS_\d{10}_to_(\d{10})/.exec(url)[1];
    else date = /CONUS_\d+h_(\d{10})/.exec(url)[1];
    date = d3.timeParse('%Y%m%d%H')(date);

    return { timespan, date };
}

program
    .version('0.1.0')
    .option('--date <YYYYMM>', 'Year and month of snow accumulation')
    .option('-d, --dir <directory>', 'Directory to download data into')
    .parse(process.argv);

const date = program.date;
const dir = program.dir || 'snow-accumulation';

request(`https://www.nohrsc.noaa.gov/snowfall/data/${date}/`, (error, response, body) => {
    if (error) throw error;
    if (response.statusCode !== 200) throw new Error(`Bad response: ${response.statusCode}`)

    const $ = cheerio.load(body);

    $('a').each(function(i, a) {
        const url_stub = $(a).attr('href');
        const url = `https://www.nohrsc.noaa.gov/snowfall/data/${date}/${url_stub}`;
        if (/.tif$/.test(url)) {
            const d = parseUrl(url);
            const folder = `${dir}/${d.timespan}`;
            const file = `${folder}/${formatDate(d.date)}.tif`;

            exec(`mkdir -p ${folder}`, (error) => { if (error) throw error; });

            if(!fs.existsSync(file)) {
                setTimeout(() => {
                    console.log(`Downloading ${file}`);
                    exec(`curl -o ${file} ${url}`, (error) => {
                        if (error) {
                            exec('rm ${file}', (error) => { if (error) throw error; });
                            throw error;
                        }
                        console.log(`Finished downloading ${file}`);
                    });
                }, i * 1000);
            }
        }
    });
});
