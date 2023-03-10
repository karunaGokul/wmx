<template>
  <div class="pa--top-2">
    <div class="row no-gutters content__header">
      <div class="column-4">
        <h1 class="content__header-title">Upload Billing</h1>
        <div class="pa-0" v-if="!configError">
          <button
            type="button"
            @click="uploadSelectedRows"
            class="btn btn--secondary"
            :disabled="
              !selectedRows.length ||
              completedRows.length === rows.length
            "
          >
            Submit
          </button>
          <span class="ma--left-2" v-if="validRows.length > 0 && tabValue && completedRows.length != rows.length">
            {{ selectedRows.length }} selected of {{ validRows.length }}
          </span>
          <span class="ma--left-2" v-else-if="rows.length > 0 && !tabValue && completedRows.length != rows.length">
            {{ selectedRows.length }} selected of {{ rows.length }}
          </span>
        </div>
      </div>
      <div class="column-5">
        <div class="tab ma--bottom-2 justify-content--center" v-if="!loading">
          <a
            href="#"
            class="text--align-right ma--right-1"
            @click="tabClicked('Accounts')"
          >
            <span
              :class="{
                'border-bottom__bold text--weight-bold': tabValue == true,
              }"
            >
              Accounts
            </span>
          </a>
          <a href="#" class="text--align-left" @click="tabClicked('Asserts')">
            <span
              :class="{
                'border-bottom__bold text--weight-bold': tabValue == false,
              }"
            >
              Assets
            </span>
          </a>
        </div>
        <div class="upload-container" v-if="rows.length > 0">
          <div>
            <div
              class="text--align-center"
              @click="$refs.fileUpload.click()"
              @drop.prevent="dragFile($event)"
              @dragover.prevent
            >
              <input
                hidden
                type="file"
                ref="fileUpload"
                @change="uploadFile($event)"
              />
              <i class="fas fa-cloud-upload-alt upload__icon"> </i>
              <p class="pa-1">
                <span class="text--weight-bold">
                  Choose an <span v-if="tabValue"> Accounts </span>
                  <span v-else> Assets </span> file
                </span>
                or drag it here.
              </p>
            </div>
            <p class="pa-1">
              Need a starter file template?
              <a
                class="text--weight-bold"
                :href="templateAccountsUrl"
                download="UploadBilling_Accounts_Template.txt"
                v-if="tabValue == true"
              >
                Click here
              </a>
              <a
                class="text--weight-bold"
                :href="templateAssetsUrl"
                download="UploadBilling_Assets_Template.txt"
                v-else-if="tabValue == false"
              >
                Click here
              </a>
            </p>
          </div>
        </div>
      </div>
      <div class="column-3">
        <div class="pa-1" v-if="accountsFile && tabValue">
          <ul class="upload__info">
            <li><label>File name: </label>{{ accountsFile.name }}</li>
            <li><label>Records loaded: </label>{{ accountsFile.rows }}</li>
          </ul>
        </div>
        <div class="pa-1" v-else-if="assetsFile && !tabValue">
          <ul class="upload__info">
            <li><label>File name: </label>{{ assetsFile.name }}</li>
            <li><label>Records loaded: </label>{{ assetsFile.rows }}</li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="configError">
      Configuration for program/product parameter is missing
    </div>
    <div class="table table--bordered table--editable" v-else>
      <table>
        <thead class="table__head">
          <tr>
            <th>
              <div class="table__selector">
                <input
                  type="checkbox"
                  @click="selectAll($event.target.checked)"
                  v-if="validRows.length"
                  v-model="allSelected"
                />
              </div>
            </th>
            <th
              v-for="(col, index) in columns"
              :key="index"
              :class="{ 'text--align-right': col.align == 'right' }"
            >
              <span v-if="col.title === 'FLOW BASIS'">
                {{ col.title }} <app-help id="9" position="left" />
              </span>
              <span v-else> {{ col.title }}</span>
            </th>
          </tr>
        </thead>
        <tbody class="table__body">
          <tr>
            <td colspan="20">
              <a @click="addNewRow" class="fas fa-plus"></a>
            </td>
          </tr>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowIndex"
            class="table__row"
            :class="{ 'table__row--new': row.status == 'new' }"
          >
            <td class="pa--left-1">
              <div class="table__selector">
                <a
                  v-if="row.status == 'new'"
                  class="fas fa-trash-alt"
                  @click="removeRow(rowIndex)"
                ></a>
                <i
                  class="fas fa-check text--color-green"
                  v-else-if="row.status == 'completed'"
                ></i>
                <input
                  v-else
                  type="checkbox"
                  v-model="row.selected"
                  :disabled="!row.valid"
                />
              </div>
            </td>
            <td
              v-for="(col, colIndex) in row.columns"
              :key="rowIndex + '-' + colIndex"
              :class="{ 'text--align-right': col.align == 'right' }"
            >
              <div
                :class="{
                  'table__cell--error': !col.valid && row.status != 'new',
                  'table__cell--error-duplicate': col.duplicate,
                  'table__cell-value': tabValue,
                  'table__cell--value-big': !tabValue,
                  'tooltip--left': colIndex > 1,
                  'tooltip--right': colIndex <= 1,
                }"
                :data-tooltip="col.error"
              >
                <div
                  v-if="row.status == 'new' || col.edit"
                  class="table__cell-control"
                >
                  <select
                    v-if="getType(row, col) == 'select'"
                    v-model="col.value"
                    @change="stopEdit(rowIndex, colIndex)"
                    @blur="onSelectOut(rowIndex, colIndex)"
                    ref="editBox"
                  >
                    <option
                      v-for="(item, index) in col.options"
                      :key="index"
                      :value="item"
                    >
                      {{ item }}
                    </option>
                  </select>
                  <date-selector
                    v-else-if="getType(row, col) == 'dateselector'"
                    :data="{
                      value: col.value ? new Date(col.value) : null,
                      clearable: true,
                    }"
                    @onChanged="onDateChange(rowIndex, colIndex, col, $event)"
                    @onClose="stopEdit(rowIndex, colIndex)"
                    ref="editBox"
                  />
                  <input
                    v-else-if="getType(row, col) == 'number'"
                    type="text"
                    v-model="col.value"
                    @blur="stopEdit(rowIndex, colIndex)"
                    ref="editBox"
                  />
                  <input
                    v-else
                    type="text"
                    v-model="col.value"
                    @blur="stopEdit(rowIndex, colIndex)"
                    ref="editBox"
                  />
                </div>
                <div
                  v-else
                  :class="{
                    'tooltip--left': colIndex > 1,
                    'tooltip--right': colIndex <= 1,
                  }"
                  :data-tooltip="getValue(row, col)"
                >
                  <div
                    class="table__cell-label"
                    @click="startEdit(rowIndex, colIndex)"
                  >
                    {{ getValue(row, col) }}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot class="table__foot">
          <tr v-if="rows.length <= 0">
            <td colspan="20">
              <div class="upload-container ma--top-6">
                <div
                  class="text--align-center"
                  @drop.prevent="dragFile($event)"
                  @dragover.prevent
                >
                  <div @click="$refs.fileUpload.click()">
                    <input
                      hidden
                      type="file"
                      ref="fileUpload"
                      @change="uploadFile($event, 'inputFile')"
                    />
                    <i class="fas fa-cloud-upload-alt upload__icon--large"> </i>
                    <p class="pa-3">
                      <span class="text--weight-bold">Choose a file</span> or
                      drag it here.
                    </p>
                  </div>
                  <p class="pa-1">
                    Need a starter file template?
                    <a
                      class="text--weight-bold"
                      :href="templateAccountsUrl"
                      download="UploadBilling_Accounts_Template.txt"
                      v-if="tabValue == true"
                    >
                      Click here
                    </a>
                    <a
                      class="text--weight-bold"
                      :href="templateAssetsUrl"
                      download="UploadBilling_Assets_Template.txt"
                      v-else-if="tabValue == false"
                    >
                      Click here
                    </a>
                  </p>
                </div>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
    <CustomAlert
      :alertDetail="alertDetail"
      alertTitle="Confirmation"
      v-if="alertToggle"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue, Inject } from "vue-property-decorator";
