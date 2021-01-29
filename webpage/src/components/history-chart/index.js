import * as d3 from 'd3';

import './index.scss';

var BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
        for (var i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        var index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        var rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },

    dataBrowser: [
        {string: navigator.userAgent, subString: "Edge", identity: "MS Edge"},
        {string: navigator.userAgent, subString: "MSIE", identity: "Explorer"},
        {string: navigator.userAgent, subString: "Trident", identity: "Explorer"},
        {string: navigator.userAgent, subString: "Firefox", identity: "Firefox"},
        {string: navigator.userAgent, subString: "Opera", identity: "Opera"},  
        {string: navigator.userAgent, subString: "OPR", identity: "Opera"},  

        {string: navigator.userAgent, subString: "Chrome", identity: "Chrome"}, 
        {string: navigator.userAgent, subString: "Safari", identity: "Safari"}       
    ]
};

BrowserDetect.init();
const browser = BrowserDetect.browser;

const mobileWidth = 767;
let windowWidth = 320;

let introAnimationTimer = {};

const viewsData = [
    {
        label: 'All',
        seasons: ['all'],
    },
    {
        label: '10 snowiest winters',
        seasons: ['2007', '1959', '1973', '1978', '1993', '1977', '1951', '1950', '2008', '1964'],
    },
    {
        label: '10 least snowy winters',
        seasons: ['1967', '1953', '1943', '1986', '1944', '1952', '1941', '1962', '2011', '1948'],
    },
    {
        label: '2020s',
        seasons: d3.range(2020, 2030).map(d => d.toString()),
    },
    {
        label: '2010s',
        seasons: d3.range(2010, 2020).map(d => d.toString()),
    },
    {
        label: '2000s',
        seasons: d3.range(2000, 2010).map(d => d.toString()),
    },
    {
        label: '1990s',
        seasons: d3.range(1990, 2000).map(d => d.toString()),
    },
    {
        label: '1980s',
        seasons: d3.range(1980, 1990).map(d => d.toString()),
    },
    {
        label: '1970s',
        seasons: d3.range(1970, 1980).map(d => d.toString()),
    },
    {
        label: '1960s',
        seasons: d3.range(1960, 1970).map(d => d.toString()),
    },
    {
        label: '1950s',
        seasons: d3.range(1950, 1960).map(d => d.toString()),
    },
    {
        label: '1940s',
        seasons: d3.range(1940, 1950).map(d => d.toString()),
    },
];

function pluckRandom(array) {
    const n = array.length - 1;
    const i = Math.floor(Math.random() * n);
    return array[i];
}

const parseDate = d3.timeParse('%Y-%m-%d');

const formatMonth = (date) => {
    const month = date.getMonth();
    const abbreviatedMonths = [0, 1, 7, 8, 9, 10, 11];
    const isAbbreviated = abbreviatedMonths.indexOf(month) > -1;
    if (windowWidth <= mobileWidth) return `${d3.timeFormat('%b')(date)}.`;
    if (isAbbreviated) return `${d3.timeFormat('%b')(date)}.`;
    return d3.timeFormat('%B')(date);
};

const formatMonthDay = d3.timeFormat('%m-%d');
const parseMonthDay = (d) => {
    const date = d3.timeParse('%m-%d')(d);
    const month = date.getMonth();
    if (month < 9) {
        date.setFullYear(date.getFullYear() + 1);
    }
    return date;
};

let defaultYear = '2020';
const years = d3.range(1940, 2021).map(d => d.toString());

const margin = {top: 30, right: 40, bottom: 30, left: 50};
let fullWidth = windowWidth;
let fullHeight = 450;
let width = fullWidth - margin.left - margin.right;
let height = fullHeight - margin.top - margin.bottom;

const container = d3.select('#history-chart')
    .style('max-width', `${fullWidth}px`);


container.classed('MSIE', ['Explorer', 'MS Edge'].indexOf(browser) > -1);

const layers = container.select('.layers')
    .style('width', `${fullWidth}px`)
    .style('height', `${fullHeight}px`);

