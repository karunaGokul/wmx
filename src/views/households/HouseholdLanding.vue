<template>
  <div class="pa--left-2" v-if="response">
    <div class="row no-gutters content__header">
      <div class="column-3">
        <h1 class="content__header-title">Households</h1>
      </div>
      <div class="column-9">
        <filter-component
          :data="filterData"
          pageName="Households"
          @applyFilters="onApplyFilters($event)"
        >
          <template v-slot:info>
            <div
              class="pa-0 text--align-right"
              v-if="response.pageInfo.totalResults"
            >
              <span
                >Showing {{ households.length }} of
                {{ response.pageInfo.totalResults }}</span
              >
            </div>
          </template>
        </filter-component>
      </div>
    </div>

    <div class="table table--bordered">
      <table>
        <thead class="table__head">
          <tr>
            <th class="col-3">
              <a
                href="#"
                :class="{
                  asc: request.ascending,
                  'table__head--sort': request.sortColumn == 'householdName',
                }"
                @click="sort('householdName')"
              >
                HOUSEHOLD
              </a>
            </th>
            <th class="col-2">REP CODES</th>
            <th class="col-1-half">CUSTODIANS</th>
            <th class="col-1 text--align-right">SINCE</th>
            <th class="col-1 text--align-right">ACCOUNTS</th>
            <th class="col-1-half text--align-right">ASSETS</th>
          </tr>
        </thead>
        <tbody class="table__body">
          <template v-for="(item, index) in households">
            <tr
              :key="'main-' + index"
              :class="{ 'table__row--expanded': toggle[index] }"
            >
              <td @click="expandRow(index)">
                <div class="table__row-toggle-wrapper">
                  <span class="table__row-toggle"></span>
                  {{ item.householdName }}
                </div>
              </td>
              <td>
                {{ item.repCodes.join(", ") }}
              </td>
              <td>
                {{ item.custodians.join(", ") }}
              </td>
              <td class="text--align-right">
                {{ item.startDate | dateDisplay }}
              </td>
              <td class="text--align-right">
                {{ item.totalAccounts }}
              </td>
              <td class="text--align-right">
                {{ item.totalAssets | currencyDisplay }}
              </td>
            </tr>
            <tr :key="'detail-' + index" v-if="toggle[index]">
              <td colspan="6" class="pa-0">
                <div
                  class="table table--shaded table--condensed pa--x-2 pa--y-1"
                >
                  <table>
                    <thead>
                      <tr>
                        <th class="text--weight-bold">ACCOUNT</th>
                        <th class="text--weight-bold">PAYMENT METHOD</th>
                        <th class="text--weight-bold">BILL TO ACCOUNT</th>
                        <th class="text--weight-bold">INVOICE GROUP</th>
                        <th class="text--weight-bold">REP CODE</th>
                        <th class="text--weight-bold">CUSTODIAN</th>
                        <th class="text--weight-bold text--align-left">
                          FEE SCHEDULE
                        </th>
                        <th class="text--weight-bold text--align-right">
                          ASSETS
                        </th>
                        <th class="col-1 text--weight-bold text--align-right">
                          ASSETS %
                        </th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody class="table__body no-border">
                      <tr
                        v-for="(result, index) in item.accounts"
                        :key="index"
                        :class="{
                          'text--color-red': result.terminationDate,
                        }"
                        @mouseover="editEnable(index)"
                        @mouseleave="editDisable(index)"
                      >
                        <td>
                          {{ result.accountNumber }} - {{ result.accountName }}
                        </td>
                        <td>{{ result.repCode }}</td>
                        <td>{{ result.custodian }}</td>
                        <td>{{ result.feeScheduleCode }}</td>
                        <td>{{ result.repCode }}</td>
                        <td>{{ result.custodian }}</td>
                        <td class="text--align-left">
                          {{ result.feeScheduleCode }}
                        </td>
                        <td class="text--align-right">
                          {{ result.marketValue | currencyDisplay }}
                        </td>
                        <td class="text--align-right">
                          {{ result.assetsPercent | percentDisplay }}
                        </td>
                        <td class="text--align-right" v-if="toggleEdit[index]">
                          <span @click="edit = true" style="cursor: pointer">
                            <i class="fas fa-solid fa-pen"></i>
                          </span>
                          <div class="overlay" v-if="edit">
                            <div class="dialog" style="width: 500px">
                              <div class="dialog__header">
                                <div class="dialog__header--title">
                                  <h3>Edit Account</h3>
                                  <span class="pa--left-1">
                                    ({{ result.accountNumber }} -
                                    {{ result.accountName }})
                                  </span>
                                </div>
                                <span
                                  class="dialog__header--clear"
                                  @click.stop.prevent="edit = false"
                                >
                                  <i class="fas fa-times fa-lg"></i>
                                </span>
                              </div>
                              <div class="dialog__content text--align-left">
                                <div class="pa--y-2">Payment Method</div>
                                <select class="pa-1">
                                  <option
                                    v-for="(item, index) in paymentMethod"
                                    :key="index"
                                    :value="item"
                                  >
                                    {{ item }}
                                  </option>
                                </select>
                                <div class="pa--y-2">Payment Institution</div>
                                <select class="pa-1">
                                  <option
                                    v-for="(item, index) in paymentInstitutions"
                                    :key="index"
                                    :value="item"
                                  >
                                    {{ item }}
                                  </option>
                                </select>
                                <div class="pa--y-2">Bill To Account</div>
                                <div>
                                  <auto-complete
                                    :data="searchData"
                                    v-if="searchData"
                                    @onChanged="onSearchChange($event)"
                                  />
                                </div>

                                <div class="pa--y-2">Invoice Group</div>
                                <select class="pa-1">
                                  <!-- <option
                                    v-for="(item, index) in paymentMethod"
                                    :key="index"
                                    :value="item"
                                  >
                                    {{ item }}
                                  </option> -->
                                </select>
                              </div>
                              <div class="row dialog__footer pa--y-2">
                                <div class="column-5"></div>
                                <div class="column-7 display--flex">
                                  <button
                                    type="button"
                                    class="btn btn--outline"
                                    @click.stop.prevent="edit = false"
                                    style="border: solid 1px #989797"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    class="btn btn--primary"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot class="table__foot no-border">
                      <tr>
                        <td colspan="9" class="text--align-right">
                          <button
                            type="button"
                            class="btn btn--inline"
                            @click="showDetails(item.householdId)"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </td>
            </tr>
          </template>
          <template>
            <tr
              key="-no-data-row"
              v-if="!response.pageInfo.totalResults && !request._loading"
            >
              <td colspan="7" class="text--align-center">
                <div class="table__body--empty">
                  <span>Sorry, no fees were found requiring housholds.</span>
                  <img
                    src="../../assets/no-data.png"
                    alt="No Data"
                    width="150px"
                  />
                </div>
              </td>
            </tr>
          </template>
        </tbody>
        <tfoot
          class="table__foot"
          v-if="
            request.page < response.pageInfo.totalPages &&
            households.length != 0
          "
        >
          <tr class="table__foot--load">
            <td colspan="6" @click="paginate()">Load More</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from "vue-property-decorator";
