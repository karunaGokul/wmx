<template>
  <div class="households" v-if="fees">
    <div class="content__header">
      <router-link to="/households" tag="a" class="content__header-back"
        >Back to households</router-link
      >
      <h2 class="content__header-title">{{ fees.householdName }}</h2>
    </div>
    <div>
      <p class="households__heading">
        {{ calenderPeriod }} {{ selectedFeeType }}s
      </p>
      <div class="row no-gutters">
        <div class="column-3 pa--right-2">
          <div class="households__heading-data">
            <span
              :class="{
                'text--color-red': fees.netFee < 0,
              }"
              >{{ fees.netFee | currencyDisplay }}</span
            >
            <app-help id="7" position="right" />
          </div>
          <table class="table households__table">
            <tbody>
              <tr>
                <td class="text--weight-medium">
                  {{ $store.getters.settings.billingEvent.OnCycle }} fees
                </td>
                <td class="text--align-right">
                  <span :class="{ 'text--color-red': fees.onCycle < 0 }">{{
                    fees.onCycle | currencyDisplay
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">
                  Fees from {{ $store.getters.settings.billingEvent.Inception }}
                </td>
                <td class="text--align-right">
                  <span :class="{ 'text--color-red': fees.newRevenue < 0 }">{{
                    fees.newRevenue | currencyDisplay
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">
                  Fees from {{ $store.getters.settings.billingEvent.Deposit }}
                </td>
                <td class="text--align-right">
                  <span :class="{ 'text--color-red': fees.deposit < 0 }">{{
                    fees.deposit | currencyDisplay
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">
                  Credits for
                  {{ $store.getters.settings.billingEvent.Termination }}
                </td>
                <td class="text--align-right">
                  <span :class="{ 'text--color-red': fees.termination < 0 }">{{
                    fees.termination | currencyDisplay
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">
                  Credits for
                  {{ $store.getters.settings.billingEvent.Withdrawal }}
                </td>
                <td class="text--align-right">
                  <span :class="{ 'text--color-red': fees.withdrawal < 0 }">{{
                    fees.withdrawal | currencyDisplay
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">Other Adjustments</td>
                <td class="text--align-right">
                  <span
                    :class="{ 'text--color-red': fees.adjustmentRevenue < 0 }"
                    >{{ fees.adjustmentRevenue | currencyDisplay }}</span
                  >
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">Average Rate</td>
                <td class="text--align-right">
                  <span
                    :class="{ 'text--color-red': fees.effectiveRate < 0 }"
                    >{{ fees.effectiveRate | percentDisplay }}</span
                  >
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">Total Assets</td>
                <td class="text--align-right">
                  <span :class="{ 'text--color-red': fees.totalAssets < 0 }">{{
                    fees.totalAssets | currencyDisplay
                  }}</span>
                </td>
              </tr>
              <tr>
                <td class="text--weight-medium">Excluded from Billing</td>
                <td class="text--align-right">
                  <span
                    :class="{ 'text--color-red': fees.excludedFromBilling < 0 }"
                  >
                    {{ fees.excludedFromBilling | currencyDisplay }}</span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="column-9">
          <div class="tab-container">
            <div class="display--flex justify-content--end">
              <div class="dropdown" v-click-outside="clickOutsideFeeType">
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
              <ul class="tab ma--left-5">
                <li
                  class="tab__item"
                  :class="{ active: selectedTab == 1 }"
                  @click="selectedTab = 1"
                >
                  {{ $store.getters.settings.billingEvent.OnCycle }}
                </li>
                <li
                  class="tab__item"
                  :class="{ active: selectedTab == 2 }"
                  @click="selectedTab = 2"
                >
                  Adjustments
                </li>
              </ul>
            </div>
            <div class="tab__content" :class="{ active: selectedTab == 1 }">
              <RevenueChart
                :summary="fees"
                chartType="On-cycle"
                pointWidth="80"
                v-if="fees"
              />
            </div>
            <div class="tab__content" :class="{ active: selectedTab == 2 }">
              <RevenueChart
                :summary="fees"
                chartType="All"
                pointWidth="30"
                v-if="fees"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="divider ma--y-2"></div>
    <div class="households-fees__table" v-if="feeGroups && feeGroups.length">
      <div class="table__heading">
        {{ selectedFeeType }}s
        <app-help id="8" position="right"/>
      </div>
      <div class="row table-sub__heading">
        <div class="column-8 button__group">
          <button
            class="btn"
            v-for="(item, index) in feeGroups"
            :class="{ 'btn-active': item.selected }"
            @click="
              item.selected = !item.selected;
              bindTable();
            "
            :key="index"
          >
            {{ item.text }}
          </button>
        </div>

        <div class="column-4">
          <div class="row text--align-right">
            <div class="column-5 ma--y-1">
              Total: {{ feesBillingPeriodData.length }}
            </div>
            <div class="column-5">
              <ExportComponent
                pageName="Households"
                :householdId="householdId"
                :feeType="feeType"
              />
            </div>
            <div class="column-2">
              <GearComponent pageName="Households" @applyGear="onApplyGear" />
            </div>
          </div>
        </div>
      </div>
      <div class="table table--bordered" style="overflow-x: auto">
        <table>
          <thead class="table__head">
            <tr>
              <th
                class="text--align-left"
                v-for="column of dataResponse.columns"
                :key="column.columnOrder"
              >
                <a href="#" class="text--align-left asc">
                  {{ column.columnLabel }}
                </a>
              </th>
            </tr>
          </thead>
          <tbody class="table__body">
            <tr v-for="item in dataResponse.rows" :key="item.items.columnOrder">
              <td
                class="text--align-left"
                v-for="column of dataResponse.columns"
                :key="column.columnOrder"
              >
                <span
                  v-if="
                    item.items.find((i) => i.columnName == column.columnName)
                      .type == 'percent'
                  "
                >
                  {{
                    item.items.find((i) => i.columnName == column.columnName)
                      .value | percentDisplay
                  }}
                </span>
                <span
                v-else-if="
                  item.items.find((i) => i.columnName == column.columnName)
                    .type == 'dateDisplay'
                "
              >
                {{
                  item.items.find((i) => i.columnName == column.columnName)
                    .value | dateDisplay
                }}
              </span>
                <span
                  v-else-if="
                    item.items.find((i) => i.columnName == column.columnName)
                      .type == 'currency'
                  "
                  :class="{
                    'text--color-red':
                      item.items.find((i) => i.columnName == column.columnName)
                        .value < 0,
                  }"
                >
                  {{
                    item.items.find((i) => i.columnName == column.columnName)
                      .value | currencyDisplay
                  }}
                </span>
                <span v-else>
                  {{
                    item.items.find((i) => i.columnName == column.columnName)
                      .value
                  }}
                </span>
              </td>
            </tr>
            <tr key="-no-data-row" v-if="!feesBillingPeriodData.length">
              <td colspan="100%" class="text--align-center">
                <div class="table__body--empty">
                  <span>Sorry, no fees for selected period.</span>
                  <img
                    src="../../assets/no-data.png"
                    alt="No Data"
                    width="150px"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject, Watch } from "vue-property-decorator";
import {
  DataTableCellModel,
  DataTableModel,
  DataTableRowModel,
  FeeReportModel,
  FeeType,
  HouseHoldDetailModel,
  UserPreferenceModel,
} from "@/model";
import { IHouseHoldService } from "@/service";
import AppHelp from "@/components/layout/AppHelp.vue";
import RevenueChart from "@/views/home/components/RevenueChart.vue";
import GearComponent from "@/components/controls/GearComponent.vue";
import ExportComponent from "@/components/controls/ExportComponent.vue";

@Component({
  components: { RevenueChart, AppHelp, GearComponent, ExportComponent },
})
export default class HouseHoldDetail extends Vue {
  @Inject("householdService") service: IHouseHoldService;

  public fees: HouseHoldDetailModel = null;
  public feesBillingPeriodData: Array<FeeReportModel> = [];
  public feeGroups: Array<FeeGroupInfo> = [];
  public selectedTab: number = 1;
  public dataResponse: DataTableModel = new DataTableModel();
  public feeTypeToggle: boolean = false;
  public selectedFeeType: string = "Client fee";
  private feeTypes: Array<string> = Object.keys(FeeType);
  public feeType: string;

  mounted() {
    this.getFeeDetails();
  }

  @Watch("$route", {})
  public getFeeDetails() {
    this.fees = null;

    this.feeType =
      FeeType[this.selectedFeeType.toString() as keyof typeof FeeType];

    this.service.getDetail(this.householdId, this.feeType).then((response) => {
      this.fees = response;

      this.feeGroups = Object.keys(this.fees.feesByBillingPeriod).map(
        (f) => new FeeGroupInfo(f)
      );
      if (this.feeGroups && this.feeGroups.length) {
        // Sorting by year and then by quarter.
        this.feeGroups.sort((oldGroup, newGroup) => {
          const compareYear = newGroup.year - oldGroup.year;
          const compareQuarter = newGroup.quarter.localeCompare(
            oldGroup.quarter
          );

          return compareYear || compareQuarter;
        });
        this.feeGroups[0].selected = true;
      }

      this.bindTable();
    });
  }
  bindTable() {
    this.feesBillingPeriodData = [];

    this.feeGroups.forEach((g) => {
      if (g.selected)
        this.feesBillingPeriodData.push(
          ...this.fees.feesByBillingPeriod[g.text]
        );
    });

    this.dataResponse.columns = [];
    this.dataResponse.rows = [];

    this.feesBillingPeriodData.forEach((a: any) => {
      let r = new DataTableRowModel();
      r.items = [];
      this.userPrefrence.forEach((b: any) => {
        let c = new DataTableCellModel();
        c.columnLabel = b.columnLabel;
        c.columnName = b.columnName;
        c.columnOrder = b.columnOrder;
        c.value = a[b.columnName];
        if (
          c.columnName == "feeReportAmount" ||
          c.columnName == "marketValue" ||
          c.columnName == "totalAUM" ||
          c.columnName == "cashAvailable" ||
          c.columnName == "priorFeeAmount" ||
          c.columnName == "priorFeeMarketValue"
        )
          c.type = "currency";
           else if(c.columnName.includes('Date'))
            c.type = "dateDisplay";
        else if (c.columnName == "annualRate") c.type = "percent";
        else c.type = " ";
        r.items.push(c);
      });
      this.dataResponse.rows.push(r);
    });

    this.userPrefrence.forEach((a: any) => {
      this.dataResponse.columns.push({
        columnName: a.columnName,
        columnLabel: a.columnLabel,
        columnOrder: a.columnOrder,
      });
    });

    const typeOrder = [
      "On-cycle",
      "Inception",
      "Deposit",
      "Withdrawal",
      "Adjustment",
      "Termination",
    ];
    this.feesBillingPeriodData.sort((oldData, newData) => {
      //Account Number ascending
      const compareAccountNumber = oldData.accountNumber.localeCompare(
        newData.accountNumber
      );

      //Event Date desc
      const compareEventDate =
        new Date(newData.eventDate).getTime() -
        new Date(oldData.eventDate).getTime();

      //Event type
      const compareType =
        typeOrder.indexOf(oldData.billingEvent) -
        typeOrder.indexOf(newData.billingEvent);

      return compareAccountNumber || compareEventDate || compareType;
    });
  }

  public updateFeeType(feeType: string) {
    if (this.selectedFeeType != feeType) {
      this.selectedFeeType = feeType;
      this.feeTypeToggle = false;
      this.getFeeDetails();
    }
  }

  public clickOutsideFeeType() {
    this.feeTypeToggle = false;
  }

  get householdId() {
    return +this.$route.params.id;
  }

  get calenderPeriod() {
    return this.fees && this.fees.reports && this.fees.reports.length > 0
      ? this.fees.reports[0].reportName
      : "";
  }

  onApplyGear() {
    this.getFeeDetails();
  }

  get userPrefrence(): Array<UserPreferenceModel> {
    return this.$store.getters.userPreferences.find(
      (a: any) => a.pageName == "Households"
    ).columns;
  }
}

class FeeGroupInfo {
  constructor(public text: string, public selected?: boolean) {}

  get quarter() {
    return this.text.split("-")[0];
  }

  get year() {
    return parseInt(this.text.split("-")[1]);
  }
}
</script>