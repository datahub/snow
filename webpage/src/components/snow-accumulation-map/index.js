import './index.scss';


const imageWidth = 501;
const imageHeight = 516;
const aspectRatio = imageWidth / imageHeight;

const formatMonth = (d) => {
    const date = new Date(2000, d - 1, 1);
    return d3.timeFormat('%b')(date);
};

const margin = {top: 30, right: 10, bottom: 10, left: 50};
const fullWidth = 700;
const fullHeight = fullWidth * (550 / 600);
const width = fullWidth - margin.left - margin.right;
const height = fullHeight - margin.top - margin.bottom;

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

const years = d3.range(2013, 2018).reverse();
const months = [11, 12, 1, 2, 3, 4];

const xScale = d3.scaleBand()
    .domain(months)
    .range([0, width]);

const xAxis = d3.axisTop(xScale)
    .tickFormat(formatMonth);

const yScale = d3.scaleBand()
    .domain(years)
    .range([height, 0]);

const mapWidth = xScale.bandwidth();
const mapHeight = mapWidth * aspectRatio;
const mapPadding = [0, (yScale.bandwidth() - mapHeight) / 2];
const mapExtent = [
    [mapPadding[0], mapPadding[1]],
    [mapWidth - mapPadding[0], mapHeight + mapPadding[1]],
];

const yAxis = d3.axisLeft(yScale);

const container = d3.select('#snow-accumulation-across-wisconsin')
    .style('max-width', `${fullWidth}px`);

const svg = container.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const defs = svg.append('defs');

const clipPath = defs.append('clipPath')
    .attr('id', 'wisconsin-border')
    .append('path');

const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const data = years
    .map((year) => {
        const values = months
            .map((month) => {
                if (month < 5) return {year: year + 1, month};
                return {year, month};
            });
        return {year, values};
    });

function ready(wisconsin) {
    projection.fitExtent(mapExtent, wisconsin);

    const season = g.selectAll('.season').data(data)
        .enter().append('g')
            .attr('class', d => `season season--${d.year}-${d.year + 1}`)
            .attr('transform', d => `translate(0, ${yScale(d.year)})`);
    
    const month = season.selectAll('.month').data(d => d.values)
        .enter().append('g')
            .attr('class', d => `month month--${d.month}`)
            .attr('transform', d => `translate(${xScale(d.month)}, 0)`);
        
    month.append('image')
        .attr('xlink:href', (d) => {
            const pad = d3.format('0>2');
            return `./static/snow-accumulation-maps/wi-snow-colored-${d.year}-${pad(d.month)}.png`;
        })
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('clip-path', 'url(#wisconsin-border)');

    month.append('path')
        .datum(wisconsin)
        .attr('class', 'border border--wisconsin')
        .attr('d', path);

    clipPath.datum(wisconsin)
        .attr('d', path);
    
    g.append('g').attr('class', 'axis axis--x')
        .call(xAxis);
    
    g.append('g').attr('class', 'axis axis--y')
        .call(yAxis);
}

function init() {
    d3.json('static/wisconsin.json')
        .then(ready);
}

export default init;