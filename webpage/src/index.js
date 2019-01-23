import * as d3 from 'd3';
import {default as initHistoryChart} from './components/history-chart/';
import {default as initMonthlyMaps} from './components/monthly-maps/';

import './index.scss';

function getWidthDimensions() {
    const w = window;
    const d = document;
    const e = d.documentElement;
    const g = d.getElementsByTagName('body')[0];
    const x = w.innerWidth || e.clientWidth || g.clientWidth;
    const y = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return [x, y];
}

function throttle(func, limit) {
    let lastFunc
    let lastRan
    return function() {
        const context = this
        const args = arguments
        if (!lastRan) {
        func.apply(context, args)
        lastRan = Date.now()
        } else {
        clearTimeout(lastFunc)
        lastFunc = setTimeout(function() {
            if ((Date.now() - lastRan) >= limit) {
            func.apply(context, args)
            lastRan = Date.now()
            }
        }, limit - (Date.now() - lastRan))
        }
    }
}

let [width0] = getWidthDimensions();
function resize() {
    const [width1] = getWidthDimensions();
    if (width0 !== width1) {
        initHistoryChart(width1);
        initMonthlyMaps(width1);
        width0 = width1;
    }
}

d3.select(window).on('resize', throttle(resize, 1000));

// Kick things off
initHistoryChart(width0);
initMonthlyMaps(width0);