import moment from "moment";

import { BaseComponent } from "@/components";
import { IUploadBillingService, IUserService } from "@/service";

import {
  TableColumnModel,
  TableRowModel,
  UploadFileInfo,
  UploadBillingAccountModel,
  UploadBillingAssetsModel,
} from "@/model";
import DateSelector from "@/components/controls/DateSelector.vue";
import AppHelp from "@/components/layout/AppHelp.vue";
import CustomAlert from "@/components/controls/CustomAlert.vue";

@Component({
  components: { DateSelector, AppHelp, CustomAlert },
})
export default class UploadBilling extends BaseComponent {
  @Inject("userService") userService: IUserService;
  @Inject("uploadBillingService") uploadBillingService: IUploadBillingService;

  templateAccountsUrl: string = require("../../assets/UploadBilling_Accounts_Template.txt");
  templateAssetsUrl: string = require("../../assets/UploadBilling_Assets_Template.txt");
  response: any;
  rows: Array<TableRowModel> = [];
  responseRows: Array<TableRowModel> = [];
  columns: Array<TableColumnModel> = [];
  accountsFile: UploadFileInfo = null;
  assetsFile: UploadFileInfo = null;

  custodians: Array<string> = [];
  feeSchedules: Array<string> = [];
  configError: boolean = false;
  tabValue: boolean = true;
  loading: boolean = true;

