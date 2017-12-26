<template>
  <div ref="container" class="snow-accumulation-chart">
    <svg :width="width" :height="height" ref="svg" :data-winters="numElement">
      <g class="innards">
        <g class="axis axis--x"></g>
        <g class="axis axis--y"></g>
      </g>
    </svg>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import * as d3 from 'd3';

const margin = { top: 10, right: 10, bottom: 30, left: 30 };

const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

const path = d3.line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d.snow_accumulation));

export default {
  name: 'SnowAccumulationChart',
  data() {
    return {
      data: [],
      width: 500,
    };
  },
  computed: {
    height() {
      return this.width * (500 / 960);
    },
    numElement() {
      return this.data.length;
    },
  },
  methods: {
    handleResize() {
      const parent = this.$refs.container.parentElement;
      this.width = parent.clientWidth;
    },
  },
  created() {
    d3.select(window).on('resize.snow-accum-chart', throttle(this.handleResize, 333));
  },
  destroyed() {
    d3.select(window).on('resize.snow-accum-chart', null);
  },
  mounted() {
    const parseDate = d3.timeParse('%Y-%m-%d');

    const row = d => ({
      date: parseDate(d.date),
      winter_year: +d.winter_year,
      snow_accumulation: +d.snow_accumulation,
    });

    const ready = (error, data) => {
      if (error) throw error;
      this.data = data;
    };

    d3.csv('static/data/snow-accumulation.csv', row, ready);

    this.handleResize();
  },
  updated() {
    xScale
      .domain([0, 212])
      .range([0, this.width - margin.left - margin.right]);

    yScale
      .domain([0, d3.max(this.data, d => d.snow_accumulation)])
      .range([this.height - margin.top - margin.bottom, 0]);

    const winters = d3.nest()
        .key(d => d.winter_year)
        .entries(this.data);

    const svg = d3.select(this.$refs.svg);

    const g = svg.select('.innards')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const line = g.selectAll('.line').data(winters);

    const lineEnter = line.enter().append('path')
      .attr('class', 'line');

    line.merge(lineEnter)
      .attr('d', d => path(d.values))
      .classed('highlighted', d => d.key === '2017');

    line.exit().remove();

    const xAxis = d3.axisBottom(xScale);

    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => d3.format('.0f')(d * 0.0393701));

    g.select('.axis--x')
      .attr('transform', `translate(0, ${this.height - margin.top - margin.bottom})`)
      .call(xAxis);

    g.select('.axis--y')
      .call(yAxis);
  },
};
</script>

<style lang="scss">

.snow-accumulation-chart {
  background-color: #fcfcfc;
}

.line {
  fill: none;
  stroke: #000;
  opacity: 0.05;
}

.line.highlighted {
  opacity: 1;
}

</style>