import moment from "moment";

import {
  DataResponse,
  IListService,
  HouseHoldRequestModel,
  HouseHoldModel,
  HouseHoldSearchModel,
  ListItem,
  FilterViewModel,
  FilterItemViewModel,
  DateRangeModel,
} from "@/model";
import { IHouseHoldService, IPaymentAccountService } from "@/service";

import FilterComponent from "@/components/controls/FilterComponent.vue";
import AutoComplete, {
  AutoCompleteData,
} from "@/components/controls/AutoComplete.vue";

@Component({
  components: { FilterComponent, AutoComplete },
})
export default class HouseholdLanding extends Vue {
  @Inject("householdService") service: IHouseHoldService;
  @Inject("paymentService") paymentService: IPaymentAccountService;
  @Inject("householdService")
  householdSearch: IListService<HouseHoldSearchModel>;

  public households: Array<HouseHoldModel> = [];
  public response: DataResponse<HouseHoldModel> = new DataResponse();
  private request: HouseHoldRequestModel = new HouseHoldRequestModel();

  filterData: FilterViewModel = null;
  toggle: Array<boolean> = [];
  toggleEdit: Array<boolean> = [];
  edit: boolean = false;
  paymentMethod: Array<string> = ["DEBIT", "INVOICE"];
  public paymentInstitutions: Array<string> = [];
  public searchData: AutoCompleteData = null;

  mounted() {
    this.paymentService.getAllPaymentInstitutions().then((response) => {
      this.paymentInstitutions = response;
    });
    this.buildSearchData();
    this.filterData = this.getDefaultFilters();
    this.getHouseHoldList(this.filterData);
  }

  buildSearchData() {
    let request = new HouseHoldSearchModel();
    this.searchData = new AutoCompleteData();
    this.searchData.label = `Search Bill To Account`;
    this.searchData.ignoreEmptySearch = true;
    this.searchData.showLabel = true;
    this.searchData.request = request;
    this.searchData.service = this.householdSearch;
  }

