<template>
  <div>
    <chart
      :data="chartData"
      :calenderPeriod="calenderPeriod"
      :pointWidth="pointWidth"
      :chartType="chartType"
      v-if="chartData && summary.reports"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import Chart from "@/components/chart/BarChart.vue";

import { ChartFieldViewModel, ChartViewModel, SummaryModel } from "@/model";

@Component({
  components: { Chart },
})
export default class RevenueChart extends Vue {
  @Prop() summary: SummaryModel;
  @Prop() chartType: string;
  @Prop() pointWidth: string;

  private chartData: ChartViewModel = null;

  mounted() {
    this.bindChart();
  }

  bindChart() {
    this.chartData = new ChartViewModel();
    this.chartData.categories = this.summary.reports.map((r) => r.reportName);

    if (
      this.summary.reports.length > 0 &&
      this.summary.reports.some((r) => r.isDataAvailabe)
    ) {
      let chartField = new ChartFieldViewModel();

      if (this.chartType == "On-cycle") {
        if (this.summary.reports.some((r) => r.onCycleFee != 0)) {
          this.chartData.isLogarithmic = false;

          chartField.name = this.$store.getters.settings.billingEvent.OnCycle;
          chartField.color = "#00AAE7";
          chartField.data = this.summary.reports.map((r) => ({
            dataLabels: { color: r.onCycleFee < 0 ? "#ec6f73" : "#566273" },
            y: Math.abs(r.onCycleFee),
          }));
          this.chartData.fields.push(chartField);
        }
      } else {
        if (
          this.summary.reports.some(
            (r) => r.newFee != 0 || r.lostFee != 0 || r.adjustmentFee != 0
          )
        ) {
          this.chartData.isLogarithmic = true;

          chartField = new ChartFieldViewModel();
          chartField.name =this.$store.getters.settings.billingEvent.Inception+'/'+
                this.$store.getters.settings.billingEvent.Deposit;           
          chartField.color = "#8CD790";
          chartField.data = this.summary.reports.map((r) => ({
            dataLabels: { color: r.newFee < 0 ? "#ec6f73" : "#566273" },
            y: Math.abs(r.newFee),
          }));
          this.chartData.fields.push(chartField);

          chartField = new ChartFieldViewModel();
          chartField.name =this.$store.getters.settings.billingEvent.Termination+'/'+
                this.$store.getters.settings.billingEvent.Withdrawal;        
          chartField.color = "#EC6D71";
          chartField.data = this.summary.reports.map((r) => ({
            dataLabels: { color: r.lostFee < 0 ? "#ec6f73" : "#566273" },
            y: Math.abs(r.lostFee),
          }));
          this.chartData.fields.push(chartField);

          chartField = new ChartFieldViewModel();
          chartField.name = "Adjustments";
          chartField.color = "#710691";
          chartField.data = this.summary.reports.map((r) => ({
            dataLabels: { color: r.adjustmentFee < 0 ? "#ec6f73" : "#566273" },
            y: Math.abs(r.adjustmentFee),
          }));
          this.chartData.fields.push(chartField);
        }
      }
    }
  }

  get calenderPeriod() {
    let period = this.summary.reports.length
      ? this.summary.reports[0].reportName
      : "";

    return period;
  }
}
</script>