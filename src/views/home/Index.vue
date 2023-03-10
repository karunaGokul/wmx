<template>
  <div class="content-home" v-if="summary">
    <section class="welcome">
      <div class="row">
        <div class="column-7">
          <h1 class="welcome__message">
            Welcome back, {{ $store.getters.userName }}
          </h1>
        </div>
        <div class="column-5">
          <div class="welcome__overview-data">
            <div class="welcome__overview-data--count">
              <p class="welcome__overview-category">Households</p>
              <p class="welcome__overview-value">
                {{ summary.totalHouseholds }}
              </p>
            </div>
            <div class="welcome__overview-data--count">
              <div class="welcome__overview-category">
                Advisory fees <app-help id="1" position="left" />
              </div>
              <p class="welcome__overview-value">
                {{ summary.totalRevenue | currencyDisplay }}
              </p>
            </div>
            <div class="welcome__overview-data--count">
              <div class="welcome__overview-category">
                Change <app-help id="2" position="left" />
              </div>
              <p
                class="welcome__overview-value"
                :class="{
                  'text--color-green': summary.change > 0,
                  'text--color-red': summary.change < 0,
                }"
              >
                {{ summary.change | percentDisplay }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="chart-section">
      <div class="row ma--bottom-5">
        <div class="column-6">
          <div class="chart-section__subtitle" v-if="calenderPeriod">
            {{ calenderPeriod }} calendar period
          </div>
        </div>
        <div class="column-6">
          <div class="display--flex justify-content--end">
            <div
              class="dropdown pa--right-6"
              v-click-outside="clickOutsideFeeType"
            >
              <a
                class="dropdown-toggle"
                @click="feeTypeToggle = !feeTypeToggle"
                >{{ selectedFeeType }}</a
              >
              <ul
                class="dropdown-menu dropdown-menu__left"
                :class="{ show: feeTypeToggle }"
              >
                <li
                  class="dropdown-item"
                  v-for="(item, index) in feeTypes"
                  :key="index"
                  :class="{ 'dropdown-item-active': selectedFeeType == item }"
                  @click="updateFeeType(item)"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div
              class="dropdown pa--left-6"
              v-click-outside="clickOutsideRevenueType"
            >
              <a
                class="dropdown-toggle"
                @click="revenueTypeToggle = !revenueTypeToggle"
                >{{ selectedRevenueType }}</a
              >
              <ul
                class="dropdown-menu dropdown-menu__left"
                :class="{ show: revenueTypeToggle }"
              >
                <li
                  class="dropdown-item"
                  v-for="(item, index) in revenueTypes"
                  :key="index"
                  :class="{
                    'dropdown-item-active': selectedRevenueType == item,
                  }"
                  @click="updateRevenueType(item)"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="row" v-if="summary">
        <div class="column-6 border--right">
          <div class="chart-section__title justify-content--center">
            Approvals
            <app-help id="3" position="right" />
          </div>
          <ApprovalsPaymentFees
            feesType="Approvals"
            :data="approvalsFees"
            :calenderPeriod="calenderPeriod"
          />
        </div>
        <div class="column-6">
          <div class="chart-section__title justify-content--center">
            Payments
            <app-help id="4" position="left" />
          </div>
          <ApprovalsPaymentFees
            feesType="Payments"
            :data="paymentsFees"
            :calenderPeriod="calenderPeriod"
          />
        </div>
      </div>
    </section>

    <section class="chart-section">
      <div class="row align--center ma--bottom-1">
        <div class="column-6">
          <div class="chart-section__title">
            {{ $store.getters.settings.billingEvent.OnCycle }} fees
            <app-help id="5" position="right" />
          </div>
        </div>
        <div class="column-6">
          <div class="text--size-1-5 text--align-right" v-if="calenderPeriod">
            {{ calenderPeriod }} Y-O-Y Growth:
            <span
              :class="{
                'text--color-green': growthPercent > 0,
                'text--color-red': growthPercent <= 0,
              }"
              >{{ growthPercent | percentDisplay }}</span
            >
          </div>
        </div>
      </div>
      <RevenueChart :summary="summary" chartType="On-cycle" pointWidth="80" />
    </section>

    <section class="chart-section">
      <div class="row align--center ma--bottom-1">
        <div class="column-6">
          <div class="chart-section__title">
            Adjustment Details
            <app-help id="6" position="center" />
          </div>
        </div>
        <div class="column-6">
          <ul class="legend text--size-1-2 justify-content--end">
            <li class="legend__item legend__item--square before--color-green">
              {{ $store.getters.settings.billingEvent.Inception }}/{{
                $store.getters.settings.billingEvent.Deposit
              }}
            </li>
            <li class="legend__item legend__item--square before--color-red">
              {{ $store.getters.settings.billingEvent.Termination }}/{{
                $store.getters.settings.billingEvent.Withdrawal
              }}
            </li>
            <li class="legend__item legend__item--square before--color-purple">
              Adjustments
            </li>
          </ul>
        </div>
      </div>
      <RevenueChart :summary="summary" chartType="All" pointWidth="40" />
    </section>

    <hr class="divider ma--x-1" />
  </div>
