<template>
  <div>
    <div class="row" v-if="totalFees">
      <div class="column-6">
        <PieChart
          :chartName="feesType"
          :pieChartData="chartData"
          :totalFees="titleFees"
          v-if="chartData"
        />
      </div>
      <div class="column-6 display--flex align-items--center">
        <table class="table table--nohover">
          <tbody class="table__body">
            <tr v-for="item in response" :key="item.category">
              <td
                class="legend__item pa--x-0 pa--y-1"
                :class="{
                  'before--color-blue': item.category == 'Approved',
                  'before--color-orange':
                    item.category == 'Needs Your Approval',
                  'before--color-dark-red': item.category == 'Waived/Exempted',
                  'before--color-green': item.category == 'Paid',
                  'before--color-light-green':
                    item.category == 'Pending Payment',
                  'before--color-red': item.category == 'Rejected',
                }"
              >
                {{ item.category }}
              </td>
              <td class="pa--x-0 pa--y-1 text--align-right">
                <a
                  class="td__link"
                  :class="{
                    'text--color-red': item.totalFees < 0,
                  }"
                  href="#"
                  @click="showDetails(item.category)"
                >
                  {{ item.totalFees | currencyDisplay }}
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="!totalFees">
      <table class="table">
        <tbody>
          <tr>
            <td colspan="7" class="text--align-center chart__empty">
              <div class="pa-3 text--size-1-6">
                You have no outstanding client fees
              </div>
              <img
                src="../../../assets/NoOutstandingFees.png"
                alt="No Data"
                width="400px"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import PieChart from "@/components/chart/PieChart.vue";

import { FeeSummaryStatusModel, ChartColor, FeeStatusGauge } from "@/model";

@Component({
  components: { PieChart },
})
export default class ApprovalsPaymentFees extends Vue {
  @Prop() feesType: string;
  @Prop() data: Array<FeeSummaryStatusModel>;
  @Prop() calenderPeriod: string;

  public response: Array<FeeSummaryStatusModel> = [];
  public chartData: Array<any> = [];

  mounted() {
    this.bindChart();
  }

  @Watch("data")
  bindChart() {
    this.chartData = [];
    this.response = this.$vuehelper.clone(this.data);
    this.data.forEach((item) => {
      item.totalFees = Math.abs(item.totalFees);
      if (item.totalFees > 0) {
        this.chartData.push({
          name: item.category,
          y: this.calculatePercentage(item.totalFees),
          x: item.totalFees,
          color:
            ChartColor[item.category.toString() as keyof typeof ChartColor],
        });
      }
    });
    this.chartData.reverse();
  }

  public calculatePercentage(fees: number) {
    let percentage: number = (fees / this.totalFees) * 100;
    percentage = percentage < 1 && percentage > 0 ? 5 : percentage;
    return percentage;
  }

  public showDetails(category: string) {
    this.$router.push({
      path: `${
        category == "Needs Your Approval" ? "/approve-billing" : "/review-billing"
      }`,
      query: {
        status: FeeStatusGauge[category as keyof typeof FeeStatusGauge],
        period: category == "Paid" ? this.calenderPeriod : undefined
      },
    });
  }

  get totalFees() {
    return this.data.reduce(
      (sum, { totalFees }) => sum + Math.abs(totalFees),
      0
    );
  }

  get titleFees() {
    return this.response.reduce((sum, { totalFees }) => sum + totalFees, 0);
  }
}
</script>