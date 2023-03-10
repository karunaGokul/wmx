<template>
  <div class="pa--left-2" v-if="response">
    <div class="content__header">
      <router-link to="/" tag="a" class="content__header-back"
        >Back to overview</router-link
      >
      <div class="row no-gutters">
        <div class="column-4">
          <h1 class="content__header-title">Approve Billing</h1>
          <div class="pa-0">
            <button
              type="button"
              class="btn btn--secondary"
              @click="approve()"
              :disabled="!selectedApprovals.length"
            >
              Approve
            </button>
            <span class="ma--left-2" v-if="response.pageInfo.totalResults"
              >{{ selectedApprovals.length }} selected of
              {{ response.pageInfo.totalResults }}</span
            >
          </div>
        </div>
        <div class="column-8">
          <filter-component
            :data="filterData"
            :feeRequest="request"
            pageName="Approve Billing"
            @applyFilters="onApplyFilters($event)"
          >
            <template v-slot:info>
              <div class="pa-0" v-if="response.pageInfo.totalResults">
                <span
                  >Showing {{ approvals.length }} of
                  {{ response.pageInfo.totalResults }}</span
                >
              </div>
            </template>
          </filter-component>
        </div>
      </div>
    </div>
    <div
      class="table table--bordered"
      style="overflow-x: auto"
      v-if="dataResponse"
    >
      <table>
        <thead class="table__head">
          <tr>
            <th>
              <input
                type="checkbox"
                v-model="selectTotalAccounts"
                v-if="approvals.length"
              />
            </th>
            <th
              class="text--align-left"
              v-for="column of dataResponse.columns"
              :key="column.columnOrder"
            >
              <a
                href="#"
                :class="{
                  asc: request.ascending,
                  'table__head--sort': request.sortColumn == column.columnName,
                }"
                @click="sort(column.columnName)"
              >
                {{ column.columnLabel }}
              </a>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody class="table__body">
          <tr
            v-for="(item, rowIndex) in dataResponse.rows"
            :key="item.items.columnOrder"
            :style="{
              background: item.data.notificationFlag ? '#ffe6e6' : '',
            }"
          >
            <td>
              <input
                type="checkbox"
                v-model="selectedApprovals"
                :value="item.data"
              />
            </td>
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
            <td>
              <app-help
                :data="item.data.notificationMessage"
                :position="rowIndex < dataResponse.rows.length-3 ? 'left' : 'top'"
                v-if="item.data.notificationFlag"
              />
            </td>
          </tr>
          <tr v-if="!response.pageInfo.totalResults && !request._loading">
            <td colspan="7" class="text--align-center">
              <div class="table__body--empty">
                <span>Sorry, no fees were found requiring approval.</span>
                <img
                  src="../../assets/no-data.png"
                  alt="No Data"
                  width="150px"
                />
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot
          class="table__foot"
          v-if="
            request.page < response.pageInfo.totalPages && approvals.length != 0
          "
        >
          <tr class="table__foot--load">
            <td colspan="100%" @click="paginate()">Load More</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from "vue-property-decorator";
import {
  DataResponse,
  FeeRequestModel,
  FeeReportModel,
  SufficientFunds,
  FilterViewModel,
  FilterItemViewModel,
  ListItem,
  HouseHoldSearchModel,
  IListService,
  UserPreferenceModel,
  DataTableCellModel,
  DataTableRowModel,
  DataTableModel,
  notificationTypeModel,
  ChangesToData,
} from "@/model";

import { IApprovalService } from "@/service";
import { BaseComponent } from "@/components";
import FilterComponent from "@/components/controls/FilterComponent.vue";
import AppHelp from "@/components/layout/AppHelp.vue";
@Component({
  components: { FilterComponent, AppHelp },
})
export default class ApprovalLanding extends BaseComponent {
  @Inject("approvalService") service: IApprovalService;
  @Inject("householdService")
  householdSearch: IListService<HouseHoldSearchModel>;

  public approvals: Array<FeeReportModel> = [];
  public response: DataResponse<FeeReportModel> = new DataResponse();
  public dataResponse: DataTableModel = new DataTableModel();
  public request: FeeRequestModel = new FeeRequestModel();
  selectedApprovals: Array<FeeReportModel> = [];
  filterData: FilterViewModel = null;