</template>

<script lang="ts">
import { Component, Inject } from "vue-property-decorator";
import { IReportService } from "@/service";
import {
  SummaryModel,
  RevenueType,
  FeeType,
  FeeSummaryStatusModel,
} from "@/model";
import { BaseComponent } from "@/components";

import AppHelp from "@/components/layout/AppHelp.vue";
import Chart from "@/components/chart/BarChart.vue";
import RevenueChart from "@/views/home/components/RevenueChart.vue";
import ApprovalsPaymentFees from "./components/ApprovalsPaymentFees.vue";

@Component({
  components: {
    Chart,
    ApprovalsPaymentFees,
    RevenueChart,
    AppHelp,
  },
})
export default class HomePage extends BaseComponent {
  @Inject("reportService") service: IReportService;

  public revenueTypeToggle: boolean = false;
  public feeTypeToggle: boolean = false;
  public selectedRevenueType: string = "Total";
  public selectedFeeType: string = "Client fee";

  private summary: SummaryModel = null;

  private approvalsFees: Array<FeeSummaryStatusModel> = [];
  private paymentsFees: Array<FeeSummaryStatusModel> = [];

  private revenueTypes: Array<string> = Object.keys(RevenueType);
  private feeTypes: Array<string> = Object.keys(FeeType);

  mounted() {
    this.getReport();
  }

  public getReport() {
    let reportType =
      RevenueType[
        this.selectedRevenueType.toString() as keyof typeof RevenueType
      ];

    let feeType =
      FeeType[this.selectedFeeType.toString() as keyof typeof FeeType];

    this.service.getReport(reportType, feeType).then((response) => {
      this.approvalsFees = [];
      this.paymentsFees = [];
      this.summary = response;

      this.summary.feeSummaryStatus.forEach((item) => {
        if (item.category == "Needs Your Approval")
          this.approvalsFees[0] = item;
        else if (item.category == "Approved") this.approvalsFees[1] = item;
        else if (item.category == "Pending Payment")
          this.paymentsFees[0] = item;
        else if (item.category == "Paid") this.paymentsFees[1] = item;
        else if (item.category == "Rejected") this.paymentsFees[2] = item;
      });
    });
  }

  public updateRevenueType(revenueType: string) {
    if (this.selectedRevenueType != revenueType) {
      this.selectedRevenueType = revenueType;
      this.revenueTypeToggle = false;
      this.getReport();
    }
  }

  public updateFeeType(feeType: string) {
    if (this.selectedFeeType != feeType) {
      this.selectedFeeType = feeType;
      this.feeTypeToggle = false;
      this.getReport();
    }
  }

  public clickOutsideRevenueType() {
    this.revenueTypeToggle = false;
  }

  public clickOutsideFeeType() {
    this.feeTypeToggle = false;
  }

  get calenderPeriod() {
    let period;
    period =
      this.summary.reports.length > 0 ? this.summary.reports[0].reportName : "";

    return period;
  }

  get growthPercent() {
    let percent = 100;

    if (
      this.summary.reports.length > 4 &&
      this.summary.reports[4].onCycleFee > 0
    ) {
      let increase =
        this.summary.reports[0].onCycleFee - this.summary.reports[4].onCycleFee;

      percent = (increase / this.summary.reports[4].onCycleFee) * 100;
    }

    return percent;
  }
}
</script>   