const htmlLayer = layers.select('.layer--html');

const svg = layers.select('.layer--svg')
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

const callToActionContainer = container.select('.call-to-action-container');
const takeTourButton = callToActionContainer.select('#take-tour');
const skipButton = callToActionContainer.select('#skip');

const sequenceContainer = container.select('.sequence-container');
const sequence = sequenceContainer.select('.sequence')
    .style('top', `${margin.top}px`)
    .style('left', `${margin.left}px`)
    .style('width', `${width}px`)
    .style('height', `${height}px`);

const scene = sequence.selectAll('.scene')
    .datum(function() {
        const id = +this.getAttribute('data-id');
        const season = this.getAttribute('data-season');
        const backgroundSeasons = (this.getAttribute('data-background-seasons') || 'none')
            .split(',')
            .map(d => d.trim());
        return {id, season, backgroundSeasons};
    });

const annotation = scene.selectAll('.annotation')
    .datum(function() {
        return {
            date: parseDate(this.getAttribute('data-date')),
            accumulation: +this.getAttribute('data-accumulation'),
        };
    });

const buttonGroupTour = container.select('.button-group--tour')
    .classed('hidden', true);
const buttonGroupExplore = container.select('.button-group--explore')
    .classed('hidden', true);

const sceneButton = buttonGroupTour.selectAll('button.scene-button')
    .datum(function() { return {id: +this.getAttribute('data-id')}; });
const backButton = buttonGroupTour.select('button[data-id="back"]');
const nextButton = buttonGroupTour.select('button[data-id="next"]');

const selectBoxSeason = container.select('#season-selector');
const selectBoxView = container.select('#view-selector');
const buttonReplayTour = container.select('button[data-id="replay-tour"]');

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
        season: d.winter_year,
        accumulation: (+d.snow_accumulation) / 25.4,
    };
}

function getAverageSeason(data) {
    const entries = data
        .filter((d) => {
            // Remove leap days
            const month = d.date.getMonth();
            const day = d.date.getDate();
            const isLeapDay = month == 1 && day == 29
            return !isLeapDay;
        });

    const average = d3.nest()
        .key(d => formatMonthDay(d.date))
        .rollup(values => d3.mean(values, yAccessor))
        .entries(entries)
        .map((d) => {
            return {
                date: parseMonthDay(d.key),
                season: 'average',
                accumulation: d.value,
            };
        });
    
    average.sort((a, b) => { return a.date - b.date; });

    return average;
}