  alertDetail: any;
  alertToggle: boolean = false;
  created() {
    this.userService.getFeeScheduleCode(this.$store.getters.selectedFirm).then(
      (response) => {
        this.feeSchedules = response.map((r) => r.feeScheduleCode);

        this.buildCustodians();
      },
      (error) => {
        this.configError = true;
        console.log(error);
      }
    );

    let accountsFileInfo = sessionStorage.getItem(
      "wmx-upload-billing-file-info-accounts"
    );
    let assetsFileInfo = sessionStorage.getItem(
      "wmx-upload-billing-file-info-assets"
    );
    if (accountsFileInfo) this.accountsFile = JSON.parse(accountsFileInfo);
    if (assetsFileInfo) this.assetsFile = JSON.parse(assetsFileInfo);
  }

  buildCustodians() {
    this.userService.getCustodians("CU").then((response) => {
      this.custodians = response.map((r) => r.code);
      this.buildColumns();
      this.buildRows();
    });
  }

  buildRows() {
    this.loading = true;
    this.uploadBillingService.getDefault().then((response) => {
      if (response && response.length) {
        this.response = response;
        response.forEach((r) => {
          this.rows.push(this.getRow(r));
        });

        this.responseRows = JSON.parse(JSON.stringify(this.rows));
        this.loading = false;
      }
    });
  }

  buildAssetRows() {
    if (this.response && this.response.length) {
      this.response.forEach((r: any) => {
        this.rows.push(this.getRow(r));
      });
    }
  }

  buildColumns() {
    if (this.tabValue == true) {
      let column = new TableColumnModel();
      column.title = "ACCOUNT #";
      column.fieldName = "accountNumber";
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "TITLE";
      column.fieldName = "accountName";
      column.required = () => {
        return false;
      };
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "HOUSEHOLD";
      column.fieldName = "householdNumber";
      column.required = () => {
        return false;
      };
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "INCEPTION DATE";
      column.fieldName = "startDate";
      column.type = "dateselector";
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "TERMINATION DATE";
      column.fieldName = "endDate";
      column.type = "dateselector";
      column.required = () => {
        return false;
      };
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "REP CODE";
      column.fieldName = "advisorCode";
      column.type = "select";
      column.options = this.$store.getters.advisors.sort();
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "CUSTODIAN";
      column.fieldName = "custodianCode";
      column.type = "select";
      column.options = this.custodians;
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "PAY BY";
      column.fieldName = "paymentMethod";
      column.type = "select";
      column.options = ["DEBIT", "INVOICE"];
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "DEBIT ACC";
      column.fieldName = "billToAccount";
      column.required = (row: TableRowModel) => {
        if (row && row.columns) {
          let payBy = row.columns.find((c) => c.fieldName == "paymentMethod");

          return payBy.value && payBy.value.toLowerCase() == "debit";
        }

        return true;
      };
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "RATE TYPE";
      column.fieldName = "feeScheduleRateType";
      column.type = "select";
      column.options = ["Flat Amount", "Flat Rate", "Tiered"];
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "FEE RATE";
      column.fieldName = "feeScheduleRate";
      column.align = "right";
      column.type = "custom";
      column.options = this.feeSchedules;
      this.columns.push(column);
    } else {
      let column = new TableColumnModel();
      column.title = "ACCOUNT #";
      column.fieldName = "accountNumber";
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "CUSTODIAN";
      column.fieldName = "custodianCode";
      column.type = "select";
      column.options = this.custodians;
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "ASSET TYPE";
      column.fieldName = "assetType";
      column.type = "select";
      column.options = ["Market Value", "Contribution", "Withdrawal"];
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "ACTIVITY DATE ";
      column.fieldName = "assetDate";
      column.type = "dateselector";
      column.required = (row: TableRowModel) => {
        if (row && row.columns) {
          let assetType = row.columns.find((c) => c.fieldName == "assetType");
          return assetType.value;
        }
        return true;
      };
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "BILL ASSETS";
      column.fieldName = "asset";
      column.required = (row: TableRowModel) => {
        if (row && row.columns) {
          let assetType = row.columns.find((c) => c.fieldName == "assetType");
          return assetType.value;
        }
        return true;
      };
      this.columns.push(column);

      column = new TableColumnModel();
      column.title = "FLOW BASIS";
      column.fieldName = "flowBasis";
      column.required = (row: TableRowModel) => {
        if (row && row.columns) {
          let assetType = row.columns.find((c) => c.fieldName == "assetType");
          return (
            assetType.value &&
            (assetType.value == "Contribution" ||
              assetType.value == "Withdrawal")
          );
        }
        return true;
      };
      this.columns.push(column);
      this.buildAssetRows();
    }
  }

