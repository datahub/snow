import './index.scss';

const imageWidth = 501;
const imageHeight = 516;
const aspectRatio = imageWidth / imageHeight;

const margin = {top: 10, right: 10, bottom: 10, left: 10};
const fullWidth = 500;
const fullHeight = fullWidth * (550 / 600);
const width = fullWidth - margin.left - margin.right;
const height = fullHeight - margin.top - margin.bottom;

const mapExtent = [
    [margin.left, margin.right],
    [width, height],
];

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

const container = d3.select('#daily-maps')
    .style('max-width', `${fullWidth}px`);

const range = container.select('#daily-maps-range');
const playButton = container.select('#daily-maps-play');

const svg = container.select('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const defs = svg.append('defs');

const clipPath = defs.append('clipPath')
    .attr('id', 'wisconsin-border-daily')
    .append('path');

const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const snowAccumulationMapsData = d3.timeDay
    .range(new Date(2017, 9, 1), new Date(2018, 4, 1))
    .map(function(date) {
        const formatDate = d3.timeFormat('%Y-%m-%d');
        const formattedDate = formatDate(date);
        const href = `static/daily-maps/${formattedDate}.jpg`;
        return {formattedDate, href};
    });

function ready(wisconsin) {
    projection.fitExtent(mapExtent, wisconsin);
    
    const snowAccumulationMaps = g.append('g').attr('class', 'snow-accumulation-maps');
        
    const snowAccumulationMap = snowAccumulationMaps.selectAll('.snow-accumulation-map').data(snowAccumulationMapsData)
        .enter().append('image')
            .attr('class', 'snow-accumulation-map')
            .attr('xlink:href', d => d.href)
            .attr('x', 6)
            .attr('y', 1)
            .attr('width', width)
            .attr('height', height)
            .attr('clip-path', 'url(#wisconsin-border-daily)')
            .style('opacity', 0);

    const border = g.append('g').attr('class', 'border border--wisconsin');

    border.append('path')
        .datum(wisconsin)
        .attr('d', path);

    clipPath.datum(wisconsin)
        .attr('d', path);

    function change() {
        const j = this.value - 1;
        snowAccumulationMap
            .style('opacity', (d, i) => i === j ? 1 : 0);
    }

    function play() {
        let j = 0;
        const timer = d3.interval(() => {
            snowAccumulationMap
                .style('opacity', (d, i) => i === j ? 1 : 0);
            j++;
            if (j > 211) timer.stop();
        }, 66);
    }

    range.on('change', change);
    playButton.on('click', play);
}

function init() {
    d3.json('static/wisconsin.json')
        .then(ready);
}

// <div class="graphic" id="daily-maps">
//     <div class="title">
//         Snow accumulation in 2017&ndash;18
//     </div>
//     <svg></svg>
//     <div class="play-bar">
//         <input id="daily-maps-range" type="range" min="1" max="212" step="1" value="1">
//         <button id="daily-maps-play"><i class="fas fa-play-circle"></i></button>
//     </div>
// </div>

export default init;