function ready(data) {
    fullWidth = windowWidth >= 800 ? 800 : windowWidth;
    width = fullWidth - margin.left - margin.right;
    height = fullHeight - margin.top - margin.bottom;

    container
        .style('max-width', `${fullWidth}px`);

    layers
        .style('width', `${fullWidth}px`)
        .style('height', `${fullHeight}px`);

    svg
        .attr('width', fullWidth)
        .attr('height', fullHeight);

    hoverRect
        .attr('width', fullWidth)
        .attr('height', fullHeight)

    sequence
        .style('width', `${width}px`)
        .style('height', `${height}px`);

    data = data
        .filter(d => (+d.season) >= 1940);

    data = data.concat(getAverageSeason(data));    

    xScale
        .domain([new Date(2001, 9, 1), new Date(2002, 3, 30)])
        .range([0, width]);

    yScale
        .domain([0, d3.max(data, yAccessor)]);

    const bySeason = d3.nest()
        .key(d => d.season)
        .entries(data);

    const seasons = g.selectAll('.seasons').data([1]);

    seasons.exit().remove();

    const seasonsEnter = seasons.enter().append('g')
        .attr('class', 'seasons');

    const seasonsUpdate = seasonsEnter.merge(seasons); 

    const season = seasonsUpdate.selectAll('.season').data(bySeason);

    season.exit().remove();

    const seasonEnter = season.enter().append('g')
        .attr('class', d => `season season--${d.key}`);
    
    const seasonUpdate = seasonEnter.merge(season);

    seasonEnter.append('path');

    seasonUpdate.select('path')
        .datum(d => d.values)
        .attr('d', drawLine);
    
    seasonEnter.append('circle')
        .attr('r', 4);

    seasonUpdate.select('circle')
        .datum(d => d.values.slice(-1)[0])
        .attr('transform', d => `translate(${xValue(d)}, ${yValue(d)})`);
    
    seasonEnter.append('text')
        .attr('dy', '-0.67em');

    seasonUpdate.select('text')
        .datum(d => d.values.slice(-1)[0])
        .attr('transform', d => `translate(${xValue(d)}, ${yValue(d)})`)
        .attr('text-anchor', (d) => {
            if (d.season === 'average') return 'end';
            return 'middle';
        })
        .html((d) => {
            if (d.season === 'average') return 'Avg. 1940-2021';
            const y0 = +d.season;
            const y1 = (y0 + 1).toString().slice(-2);
            return `${y0}&ndash;${y1}`;
        });
    
    const gXAxis = g.selectAll('.axis--x').data([1]);
    
    const gXAxisEnter = gXAxis.enter().append('g')
        .attr('class', 'axis axis--x');

    const gXAxisUpdate = gXAxisEnter.merge(gXAxis)
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);
    
    const gYAxis = g.selectAll('.axis--y').data([1])
    
    const gYAxisEnter = gYAxis.enter().append('g')
        .attr('class', 'axis axis--y')
    
    const gYAxisUpdate = gYAxisEnter.merge(gYAxis)
        .call(yAxis);

    annotation
        .style('left', d => `${xValue(d)}px`)
        .style('top', d => `${yValue(d)}px`);

    function activate(year) {
        seasonUpdate.classed('active', false);
        seasonUpdate
            .filter(d => d.key === year)
            .classed('active', true)
            .raise();
    }

    function highlight(year) {
        seasonUpdate.classed('highlight', false);
        seasonUpdate
            .filter(d => d.key === year)
            .classed('highlight', true)
            .raise();
    }

    function animate(year) {
        seasonUpdate
            .classed('animate', false);
        seasonUpdate
            .filter(d => d.key === year)
            .classed('animate', true)
            .raise();
    }

    function backgroundify(years) {
        if (years[0] === 'none') {
            seasonUpdate.classed('backgroundified', false);
        } else if (years[0] === 'all') {
            seasonUpdate.classed('backgroundified', true);
        } else {
            seasonUpdate.classed('backgroundified', false);
            seasonUpdate
                .filter(d => years.indexOf(d.key) > -1)
                .classed('backgroundified', true)
                .raise();
        }
    }

    backgroundify(['all']);

    function animateRandom() {
        const year = pluckRandom(years);
        animate(year);
        highlight(year);
    }

    function startIntroAnimation() {
        animateRandom();
        introAnimationTimer = d3.interval(animateRandom, 2000);
    }

    function stopIntroAnimation() {
        introAnimationTimer.stop();
        animate(false);
        highlight(false);
        backgroundify(['none']);
    }

    startIntroAnimation();

    const seasonOptions = bySeason
        .filter(d => d.key !== 'average')
        .map((d) => {
            const thisYear = +d.key;
            const nextYearAbbrev = (thisYear + 1).toString().slice(-2);
            return {
                value: thisYear,
                text: `${thisYear}-${nextYearAbbrev}`,
                selected: thisYear === +defaultYear,
            };
        });
    
    seasonOptions.sort((a, b) => {
        const y0 = +a.value;
        const y1 = +b.value;
        return y1 - y0;
    });

    const optionSeason = selectBoxSeason.selectAll('option').data(seasonOptions);

    const optionSeasonEnter = optionSeason.enter().append('option');

    const optionSeasonUpdate = optionSeasonEnter.merge(optionSeason)
        .attr('selected', d => d.selected ? 'selected' : null)
        .attr('value', d => d.value)
        .text(d => d.text);

    function changeSeason(d) {
        const i = selectBoxSeason.node().selectedIndex;
        const selectedOption = selectBoxSeason.node().options[i];
        defaultYear = selectedOption.value;
        activate(defaultYear);
        animate(defaultYear);
        highlight(false);
    }

    selectBoxSeason.on('change', changeSeason);

    const viewOptions = viewsData
        .map((d) => {
            return {
                value: d.label,
                text: d.label,
                selected: d.seasons === 'all',
            };
        });

    const optionView = selectBoxView.selectAll('option').data(viewOptions);

    const optionViewEnter = optionView.enter().append('option');

    const optionViewUpdate = optionViewEnter.merge(optionView)
        .attr('selected', d => d.selected ? 'selected' : null)
        .attr('value', d => d.value)
        .text(d => d.text);

    function changeView() {
        const i = selectBoxView.node().selectedIndex;
        const selectedOption = selectBoxView.node().options[i];
        const label = selectedOption.value;
        const d = viewsData
            .filter(d => d.label === label)[0];
        const seasons = d.seasons;
        animate(false);
        backgroundify(seasons);
        activate(defaultYear);

        let subset = data;
        if (seasons[0] !== 'all') {
            subset = data.filter(d => seasons.indexOf(d.season) > -1);
        }

        tree.removeAll(data);
        tree.addAll(subset);
    }

    selectBoxView.on('change', changeView);

    function mouseenter() {
        const [mx, my] = d3.mouse(this);
        const x = mx - margin.left;
        const y = my - margin.top;
        const d = tree.find(x, y);
        const season = d.season.toString();
        highlight(season);
        animate(false);
        activate(defaultYear);
    }

    function mousemove() {
        const [mx, my] = d3.mouse(this);
        const x = mx - margin.left;
        const y = my - margin.top;
        const d = tree.find(x, y);
        const season = d.season.toString();
        highlight(season);
        activate(defaultYear);
    }

    function mouseleave() {
        highlight(defaultYear);
    }

    function nothing() {
        console.log(d3.event);
    }

    hoverRect
        .on('mouseenter', mouseenter)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave);
    
    function skip() {
        stopIntroAnimation();

        callToActionContainer.classed('hidden', true);
        sequenceContainer.classed('hidden', true);
        buttonGroupExplore.classed('hidden', false);
        buttonGroupTour.classed('hidden', true);

        svg.raise();

        backgroundify(['all']);
        animate(false);
        activate(defaultYear);
        tree.addAll(data);
    }

    function takeTour() {
        stopIntroAnimation();

        const numScenes = 5;
        const n = numScenes + 1;

        callToActionContainer.classed('hidden', true);
        sequenceContainer.classed('hidden', false);
        buttonGroupExplore.classed('hidden', true);
        buttonGroupTour.classed('hidden', false);

        htmlLayer.raise();

        let id = 1;

        updateScene(id);

        sceneButton.on('click', ({id: newId}) => {
            id = newId;
            updateScene(id);
        });

        backButton.on('click', () => {
            const newId = id - 1;
            if (newId > 0 & newId < n) {
                id = newId;
                updateScene(id);
            }
        });

        nextButton.on('click', () => {
            const newId = id + 1;
            if (newId > 0 & newId < n) {
                id = newId;
                updateScene(id);
            } else if (newId >= n) {
                skip();
            }
        })
    }

    function updateScene(sceneId) {
        stopIntroAnimation();
        
        scene.classed('inactive', ({id}) => id !== sceneId);
        sceneButton.classed('inactive', ({id}) => id !== sceneId);    
        const {
            season,
            backgroundSeasons
        } = scene.data().filter(({id}) => id === sceneId)[0];

        backgroundify(backgroundSeasons);
        activate(season);
        animate(season);
    }

    skipButton.on('click', skip);
    takeTourButton.on('click', takeTour);
    buttonReplayTour.on('click', takeTour);
}

const init = (w) => {
    if (introAnimationTimer.stop !== undefined) introAnimationTimer.stop();
    windowWidth = w;
    d3.csv('./static/mke-snow-accumulation.csv', row)
        .then(ready);
};

export default init;