  validate(record: TableRowModel, rowIndex: number) {
    record.columns.forEach((c) => {
      c.valid = c.value || !c.required(record);

      c.error = undefined;
      if (!c.valid) c.error = "Missing value";
    });

    record.valid = !record.columns.some((c) => !c.valid);

    if (record.valid) {
      let request: any = {};
      record.columns.forEach((c) => {
        if (c.value) request[c.fieldName] = c.value;
      });
      if (this.tabValue)
        this.uploadBillingService.validate(request).then((response) => {
          this.handleValidateResponse(response, rowIndex);
        });
      else
        this.uploadBillingService.validateAssets(request).then((response) => {
          this.handleValidateResponse(response, rowIndex);
        });
    }else{
      record.selected=false;
    }
  }

  handleValidateResponse(r: any, rowIndex: number) {
    let row = this.getRow(r);       
    let duplicate: number;
    let currentRowCondition: any = null;
    let iterateRowCondition: any = null;

    if (this.tabValue) {
      currentRowCondition = row.columns.filter(
        (c) => c.fieldName == "custodianCode" || c.fieldName == "accountNumber"
      );
    } else {
      currentRowCondition = row.columns.filter(
        (c) =>
          c.fieldName == "custodianCode" ||
          c.fieldName == "accountNumber" ||
          c.fieldName == "assetDate" ||
          c.fieldName == "assetType"
      );
    }
    this.rows.forEach((value: TableRowModel, index: number) => {
      duplicate = 0;

      if (this.tabValue) {
        iterateRowCondition = value.columns.filter(
          (d) =>
            d.fieldName == "custodianCode" || d.fieldName == "accountNumber"
        );
      } else {
        iterateRowCondition = value.columns.filter(
          (d) =>
            d.fieldName == "custodianCode" ||
            d.fieldName == "accountNumber" ||
            d.fieldName == "assetDate" ||
            d.fieldName == "assetType"
        );
      }

      iterateRowCondition.forEach((i: any) => {
        i.valid = true;
        i.duplicate = false;
        i.error = null;
      });
      value.valid=true;
      value.columns.forEach((i) => {
        if (i.error != undefined || i.error !=null||(i.required(value) && !i.value)) value.valid=false;        
      });
      if(value.valid&& !this.tabValue) value.selected=true;

      if (rowIndex != index) {
        currentRowCondition.forEach((e: any) => {
          let columnValue = iterateRowCondition.find(
            (b: any) => b.fieldName == e.fieldName
          );
          if (
            e.value &&
            columnValue.value &&
            e.value.toLowerCase() == columnValue.value.toLowerCase()
          )
            duplicate++;
        });
      }
      if (duplicate == currentRowCondition.length) {
        currentRowCondition.forEach((i: any) => {
          i.valid = false;
          i.duplicate = true;
          i.error = "Duplicate Account";
        });
        iterateRowCondition.forEach((j: any) => {
          j.valid = false;
          j.duplicate = true;
          j.error = "Duplicate Account";
        });
        value.valid = row.valid = false;
        if(!this.tabValue)row.selected= value.selected=false;
      }
    });

    this.$set(this.rows, rowIndex, row);

    this.updateSessionStore();
  }

