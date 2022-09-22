import { Line, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options', 'chartData'],
  watch: {
    options: {
      deep: true,
      handler () {
        this.$data._chart.options = this.options;
        this.updateChart();
      }
    },

    chartType (newVal) {
      this.$data._chart.config.type = newVal;
      this.updateChart()
    }
  },
  methods: {
    updateChart () {
      this.$data._chart.update();
    },
  },
  mounted () {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  }
}