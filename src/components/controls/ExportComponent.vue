<template>
  <div class="dropdown" v-click-outside="clickOutsideExport">
    <button class="btn--export" @click="onExport()">
      <div class="row no-gutters">
        <span class="column-1 pa--right-1">
          <img src="../../assets/excel-logo.png" alt="excel" width="13px" />
        </span>
        <span class="column-8"> Export </span>
        <i
          class="fas fa-angle-down border--left pa--x-1 column-1"
          style="justify-content: end"
        >
        </i>
      </div>
    </button>
    <ul class="dropdown-menu" :class="{ show: exportToggle }">
      <li
        class="dropdown-item ma--y-1 border--bottom"
        @click.stop.prevent="exportFile('All Columns')"
      >
        All Columns
      </li>
      <li
        class="dropdown-item"
        @click.stop.prevent="exportFile('Current Columns')"
      >
        Current Columns
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue } from "vue-property-decorator";
import moment from "moment";
import { BaseComponent } from "@/components";
import {
  FeeRequestModel,
  ExportRequestModel,
  PaymentExportRequestModel,
  PaymentRequestModel,
} from "@/model";
import { IPaymentAccountService, IUserService } from "@/service";

@Component
export default class ExportComponent extends BaseComponent {
  @Prop() pageName: string;
  @Prop() feeRequest: FeeRequestModel;
  @Prop() householdId: number;
  @Prop() feeType: string;
  @Prop() paymentRequest: PaymentRequestModel;
  @Inject("userService") userService: IUserService;
  @Inject("paymentService") paymentService: IPaymentAccountService;

  exportToggle: boolean = false;
  loading: boolean = false;
  exportRequest: ExportRequestModel = new ExportRequestModel();
  PaymentExportRequest: PaymentExportRequestModel =
    new PaymentExportRequestModel();

  public clickOutsideExport() {
    this.exportToggle = false;
  }

  public onExport() {
    if (this.pageName == "Payment Accounts") this.paymentExportFile();
    else this.exportToggle = !this.exportToggle;
  }

  public exportFile(option: string) {
    this.loader.showLoader();
    this.exportRequest.pageName = this.pageName;
    var format = "YYYYMMDD_hhmmss";
    format = moment().format(format);
    this.exportToggle = false;
    if (option == "All Columns") this.exportRequest.allColumns = true;
    else this.exportRequest.allColumns = false;
    if (this.pageName != "Households") {
      this.exportRequest.requestDTO = this.feeRequest;
      this.userService
        .exportFile(
          this.pageName.replace(" ", "") + "_" + format + ".xlsx",
          this.exportRequest
        )
        .then((response) => {
          this.loader.hide();
        });
    } else {
      this.exportRequest.requestDTO.feeTypeCode = this.feeType;
      this.exportRequest.requestDTO.householdId[0] = this.householdId;
      this.userService
        .householdExportFile(
          this.pageName.replace(" ", "") + "_" + format + ".xlsx",
          this.exportRequest
        )
        .then((response) => {
          this.loader.hide();
        });
    }
  }

  public paymentExportFile() {
    this.loader.showLoader();
    this.PaymentExportRequest.pageName = this.pageName;
    var format = "YYYYMMDD_hhmmss";
    format = moment().format(format);
    this.PaymentExportRequest.allColumns = true;
    this.PaymentExportRequest.requestDTO = this.paymentRequest;
    this.paymentService
      .exportFile(
        this.pageName.replace(" ", "") + "_" + format + ".xlsx",
        this.PaymentExportRequest
      )
      .then((response) => {
        this.loader.hide();
      });
  }
}
</script>