  startEdit(rowIndex: number, colIndex: number) {
    if (this.rows[rowIndex].status != "completed") {
      this.rows[rowIndex].columns[colIndex].edit = true;

      this.$set(
        this.rows[rowIndex].columns,
        colIndex,
        this.rows[rowIndex].columns[colIndex]
      );

      setTimeout(() => {
        let boxes: any = this.$refs.editBox;
        if (boxes && boxes.length) boxes[0].focus();
      }, 100);
    }
  }

  stopEdit(rowIndex: number, colIndex: number) {
    this.rows[rowIndex].columns[colIndex].edit = false;

    this.validate(this.rows[rowIndex], rowIndex);

    if (!this.rows[rowIndex].valid) {
      this.$set(
        this.rows[rowIndex].columns,
        colIndex,
        this.rows[rowIndex].columns[colIndex]
      );

      this.updateSessionStore();
    }
  }

  onSelectOut(rowIndex: number, colIndex: number) {
    this.rows[rowIndex].columns[colIndex].edit = false;

    this.$set(
      this.rows[rowIndex].columns,
      colIndex,
      this.rows[rowIndex].columns[colIndex]
    );
  }

  onDateChange(
    rowIndex: number,
    colIndex: number,
    column: TableColumnModel,
    data: any
  ) {
    if (moment.isDate(data.value))
      column.value = moment(data.value).format("MM-DD-YYYY");
    else column.value = "";

    this.stopEdit(rowIndex, colIndex);
  }

  public uploadFile(e: any) {
    this._uploadFile(e.target.files[0]);

    e.target.value = null;
  }

  public dragFile(e: any) {
    this._uploadFile(e.dataTransfer.files[0]);
  }

  private _uploadFile(file: File) {
    if (!file) return;
    if (this.tabValue)
      this.uploadBillingService
        .uploadFile(file)
        .then((response: Array<UploadBillingAccountModel>) => {
          this.uploadResponse(file, response);
        });
    else
      this.uploadBillingService
        .uploadAssetsFile(file)
        .then((response: Array<UploadBillingAssetsModel>) => {
          this.uploadResponse(file, response);
        });
  }

  uploadResponse(file: File, uploadResponse: any) {
    if (this.rows.length) {
      this.confirm(
        `Upload Billing`,
        `<p>Uploading this file will clear any existing records that have not yet been submitted.</p>`,
        "Proceed",
        "Cancel"
      ).then((confirm: boolean) => {
        if (confirm) {
          this.rows = [];
          this.handleUploadResponse(file, uploadResponse);
        }
      });
    } else {
      this.handleUploadResponse(file, uploadResponse);
    }
  }

  handleUploadResponse(file: File, response: Array<any>) {
    response.forEach((r) => {
      this.rows.push(this.getRow(r));
    });
    this.updateSessionStore();

    if (this.tabValue) {
      this.accountsFile = new UploadFileInfo();
      this.accountsFile.uploadedTime = new Date();
      this.accountsFile.name = file.name;
      this.accountsFile.rows = response.length;
    } else {
      this.assetsFile = new UploadFileInfo();
      this.assetsFile.uploadedTime = new Date();
      this.assetsFile.name = file.name;
      this.assetsFile.rows = response.length;
    }

    sessionStorage.setItem(
      "wmx-upload-billing-file-info-accounts",
      JSON.stringify(this.accountsFile)
    );
    sessionStorage.setItem(
      "wmx-upload-billing-file-info-assets",
      JSON.stringify(this.assetsFile)
    );
  }

  updateSessionStore() {
    //sessionStorage.setItem("wmx-upload-billing", JSON.stringify(this.rows));
  }

  addNewRow() {
    this.rows.unshift(this.getRow(null));

    this.updateSessionStore();
  }

  removeRow(rowIndex: number) {
    this.rows.splice(rowIndex, 1);
    this.updateSessionStore();
  }

  getRow(data: any) {
    let record = new TableRowModel();
    record.status = data ? "active" : "new";
    record.columns = [];
    this.columns.forEach((c) => {
      let column = new TableColumnModel();
      Object.assign(column, c);

      if (data) {
        column.value = data[column.fieldName];
        if (!this.tabValue && !column.value) column.edit = true;
        if (column.value && column.type == "dateselector")
          column.value = moment(column.value).format("MM-DD-YYYY");

        if (data.errors) column.error = data.errors[column.fieldName];

        column.valid = true;
        if (column.required(record) && !column.value) column.valid = false;

        if (column.error != undefined) column.valid = false;
      }

      record.columns.push(column);
    });

    record.valid = !record.columns.some((c) => !c.valid);
    if (record.valid && !this.tabValue) record.selected = true;

    return record;
  }

