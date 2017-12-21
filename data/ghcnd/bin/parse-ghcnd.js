#!/usr/bin/env node

const fs = require('fs');
const d3 = require('d3');
const moment = require('moment');
const program = require('commander');

program
    .version('0.1.0')
    .option('-i, --input <file>', 'Input .dly text file')
    .option('-o, --output <file>', 'Output CSV file')
    .parse(process.argv);

const data = fs.readFileSync(program.input, 'utf8')
    .split('\n')
    .map(parseLine)
    .reduce((a, b) => a.concat(b));

fs.writeFileSync(program.output, d3.csvFormat(data));

function parseLine(line) {
    const id = line.slice(0, 11)
    const year = +line.slice(11, 15)
    const month = +line.slice(15, 17)
    const element = line.slice(17, 21);

    const rows = [];
    let stub = line.slice(21);
    let day = 1;
    while (stub.length > 0) {
        var date = moment([year, month, day].join('-'), 'YYYY-MM-DD');
        if (date.isValid()) {
            const row = {
                id, 
                date: date.format('YYYY-MM-DD'),
                element,
                value: parseValue(stub.slice(0, 5)),
                flag_m: stub.slice(5, 6),
                flag_q: stub.slice(6, 7),
                flag_s: stub.slice(7, 8)
            };
            rows.push(row);
        }
        stub = stub.slice(8);
        day++;
    }
    return rows;
}

function parseValue(str) {
    if (str === '-9999') return undefined;
    return parseInt(str);
}
