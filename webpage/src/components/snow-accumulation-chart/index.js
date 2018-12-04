import './index.scss';

const parseDate = d3.timeParse('%Y-%m-%d');

const formatMonth = (date) => {
    const month = date.getMonth();
    const abbreviatedMonths = [0, 1, 7, 8, 9, 10, 11];
    const isAbbreviated = abbreviatedMonths.indexOf(month) > -1;
    if (isAbbreviated) return `${d3.timeFormat('%b')(date)}.`;
    return d3.timeFormat('%B')(date);
};

let defaultYear = '2018';

const margin = {top: 30, right: 40, bottom: 30, left: 50};
const fullWidth = 800;
const fullHeight = 500;
const width = fullWidth - margin.left - margin.right;
const height = fullHeight - margin.top - margin.bottom;

const container = d3.select('#snow-accumulation-in-milwaukee')
    .style('max-width', `${width}px`);

const layers = container.select('.layers')
    .style('width', `${fullWidth}px`)
    .style('height', `${fullHeight}px`);

const htmlLayer = layers.select('.html-layer');

const svg = layers.select('svg')
    .attr('width', fullWidth)
    .attr('height', fullHeight);

const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const hoverRect = svg.append('rect')
    .attr('class', 'hover-rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', fullWidth)
    .attr('height', fullHeight)
    .classed('opaque', true);

const selectBox = container.select('#year-select-box');

const callToAction = container.select('.call-to-action');
const takeTourButton = callToAction.select('#take-tour');
const exploreButton = callToAction.select('#explore');
const orSeparator = callToAction.select('.or-separator');

const xAccessor = d => d.date;

const xScale = d3.scaleTime()
    .range([0, width]);

function xAxis(g) {
    const axis = d3.axisBottom(xScale)
        .tickFormat(formatMonth);
    
    g.call(axis);

    g.selectAll('.tick text')
        .attr('text-anchor', 'start')
        .attr('dx', 5)
        .attr('y', 5);

    g.selectAll('.tick line')
        .attr('y2', 18);
}

const xValue = (d) => {
    const month = xAccessor(d).getMonth();
    const year = month > 4 ? 2001 : 2002;
    const day = xAccessor(d).getDate();
    const date = new Date(year, month, day);
    return xScale(date);
};

const yAccessor = d => d.accumulation;

const yScale = d3.scaleLinear()
    .range([height, 0]);


function yAxis(g) {
    const axis = d3.axisLeft(yScale);

    g.call(axis);

    g.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 20)
        .text('Inches');
}

const yValue = (d) => {
    return yScale(yAccessor(d));
};

const drawLine = d3.line()
    .x(xValue)
    .y(yValue);

const tree = d3.quadtree()
    .x(xValue)
    .y(yValue)
    .extent([[-margin.left, -margin.top], [fullWidth, fullHeight]]);

function row(d) {
    return {
        date: parseDate(d.date),
        season: +d.winter_year,
        accumulation: (+d.snow_accumulation) / 25.4,
    };
}

function explore() {
    callToAction.classed('hidden', true);
    hoverRect.classed('opaque', false);
    htmlLayer.classed('no-mouse', true);
}

function takeTour() {
    callToAction.classed('hidden', true);
    hoverRect.classed('opaque', false);
    htmlLayer.classed('no-mouse', true);
}

function ready(data) {
    data = data
        .filter(d => d.season !== 1937)
        .filter(d => d.season !== 1939);

    xScale.domain([new Date(2001, 9, 1), new Date(2002, 3, 30)]);
    yScale.domain([0, d3.max(data, yAccessor)]);

    tree.addAll(data);

    const bySeason = d3.nest()
        .key(d => d.season)
        .entries(data);

    const seasons = g.append('g').attr('class', 'seasons');

    const season = seasons.selectAll('.season').data(bySeason)
        .enter().append('g')
            .attr('class', d => `season season--${d.key}`);
        
    season.append('path')
        .datum(d => d.values)
        .attr('d', drawLine);
    
    season.append('circle')
        .datum(d => d.values.slice(-1)[0])
        .attr('transform', d => `translate(${xValue(d)}, ${yValue(d)})`)
        .attr('r', 4);
    
    season.append('text')
        .datum(d => d.values.slice(-1)[0])
        .attr('transform', d => `translate(${xValue(d)}, ${yValue(d)})`)
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.67em')
        .html((d) => {
            const y0 = d.season;
            const y1 = (y0 + 1).toString().slice(-2);
            return `${y0}&ndash;${y1}`;
        });

    g.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
    
    g.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis);

    function activate(year) {
        season.classed('active', false);
        season
            .filter(d => d.key === year)
            .classed('active', true)
            .raise();
    }

    function highlight(year) {
        season.classed('highlight', false);
        season
            .filter(d => d.key === year)
            .classed('highlight', true)
            .raise();
        activate(defaultYear);
    }

    activate(defaultYear);

    const defaultOption = {selected: true, text: 'Select a winter season...'};

    const seasonOptions = bySeason
        .map(d => {
            const thisYear = +d.key;
            const nextYearAbbrev = (thisYear + 1).toString().slice(-2);
            return {
                value: thisYear,
                text: `${thisYear}-${nextYearAbbrev}`,
            };
        });
    
    seasonOptions.sort((a, b) => {
        const y0 = +a.value;
        const y1 = +b.value;
        return y1 - y0;
    });

    const optionData = [defaultOption].concat(seasonOptions);

    const option = selectBox.selectAll('option').data(optionData)
        .enter().append('option')
            .attr('selected', d => d.selected)
            .attr('value', d => d.value)
            .text(d => d.text);

    function changeSeason(d) {
        const i = selectBox.node().selectedIndex;
        const selectedOption = selectBox.node().options[i];
        defaultYear = selectedOption.value;
        activate(defaultYear);
        highlight(false);
    }

    selectBox.on('change', changeSeason);

    function mouseenter() {
        const [mx, my] = d3.mouse(this);
        const x = mx - margin.left;
        const y = my - margin.top;
        const d = tree.find(x, y);
        const season = d.season.toString();
        highlight(season);
    }

    function mousemove() {
        const [mx, my] = d3.mouse(this);
        const x = mx - margin.left;
        const y = my - margin.top;
        const d = tree.find(x, y);
        const season = d.season.toString();
        highlight(season);
    }

    function mouseleave() {
        highlight(defaultYear);
    }

    hoverRect
        .on('mouseenter', mouseenter)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);

    exploreButton.on('click', explore);
    takeTourButton.on('click', takeTour);
}

function init() {
    d3.csv('./static/snow-accumulation.csv', row)
        .then(ready);
}

export default init;