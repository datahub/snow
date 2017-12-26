<template>
  <div id="app">
    <div id="header"></div>
    <div id="story">
      <div id="headline">
        <h1 class="hed">
          This Winter in Milwaukee
        </h1>
        <p class="dek">
          See how this winter compares to all winters past. Information will
          be updated daily.
        </p>
      </div>
      <section>
        <p>
          Spicy jalapeno bacon ipsum dolor amet veniam bresaola pork chop
          exercitation pork belly. Mollit swine frankfurter consequat pig
          pork loin short ribs ipsum et tail short loin sausage nisi irure.
          Sint commodo hamburger fugiat. Nulla non brisket sausage cillum.
          Rump ullamco sausage turducken non voluptate cillum. Spare ribs
          leberkas nisi in mollit cillum tri-tip. Ut pig minim, ex capicola
          beef labore laboris ham hock buffalo.
        </p>
      </section>
      <section class="graphic" id="snow-accumulation-chart">
        <div class="chatter">
          <h2>How much snow has fallen in Milwaukee?</h2>
          <p>
            Total snow accumulation for all winters from 1938 to the present.
          </p>
        </div>
        <SnowAccumulationChart/>
      </section>
      <section>
        <p>
          Venison jowl excepteur non, buffalo fugiat fatback tongue dolore boudin
          pancetta. Irure occaecat swine jowl dolor proident short ribs ut, tempor
          salami. Meatloaf leberkas dolore pariatur salami. Enim sausage ribeye et
          sirloin ut eu laboris tempor bresaola jowl sint short ribs commodo cupim.
          Culpa burgdoggen leberkas turducken anim short loin ball tip pork chop
          quis filet mignon ex lorem eiusmod in pork loin. Kevin meatball short
          ribs et rump ut. Tail duis aliquip, sausage frankfurter pariatur officia
          laboris ea tongue esse short ribs qui tenderloin ribeye.
        </p>
      </section>
      <section class="graphic" id="snow-accumulation-map">
        <div class="chatter">
          <h2>Snowfall across Wisconsin</h2>
          <p>
            Total snow accumulation from the current winter season.
          </p>
        </div>
        <SnowAccumulationMap />
      </section>
    </div>
    <div id="footer"></div>
  </div>
</template>

<script>
import SnowAccumulationChart from './components/SnowAccumulationChart';
import SnowAccumulationMap from './components/SnowAccumulationMap';

export default {
  name: 'app',
  components: {
    SnowAccumulationChart,
    SnowAccumulationMap,
  },
};
</script>

<style lang="scss">

/* TODO: Replace placeholders with the actual header/footer */
#header {
  position: fixed;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 40px;
  border-bottom: 1px solid #ccc;
  background-color: #f3f3f3;
}

#footer {
  margin-top: 75px;
  width: 100%;
  height: 300px;
  border-top: 1px solid #ccc;
  background-color: #f3f3f3;
}

html, body {
  margin: 0;
  padding: 0;
  font-size: 18px;
}

#app {
  font-family: 'Unify Serif', sans-serif;
  color: #434343;
}

#story {
  padding: 41px 10px 0px 10px;
}

#headline {
  max-width: 450px;
  margin: 0 auto;

  .hed {
    font-size: 34px;
    color: #333;
    margin-bottom: 12px;
  }

  .dek {
    margin-top: 0px;
    color: #666;
  }
}

section {
  max-width: 500px;
  margin: 50px auto;
  line-height: 1.4;
}

section.graphic {
  font-family: 'Unify Sans', sans-serif;
  margin: 75px auto;
  .chatter {
    h2 {
      margin-bottom: 8px;
      font-size: 24px;
      color: #333;
    }
    p {
      margin-top: 0px;
      color: #666;
    }
  }
}

</style>
