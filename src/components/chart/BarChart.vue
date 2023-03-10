<template>
  <div class="chart">
    <div class="chart__data" :id="chartType + '-container'"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import * as Highcharts from "highcharts/highstock";
import NoDataToDisplay from "highcharts/modules/no-data-to-display";

NoDataToDisplay(Highcharts);

import { ChartViewModel } from "@/model";

@Component
export default class Chart extends Vue {
  @Prop() data: ChartViewModel;
  @Prop() pointWidth: string;
  @Prop() calenderPeriod: string;
  @Prop() chartType: string;

  mounted() {
    this.bindChart();
  }

  @Watch("data", {})
  public bindChart() {
    let chartSeries: Array<any> = this.data.fields;
    Highcharts.setOptions({
      lang: {
        rangeSelectorZoom: "",
      },
      chart: {
        style: {
          fontFamily: "Montserrat",
        },
      },
    });

    let self = this;
    Highcharts.chart(
      this.chartType + "-container",
      {
        chart: {
          type: "column",
          marginTop: 40,
        },
        credits: {
          enabled: false,
        },
        exporting: {
          enabled: false,
        },
        title: {
          text: "",
        },
        subtitle: {
          text: "",
        },
        lang: {
          noData:
            "Oops, looks like there is no revenue data. There is work to be done!",
        },
        legend: {
          //layout: 'vertical',
          align: "right",
          verticalAlign: "top",
          floating: true,
          symbolHeight: 11,
          symbolWidth: 11,
          symbolRadius: 0,
          itemMarginTop: -15,
          itemMarginBottom: 50,
          itemDistance: 50,
          itemStyle: {
            color: "#5f5f5f",
            fontSize: "1.2rem",
          },

          enabled: false,
        },
        xAxis: {
          categories: this.data.categories,
          //margin: 20,
          //opposite: true,
          labels: {
            useHTML: true,
            formatter: function () {
              if (this.value.toString() == self.calenderPeriod)
                return `<span class="xaxis-label xaxis-label--active">${this.value}</span>`;
              else return `<span class="xaxis-label">${this.value}</span>`;
            },
          },
        },
        yAxis: {
          type: this.data.isLogarithmic ? "logarithmic" : "linear",
          min: 0.1,
          title: {
            text: "",
          },
          labels: {
            formatter: function () {
              return `$${this.value < 1 ? '0' : this.value}`;
            },
            style: {
              color: "#9aa1aa",
              fontSize: "1rem",
              fontWeight: "600",
            },
          },
        },
        tooltip: {
          useHTML: true,
          formatter: function () {
            return `
              <div class="text--align-center pa--x-1">
                <p class="pa--bottom-1"><strong>${this.series.name}</strong></p>
                <p>${self.$options.filters.currencyDisplay(this.point.y, 2)}</p>
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
        plotOptions: {
          column: {
            pointWidth: parseInt(this.pointWidth),
            dataLabels: {
              enabled: true,
              color: "#959595",
              //format: '${y}'
              formatter: function (e) {
                let points;
                if (e.color == "#ec6f73")
                  points = `${self.$options.filters.currencyDisplay(
                    -this.point.y,
                    2
                  )}`;
                else
                  points = self.$options.filters.currencyDisplay(
                    this.point.y,
                    2
                  );
                return this.point.y? points : "";
              },
            },
          },
          series: {
            events: {
              legendItemClick: function (e) {
                e.preventDefault();
              },
            },
          },
        },
        navigator: {
          enabled: false,
        },
        series: chartSeries,
      },
      (chart) => {
        if (chartSeries.length == 0) this.renderNoDataImage(chart);
      }
    );
  }

  private renderNoDataImage(chart: Highcharts.Chart) {
    chart.renderer
      .image("/img/no-data-chart.png", 250, 60, 400, 300)
      .add()
      .addClass("highcharts-no-data");
  }
}
</script>   