  mounted() {
    this.filterData = this.getDefaultFilters();
    this.getApprovals(this.filterData);
  }

  getDefaultFilters() {
    let filterData = new FilterViewModel();
    filterData.title = "fees";
    filterData.width = 900;
    filterData.items = [];

    let item = new FilterItemViewModel("event", "checkboxlist", "Event", 1);
    item.items = [];

    Object.keys(this.$store.getters.settings.billingEvent).forEach(
      (k: string) => {
        item.items.push(
          new ListItem(this.$store.getters.settings.billingEvent[k], k)
        );
      }
    );

    filterData.items.push(item);

    item = new FilterItemViewModel("feeAmount", "amountrange", "Fee Amount", 1);
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "feeAmountVariance",
      "amountrange",
      "Fee Amount Variance",
      1
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "custodianCode",
      "checkboxlist",
      "Custodian",
      1
    );
    item.items = Object.entries(this.$store.getters.custodian).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("manager", "checkboxlist", "Manager", 1);
    item.items = Object.entries(this.$store.getters.manager).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("program", "checkboxlist", "Program", 1);
    item.items = Object.entries(this.$store.getters.program).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("household", "autocomplete", "Household", 1);
    let householdRequest = new HouseHoldSearchModel();
    householdRequest.type = "Household";
    item.request = householdRequest;
    item.service = this.householdSearch;
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "sufficientFunds",
      "radiolist",
      "Sufficient Funds",
      1
    );
    item.items = [];
    for (var d in SufficientFunds) {
      item.items.push(
        new ListItem(d, SufficientFunds[d as keyof typeof SufficientFunds])
      );
    }
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "annualizedFee",
      "amountrange",
      "Annualized Fee Rate",
      2
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("feeAum", "amountrange", "Fee AUM", 2);
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "feeAumVariance",
      "amountrange",
      "Fee AUM Variance",
      2
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "advisorCode",
      "autocomplete",
      "Rep Code",
      2
    );
    let selectedAdvisors = this.$store.getters.selectedAdvisor;
    if (selectedAdvisors)
      item.items = selectedAdvisors
        .split(",")
        .map((s: string) => new ListItem(s, s));
    else
      item.items = Object.entries(this.$store.getters.advisors.sort()).map(
        (e) => new ListItem(e[1].toString(), e[0])
      );

    filterData.items.push(item);

    item = new FilterItemViewModel("style", "autocomplete", "Style", 2);
    item.items = Object.entries(this.$store.getters.style).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("product", "checkboxlist", "Product", 2);
    item.items = Object.entries(this.$store.getters.product).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("accounts", "autocomplete", "Accounts", 2);
    let request = new HouseHoldSearchModel();
    request.type = "Account";
    item.request = request;
    item.service = this.householdSearch;
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "changesToData",
      "checkboxlist",
      "Changes to Data",
      2
    );
    item.items = [];
    for (var c in ChangesToData) {
      item.items.push(
        new ListItem(c, ChangesToData[c as keyof typeof ChangesToData])
      );
    }
    filterData.items.push(item);

    return filterData;
  }

  private paginate() {
    this.request.page += 1;
    this.getApprovals(this.filterData);
  }

  private sort(column: string) {
    this.request.ascending = !this.request.ascending;
    this.request.sortColumn = column;
    this.request.page = 1;
    this.getApprovals(this.filterData);
  }

  public getApprovals(filterData: FilterViewModel) {
    this.request.firmCode = this.$store.getters.selectedFirm;
    if (!this.request.sortColumn) this.request.sortColumn = "accountNumber";
    this.request.status = this.feeStatus;

    if (this.filterData) {
      let item = filterData.items.find((i) => i.id == "event");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.billingEvent = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "feeAmount");
      if (item)
        this.request.feeAmount =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;

      item = filterData.items.find((i) => i.id == "feeAmountVariance");
      if (item && item.data && item.data.amount > 0) {
        if (item.data.operator == "><")
          this.request.feeAmountVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: -item.data.amount,
          };
        else
          this.request.feeAmountVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: null,
          };
      } else {
        this.request.feeAmountVariance = null;
      }

      item = filterData.items.find((i) => i.id == "custodianCode");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.custodianCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "manager");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.managerCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "program");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.program = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "household");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.householdId = item.selectedItems.map((i) =>
          parseInt(i.value)
        );

      item = filterData.items.find((i) => i.id == "sufficientFunds");
      if (item && item.selectedItems && item.selectedItems.length)
        item.selectedItems.forEach((i) => {
          let notificationType = new notificationTypeModel();
          notificationType.comparator = i.value;
          if (i.text == "Yes") notificationType.isSufficientFund = true;
          else notificationType.isSufficientFund = false;
          notificationType.value = "INSUFFICIENT_FUND";
          this.request.notificationType.push(notificationType);
        });

      item = filterData.items.find((i) => i.id == "changesToData");
      if (item && item.selectedItems && item.selectedItems.length)
        item.selectedItems.forEach((i) => {
          let notificationType = new notificationTypeModel();
          notificationType.comparator = "Equals";
          notificationType.value = i.value;
          this.request.notificationType.push(notificationType);
        });

      item = filterData.items.find((i) => i.id == "annualizedFee");
      if (item)
        this.request.annualRate =
          item.data && item.data.amount > 0
            ? {
                range: item.data.operator,
                value: +(item.data.amount * 100).toFixed(4),
              }
            : null;

      item = filterData.items.find((i) => i.id == "feeAum");
      if (item)
        this.request.feeAum =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;

      item = filterData.items.find((i) => i.id == "feeAumVariance");
      if (item && item.data && item.data.amount > 0) {
        if (item.data.operator == "><")
          this.request.feeAumVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: -item.data.amount,
          };
        else
          this.request.feeAumVariance = {
            range: item.data.operator,
            value: item.data.amount,
            lowerBoundValue: null,
          };
      } else {
        this.request.feeAumVariance = null;
      }

      item = filterData.items.find((i) => i.id == "advisorCode");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.advisorCode = item.selectedItems.map((i) => i.text);

      item = filterData.items.find((i) => i.id == "style");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.styleCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "product");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.product = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "accounts");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.accountId = item.selectedItems.map((i) =>
          parseInt(i.value)
        );
    }

    this.request._loading = true;
    this.service.getItems(this.request).then((response) => {
      this.response = response;

      if (this.request.page == 1) this.approvals = [];
      this.approvals = this.approvals.concat(this.response.data);

      this.dataResponse.columns = [];
      this.dataResponse.rows = [];

      this.approvals.forEach((a: any) => {
        let r = new DataTableRowModel();
        r.data = a;
        if (
          r.data.notificationMessage &&
          r.data.notificationMessage.includes(",")
        )
          r.data.notificationMessage = `<ul><li>${r.data.notificationMessage.replaceAll(
            ",",
            "</li><li>"
          )}</ul>`;

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
          else if (c.columnName == "annualRate") c.type = "percent";
          else if (c.columnName.includes("Date")) c.type = "dateDisplay";
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

      this.request._loading = false;
    });
  }

  public onApplyFilters(value: FilterViewModel) {
    this.filterData = value
      ? this.$vuehelper.clone(value)
      : this.getDefaultFilters();

    this.request = new FeeRequestModel();
    this.request.page = 1;
    this.selectedApprovals = [];
    this.getApprovals(this.filterData);
  }

  public approve() {
    this.loader.showProgress();
    this.service.approve(this.selectedApprovals).then((response) => {
      this.alert(
        `Success! You approved ${this.selectedApprovals.length} fees.<br /> We'll take it from here.`,
        "Approval Confirmation",
        "success"
      );

      this.request.page = 1;
      this.selectedApprovals = [];
      this.getApprovals(this.filterData);

      this.$store.dispatch("loadNotification");
    });
  }

  get selectTotalAccounts() {
    return this.selectedApprovals.length > 0 &&
      this.approvals.length > 0 &&
      this.selectedApprovals.length == this.approvals.length
      ? true
      : false;
  }

  set selectTotalAccounts(value) {
    var selected: any[] = [];
    if (value)
      this.approvals.forEach((row) => {
        selected.push(row);
      });

    this.selectedApprovals = selected;
  }

  get feeStatus() {
    var status = [];
    if (!this.$route.query.status) status = ["PU"];
    else status.push(this.$route.query.status.toString());

    return status;
  }
  get userPrefrence(): Array<UserPreferenceModel> {
    return this.$store.getters.userPreferences.find(
      (a: any) => a.pageName == "Approve Billing"
    ).columns;
  }
}
</script> 