  getDefaultFilters() {
    let filterData = new FilterViewModel();
    filterData.title = "households";
    filterData.width = 900;
    filterData.items = [];

    let item = new FilterItemViewModel(
      "marketValue",
      "amountrange",
      "Assets",
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

    item = new FilterItemViewModel("program", "checkboxlist", "Program", 1);
    item.items = Object.entries(this.$store.getters.program).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("manager", "checkboxlist", "Manager", 1);
    item.items = Object.entries(this.$store.getters.manager).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );

    filterData.items.push(item);

    item = new FilterItemViewModel(
      "billingFrequency",
      "checkboxlist",
      "Billing Frequency",
      1
    );
    item.items = Object.entries(this.$store.getters.billingFrequency).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "valuationMethod",
      "checkboxlist",
      "Billing Valuation Method",
      1
    );
    item.items = Object.entries(this.$store.getters.valuationMethod).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "billedSince",
      "dateselector",
      "Billed Since",
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

    item = new FilterItemViewModel("product", "checkboxlist", "Product", 2);
    item.items = Object.entries(this.$store.getters.product).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("style", "autocomplete", "Style", 2);
    item.items = Object.entries(this.$store.getters.style).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "billingMethod",
      "checkboxlist",
      "Forward/Arrears",
      2
    );
    item.items = Object.entries(this.$store.getters.billingMethod).map(
      (e) => new ListItem(e[1].toString(), e[0])
    );
    filterData.items.push(item);

    item = new FilterItemViewModel("accounts", "autocomplete", "Accounts", 2);
    let request = new HouseHoldSearchModel();
    request.type = "Account";
    item.request = request;
    item.service = this.householdSearch;
    filterData.items.push(item);

    return filterData;
  }

  private paginate() {
    this.request.page += 1;
    this.getHouseHoldList(this.filterData);
  }

  public onSearchChange(item: ListItem) {
    console.log(item);
  }

  private sort(column: string) {
    this.request.ascending = !this.request.ascending;
    this.request.sortColumn = column;

    this.request.page = 1;
    this.getHouseHoldList(this.filterData);
  }

  private getHouseHoldList(filterData: FilterViewModel) {
    this.request.firmCode = this.$store.getters.selectedFirm;
    if (!this.request.sortColumn) this.request.sortColumn = "householdName";

    if (filterData) {
      let item = filterData.items.find((i) => i.id == "marketValue");
      if (item)
        this.request.marketValue =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;

      item = filterData.items.find((i) => i.id == "custodianCode");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.custodianCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "program");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.program = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "manager");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.managerCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "billingFrequency");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.billingFrequency = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "valuationMethod");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.valuationMethod = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "billedSince");
      if (item && item.data && item.data.value)
        this.request.billingStartDate = new DateRangeModel(
          ">=",
          this.selectedBilledSinceFilter(item.data.value)
        );

      item = filterData.items.find((i) => i.id == "advisorCode");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.advisorCode = item.selectedItems.map((i) => i.text);

      item = filterData.items.find((i) => i.id == "product");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.product = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "style");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.styleCode = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "billingMethod");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.billingMethod = item.selectedItems.map((i) => i.value);

      item = filterData.items.find((i) => i.id == "accounts");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.accountId = item.selectedItems.map((i) =>
          parseInt(i.value)
        );
    }

    this.request._loading = true;
    this.service.getItems(this.request).then((response) => {
      this.response = response;
      if (this.request.page == 1) this.households = [];
      this.households = this.households.concat(this.response.data);

      this.toggle = [];

      this.request._loading = false;
    });
  }

  expandRow(index: number) {
    this.$set(this.toggle, index, !this.toggle[index]);

    // for (let i = 0; i < this.toggle.length; i++) {
    //   if (i != index) this.$set(this.toggle, i, false);
    // }
  }

  public onApplyFilters(value: FilterViewModel) {
    this.filterData = value
      ? this.$vuehelper.clone(value)
      : this.getDefaultFilters();

    this.request = new HouseHoldRequestModel();
    this.request.page = 1;
    this.getHouseHoldList(this.filterData);
  }

  public showDetails(householdId: number) {
    this.$router.push({ path: `/households/${householdId}` });
  }

  public selectedBilledSinceFilter(selectedDate: any) {
    var date = selectedDate;
    if (!date) return (date = "");

    date = moment(date).format("YYYY-MM-DD");
    return date;
  }
  public editEnable(index: number) {
    this.$set(this.toggleEdit, index, true);
  }
  public editDisable(index: number) {
    this.$set(this.toggleEdit, index, false);
  }
}
</script>