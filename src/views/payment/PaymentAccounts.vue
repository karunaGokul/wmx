<template>
  <div class="pa--left-2">
    <div class="content__header">
      <router-link to="/" tag="a" class="content__header-back">
        Back to overview
      </router-link>
      <div class="row no-gutters">
        <div class="column-4">
          <h1 class="content__header-title">Payment Accounts</h1>
        </div>
        <div class="column-8">
          <filter-component
            :data="filterData"
            :paymentRequest="request"
            pageName="Payment Accounts"
            @applyFilters="onApplyFilters($event)"
            @save="onsave($event)"
          >
            <template v-slot:info>
              <div class="pa-0" v-if="response.pageInfo.totalResults">
                <span
                  >Showing {{ payments.length }} of
                  {{ response.pageInfo.totalResults }}</span
                >
              </div>
            </template>
          </filter-component>
        </div>
      </div>
    </div>
    <div class="table table--bordered">
      <table>
        <thead class="table__head">
          <tr>
            <th
              class="text--align-left"
              v-for="(column, index) in columns"
              :key="index"
            >
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody class="table__body">
          <tr v-for="(item, index) in payments" :key="index">
            <td>{{ item.billToAccountNumber }}</td>
            <td>{{ item.paymentInstitution }}</td>
            <td>{{ item.totalFee | currencyDisplay }}</td>
            <td>{{ item.cashAvailable | currencyDisplay }}</td>
            <td>
              {{ item.balance| currencyDisplay }}
            </td>
            <td class="pa--x-4">
              <input
                type="checkbox"
                v-model="item.manualFlag"
                :value="item.manualFlag"
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
            request.page < response.pageInfo.totalPages && payments.length != 0
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
import { BaseComponent } from "@/components";
import FilterComponent from "@/components/controls/FilterComponent.vue";
import {
  DataRequest,
  DataResponse,
  FilterItemViewModel,
  FilterViewModel,
  IListService,
  ListItem,
  notificationTypeModel,
  PaymentReportModel,
  PaymentRequestModel,
  SufficientFunds,
} from "@/model";
import { IPaymentAccountService } from "@/service";
@Component({
  components: { FilterComponent },
})
export default class PaymentAccounts extends BaseComponent {
  @Inject("paymentService") service: IPaymentAccountService;
  @Inject("paymentService")
  billToAccountSearch: IListService<DataRequest>;

  filterData: FilterViewModel = null;
  public request: PaymentRequestModel = new PaymentRequestModel();
  public response: DataResponse<PaymentReportModel> = new DataResponse();
  public payments: Array<PaymentReportModel> = [];
  public paymentInstitutions: Array<string> = [];
  
  columns: any = [
    "BILL-TO ACCOUNT",
    "PAYMENT INSTITUTION",
    "TOTAL FEE",
    "AVAILABLE FUNDS",
    "BALANCE",
    "MANUAL FLAG",
  ];

  mounted() {
    this.service.getAllPaymentInstitutions().then((response) => {
      this.paymentInstitutions = response;
      this.filterData = this.getDefaultFilters();
      this.getPayments(this.filterData);
    });
  }

  getDefaultFilters() {
    let filterData = new FilterViewModel();
    filterData.title = "payment";
    filterData.width = 900;
    filterData.items = [];

    let item = new FilterItemViewModel(
      "paymentInstitution",
      "checkboxlist",
      "Payment Institution",
      1
    );
    item.items = [];
    this.paymentInstitutions.forEach((e: any) =>
      item.items.push(new ListItem(e))
    );
    filterData.items.push(item);

    item = new FilterItemViewModel(
      "cashAvailable",
      "amountrange",
      "Available Funds",
      1
    );
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
      "billToAccount",
      "autocomplete",
      "Bill To Account",
      2
    );
    let request = new DataRequest();
    item.request = request;
    item.service = this.billToAccountSearch;
    filterData.items.push(item);

    item = new FilterItemViewModel("totalFee", "amountrange", "Total Fee", 2);
    filterData.items.push(item);

    return filterData;
  }

  private paginate() {
    this.request.page += 1;
    this.getPayments(this.filterData);
  }

  public getPayments(filterData: FilterViewModel) {
    this.request.firmCode = this.$store.getters.selectedFirm;

    if (this.filterData) {
      let item = filterData.items.find((i) => i.id == "paymentInstitution");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.paymentInstitution = item.selectedItems.map(
          (i) => i.value
        );

      item = filterData.items.find((i) => i.id == "cashAvailable");
      if (item)
        this.request.cashAvailable =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;

      item = filterData.items.find((i) => i.id == "sufficientFunds");
      if (item && item.selectedItems && item.selectedItems.length)
        item.selectedItems.forEach((i) => {
          let notificationType = new notificationTypeModel();
          notificationType.comparator = i.value;
          notificationType.value = "INSUFFICIENT_FUND";
          this.request.notificationType.push(notificationType);
        });
        // else  this.request.notificationType=null;

      item = filterData.items.find((i) => i.id == "billToAccount");
      if (item && item.selectedItems && item.selectedItems.length)
        this.request.billToAccountNumber = item.selectedItems.map(
          (i) => i.value
        );

      item = filterData.items.find((i) => i.id == "totalFee");
      if (item)
        this.request.totalFee =
          item.data && item.data.amount > 0
            ? { range: item.data.operator, value: item.data.amount }
            : null;
    }

    this.request._loading = true;
    this.service.getItems(this.request).then((response) => {
      this.response = response;

      if (this.request.page == 1) this.payments = [];
      this.payments = this.payments.concat(this.response.data);
      this.request._loading = false;
    });
  }

  public onApplyFilters(value: FilterViewModel) {
    this.filterData = value
      ? this.$vuehelper.clone(value)
      : this.getDefaultFilters();

    this.request = new PaymentRequestModel();
    this.request.page = 1;   
    this.getPayments(this.filterData);
  }
  public onsave() {
    console.log("save");
  }
}
</script>

