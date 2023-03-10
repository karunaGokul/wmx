<template>
  <div :id="chartName + '-containter'"></div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Prop, Watch } from "vue-property-decorator";
import * as Highcharts from "highcharts/highstock";

@Component
export default class PieChart extends Vue {
  @Prop() pieChartData: Array<any>;
  @Prop() chartName: string;
  @Prop() totalFees: string;

  mounted() {
    this.bindChart();
  }

  @Watch("pieChartData", {})
  public bindChart() {
    let chartSeries: Array<any> = this.pieChartData;
    Highcharts.setOptions({
      chart: {
        style: {
          fontFamily: "Montserrat",
        },
      },
    });
    let self = this;
    Highcharts.chart(this.chartName + "-containter", {
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false,
        height: 300,
      },
      title: {
        text: `
                    ${self.$options.filters.currencyDisplay(this.totalFees, 2)}
                `,
        align: "center",
        verticalAlign: "middle",
        y: 60,
        style: {
          fontSize: "24px",
          color: +this.totalFees >= 0 ? "#5F5F5F" : "#ec6f73",
          fontWeight: "700",
        },
      },
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: false,
      },
      tooltip: {
        useHTML: true,
        formatter: function () {
          return `
                        <div class="text--align-center pa--x-1">
                            <p class="pa--bottom-1"><strong>${
                              this.point.name
                            }</strong></p>
                            <p>${self.$options.filters.currencyDisplay(
                              this.point.x,
                              2
                            )}</p>
                        </div>
                    `;
        },
        backgroundColor: "#5F5F5F",
        borderColor: "#5F5F5F",
        borderRadius: 5,
        style: {
          color: "#fff",
        },
      },
      accessibility: {
        point: {
          valueSuffix: "%",
        },
      },
      pane: {
        background: [
          {
            innerRadius: "60%",
            outerRadius: "100%",
          },
        ],
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: false,
            distance: -50,
            style: {
              fontWeight: "bold",
              color: "white",
            },
          },
          startAngle: -120,
          endAngle: 120,
          center: ["50%", "75%"],
          size: "115%",
          states: {
            hover: {
              halo: {
                size: 0,
              },
            },
          },
        },
      },
      series: [
        {
          type: "pie",
          innerSize: "70%",
          data: chartSeries,
        },
      ],
    });
  }
}
</script>