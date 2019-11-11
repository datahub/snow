import './index.scss';

const currentMonth = 11;

let windowWidth = 320;

const imageWidth = 501;
const imageHeight = 516;
const aspectRatio = imageWidth / imageHeight;

const formatMonth = (monthIndex) => {
    const date = new Date(2019, monthIndex - 1, 1);
    const month = date.getMonth();
    const abbreviatedMonths = [0, 1, 7, 8, 9, 10, 11];
    const isAbbreviated = abbreviatedMonths.indexOf(month) > -1;
    if (isAbbreviated) return `${d3.timeFormat('%b')(date)}.`;
    return d3.timeFormat('%B')(date);
};

const margin = {top: 30, right: 10, bottom: 10, left: 75};
let fullWidth = windowWidth;
let fullHeight = fullWidth * (550 / 600);
let width = fullWidth - margin.left - margin.right;
let height = fullHeight - margin.top - margin.bottom;

const proj4String = '+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +x_0=520000 +y_0=-4480000 +ellps=GRS80 +units=m +no_defs';

const proj4Projection = proj4(proj4String);

function degreesToRadians(degrees) { return degrees * Math.PI / 180; }
function radiansToDegrees(radians) { return radians * 180 / Math.PI; }

const project = function(lambda, phi) {
    return proj4Projection
        .forward([lambda, phi].map(radiansToDegrees));
}

project.invert = function(x, y) {
    return proj4Projection
        .inverse([x, y].map(degreesToRadians));
};

const projection = d3.geoProjection(project);

const path = d3.geoPath(projection);

const years = d3.range(2013, 2020).reverse();
const months = [10, 11, 12, 1, 2, 3, 4];

const xScale = d3.scaleBand()
    .domain(months)
    .range([0, width]);

const xAxis = d3.axisTop(xScale)
    .tickFormat(formatMonth);

const yScale = d3.scaleBand()
    .domain(years)
    .range([height, 0]);

let mapWidth = xScale.bandwidth();
let mapHeight = mapWidth * aspectRatio;
let mapPadding = [0, (yScale.bandwidth() - mapHeight) / 2];
let mapExtent = [
    [mapPadding[0], mapPadding[1]],
    [mapWidth - mapPadding[0], mapHeight + mapPadding[1]],
];

function formatYAxis(y0) {
    const y1 = (y0 + 1).toString().slice(-2);
    return `${y0}-${y1}`;
}

const yAxis = d3.axisLeft(yScale)
    .tickFormat(formatYAxis);

const container = d3.select('#monthly-maps')
    .style('max-width', `${fullWidth}px`);

const annotations = container.select('.annotations')
    .style('width', `${width + margin.left + margin.right}px`)
    .style('height', `${height + margin.top + margin.bottom}px`);

const svg = container.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const defs = svg.append('defs');

const clipPath = defs.append('clipPath')
    .attr('id', 'wisconsin-border-monthly')
    .append('path');

const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const gXAxis = g.append('g').attr('class', 'axis axis--x');
const gYAxis = g.append('g').attr('class', 'axis axis--y');

const data = years
    .map((year) => {
        const values = months
            .map((month) => {
                if (month < 5) return {year: year + 1, month};
                return {year, month};
            })
            .filter((d) => {
                if (year === 2019) return (d.month > 9 && d.month <= currentMonth);
                return true;
            });
        return {year, values};
    });

function ready(wisconsin) {
    fullWidth = windowWidth >= 700 ? 700 : windowWidth;
    fullHeight = fullWidth * (650 / 600);
    width = fullWidth - margin.left - margin.right;
    height = fullHeight - margin.top - margin.bottom;

    xScale
        .range([0, width]);

    yScale
        .range([height, 0]);

    mapWidth = xScale.bandwidth();
    mapHeight = mapWidth * aspectRatio;
    mapPadding = [0, (yScale.bandwidth() - mapHeight) / 2];
    mapExtent = [
        [mapPadding[0], mapPadding[1]],
        [mapWidth - mapPadding[0], mapHeight + mapPadding[1]],
    ];

    container.style('max-width', `${fullWidth}px`);

    annotations
        .style('width', `${width + margin.left + margin.right}px`)
        .style('height', `${height + margin.top + margin.bottom}px`);

    svg
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
        
    projection.fitExtent(mapExtent, wisconsin);

    const season = g.selectAll('.season').data(data);

    const seasonEnter = season.enter().append('g')
        .attr('class', d => `season season--${d.year}-${d.year + 1}`);

    const seasonUpdate = seasonEnter.merge(season)
            .attr('transform', d => `translate(0, ${yScale(d.year)})`);
    
    const month = seasonUpdate.selectAll('.month').data(d => d.values);

    const monthEnter = month.enter().append('g')
            .attr('class', d => `month month--${d.month}`);
    
    const monthUpdate = monthEnter.merge(month)
        .attr('transform', d => `translate(${xScale(d.month)}, 0)`);
        
    monthEnter.filter(d => d.year === 2019 && d.month === currentMonth)
        .append('rect')
        .attr('class', 'incomplete-month-background');
    
    monthEnter.append('image')
        .attr('xlink:href', (d) => {
            const pad = d3.format('0>2');
            return `./static/monthly-maps/wi-snow-colored-${d.year}-${pad(d.month)}.png`;
        })
        .attr('clip-path', 'url(#wisconsin-border-monthly)');

    monthUpdate.select('image')
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth());

    monthEnter.append('path')
        .attr('class', 'border border--wisconsin');

    monthUpdate.select('path')
        .datum(wisconsin)
        .attr('d', path);

    monthUpdate.select('.incomplete-month-background')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', 5)
        .attr('ry', 5)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth());
    
    clipPath.datum(wisconsin)
        .attr('d', path);
    
    gXAxis.call(xAxis);
    
    gYAxis.call(yAxis);

    const annotationData = [];
    
    const annotation = annotations.selectAll('.annotation').data(annotationData);

    const annotationEnter = annotation.enter().append('div')
        .attr('class', 'annotation');
    
    const annotationUpdate = annotationEnter.merge(annotation);
}

function init(w) {
    windowWidth = w;
    d3.json('static/wisconsin.json')
        .then(ready);
}

export default init;