  selectAll(checked: boolean) {
    this.rows.forEach((r, index) => {
      if (r.valid) {
        r.selected = checked;
        this.$set(this.rows, index, r);
      }
    });
  }

  uploadSelectedRows() {
    let request: Array<any> = [];

    this.selectedRows.forEach((r) => {
      let item: any = {};
      r.columns.forEach((c) => {
        item[c.fieldName] = c.value;
      });

      request.push(item);
    });
    if (this.tabValue)
      this.uploadBillingService.submit(request).then((response) => {
        this.handleSubmitResponse(response, "accounts");
      });
    else
      this.uploadBillingService.submitAssets(request).then((response) => {
        this.handleSubmitResponse(response, "assets");
      });
  }

  handleSubmitResponse(response: any, tabName: string) {
    this.rows = [];
    response.forEach((r: any) => {
      this.rows.push(this.getRow(r));
      let row = this.rows.find(
        (i) =>
          i.columns
            .find((c) => c.fieldName == "accountNumber")
            .value.toLowerCase() == r.accountNumber.toLowerCase()
      );
    });

    let successValue = 0;
    let errorValue = 0;
    this.rows.forEach((r: any) => {
      if (r.valid) {
        successValue++;
        r.status = "completed";
        r.selected = false;
      } else errorValue++;
    });

   if (successValue > 0 && errorValue > 0) {
        this.alertDetail = [
        {
          text: `Success! You submitted ${successValue} ${tabName.substring(0,tabName.length - 1)}(s).<br /> 
                    We'll take it from here.`,
          type: "success",
        },
        {
          text: `Error! There was an error submitting ${errorValue} ${tabName.substring(0,tabName.length - 1)}(s).<br />
          Please close this window to review the error(s).`,
          type: "error",
        },
      ];
      this.alertToggle = true;
    } 
    else if (successValue > 0)
      this.alert(
        `Success! You submitted ${successValue} ${tabName.substring(0,tabName.length - 1)}(s).<br /> 
        We'll take it from here.`,
        "Confirmation",
        "success"
      );
    else if (errorValue > 0)    
      this.alert(
        `Error! There was an error submitting ${errorValue} ${tabName.substring(0,tabName.length - 1)}(s).<br />
          Please close this window to review the error(s).`,
        "Confirmation",
        "error"
      );

    this.updateSessionStore();
  }

  getType(row: TableRowModel, col: TableColumnModel) {
    if (col.type == "custom") {
      let rateType = row.columns.find(
        (c) => c.fieldName == "feeScheduleRateType"
      );
      if (
        rateType &&
        rateType.value &&
        rateType.value.toLowerCase() == "tiered"
      )
        return "select";
      else return "number";
    }

    return col.type;
  }

  getValue(row: TableRowModel, col: TableColumnModel) {
    if (col.type == "number")
      return col.value
        ? this.$options.filters.currencyDisplay(col.value, 2, 0, "")
        : undefined;
    else if (col.type == "custom") {
      let rateType = row.columns.find(
        (c) => c.fieldName == "feeScheduleRateType"
      );

      if (rateType) {
        if((rateType.value == "Flat Amount"||rateType.value == "Flat Rate") && isNaN(col.value))
          return null;
        else if (rateType.value == "Flat Amount")
          return this.$options.filters.currencyDisplay(col.value, 2, 0);
        else if (rateType.value == "Flat Rate")
          return this.$options.filters.percentDisplay(col.value, 2, 0);                 
      }            
    }

    return col.value ? col.value : undefined;
  }

  tabClicked(value: string) {
    this.rows = [];
    this.columns = [];
    if (value == "Accounts") {
      this.rows = JSON.parse(JSON.stringify(this.responseRows));
      this.tabValue = true;
    } else if (value == "Asserts") {
      this.tabValue = false;
    }
    this.buildColumns();
  }

  get selectedRows() {
    return this.rows.filter((r) => r.selected);
  }

  get validRows() {
    return this.rows.filter((r) => r.valid);
  }

  get allSelected(){
      return this.selectedRows.length===this.validRows.length;
  }

  get completedRows(){
     return this.rows.filter((r) => r.status=='completed');
  }
}
</script> 