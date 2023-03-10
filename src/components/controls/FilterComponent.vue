<template>
  <div class="row no-gutters filter">
    <div class="column-7">
      <div class="filter-summary" v-if="selectedFilterData">
        <div
          class="filter-summary__item filter-summary__clear"
          v-if="selectedFilterData.items.some((i) => i.valid)"
        >
          Clear all <i @click="clearFilter" />
        </div>
        <template
          v-for="(filterItem, i) of selectedFilterData.items.filter(
            (e) => e.valid
          )"
        >
          <div
            class="filter-summary__item"
            v-if="filterItem.type == 'amountrange'"
            :key="filterItem.id + i"
          >
            {{ filterItem.label }} {{ filterItem.data.operator }}
            {{ filterItem.data.amount }} <i @click="removeItem(filterItem)" />
          </div>
          <div
            class="filter-summary__item"
            v-if="filterItem.type == 'dateselector'"
            :key="filterItem.id + i"
          >
            {{ filterItem.data.value | dateDisplay }}
            <i @click="removeItem(filterItem)" />
          </div>
          <div
            class="filter-summary__item"
            v-else
            v-for="(item, j) of filterItem.selectedItems"
            :key="filterItem.id + i + j"
          >
            {{ item.text }} <i @click="removeItem(filterItem, item)" />
          </div>
        </template>
      </div>
    </div>
    <div class="column-5 text--align-right">
      <div class="display--flex justify-content--end">
        <div v-if="pageName == 'Payment Accounts'" class="pa--right-2">
          <button type="button" class="btn btn--secondary" @click="Save()">
            Save
          </button>
        </div>
        <ExportComponent
          :pageName="pageName"
          :feeRequest="feeRequest"
          :paymentRequest="paymentRequest"
          v-if="pageName != 'Households'"
        />        
        <div class="ma--left-1">
          <button type="button" class="btn btn--icon" @click="openFilter">
            <i class="fas fa-filter fa-lg filter__trigger"></i>
          </button>
          <div class="filter-modal-container" v-if="filterData">
            <div class="blocker"></div>
            <div
              class="filter-modal"
              :style="{
                width: (filterData.width ? filterData.width : 600) + 'px',
              }"
            >
              <div class="row filter-modal__head">
                <div class="column-6">
                  <h4 class="text--weight-medium">
                    Filter your {{ filterData.title }}
                  </h4>
                </div>
                <div class="column-6 text--align-right">
                  <button
                    type="button"
                    class="btn btn--primary"
                    @click.stop.prevent="updateFilters"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    class="btn btn--inline"
                    @click.stop.prevent="clearFilters"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div class="row filter-modal__body">
                <div
                  v-for="column in columns"
                  :key="column"
                  :class="'column-' + 12 / columns"
                >
                  <div
                    v-for="(item, index) of filterData.items.filter(
                      (i) => i.column == column
                    )"
                    :key="index"
                    class="filter-box"
                    :class="{ 'filter-box--active': item.active }"
                  >
                    <div class="filter-box__head" @click="onClick(item, index)">
                      <div class="row">
                        <div class="column-10">
                          <span class="text--weight-bold">{{
                            item.label
                          }}</span>
                          <span
                            class="pa--left-2 filter-box__head-teaser"
                            v-if="item.selectedItems.length"
                            >Filtering on
                            {{ item.selectedItems.length }} selection(s)</span
                          >
                          <span
                            class="pa--left-2"
                            v-if="
                              item.type == 'amountrange' &&
                              item.data.operator &&
                              item.data.amount
                            "
                          >
                            <template
                              v-if="
                                item.label == 'Fee Amount' ||
                                item.label == 'Fee AUM' ||
                                item.label == 'Fee AUM Variance'
                              "
                            >
                              Filtering on {{ item.label }}
                            </template>
                            <template
                              v-else-if="item.label == 'Fee Amount Variance'"
                            >
                              Filtering on Fee Variance
                            </template>
                            <template v-else-if="item.label == 'Assets'">
                              Filtering on assets amount
                            </template>
                            <template v-else>Filtering on fee rate</template>
                          </span>
                          <span
                            class="pa--left-2"
                            v-if="
                              item.type == 'dateselector' && item.data.value
                            "
                          >
                            Filtering on date
                          </span>
                        </div>
                        <div class="column-2 text--align-right">
                          <span class="filter-box__toggle" />
                        </div>
                      </div>
                    </div>
                    <div
                      class="filter-box__body"
                      :class="{ show: item.active }"
                    >
                      <amount-range
                        :data="item.data"
                        :label="item.label"
                        v-if="item.type == 'amountrange'"
                      />
                      <checkbox-list
                        :data="item.data"
                        v-if="item.type == 'checkboxlist'"
                        @onChanged="onChange(item, $event)"
                      />
                      <radio-list
                        :data="item.data"
                        v-if="item.type == 'radiolist'"
                        @onChanged="onChange(item, $event)"
                      />

                      <date-selector
                        :data="item.data"
                        v-if="item.type == 'dateselector'"
                      />
                      <template v-if="item.type == 'autocomplete'">
                        <auto-complete
                          :data="item.data"
                          @onChanged="onChange(item, $event)"
                        />
                        <div
                          class="filter-box__detail"
                          v-if="item.selectedItems"
                        >
                          <ul>
                            <li
                              class="autocomplete__item"
                              v-for="(si, k) of item.selectedItems"
                              :key="k"
                            >
                              <span
                                class="autocomplete__item-action icon--remove"
                                @click.stop.prevent="removeFilterItem(item, si)"
                              ></span>
                              <span>{{ si.text }}</span>
                            </li>
                          </ul>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GearComponent
          :pageName="pageName"
          @applyGear="onApplyGear"
          v-if="pageName != 'Households' && pageName != 'Payment Accounts'"
        />
      </div>
      <div class="pa--right-2 ma--top-2">
        <slot name="info"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

import {
  ListItem,
  FilterViewModel,
  FilterItemViewModel,
  FeeRequestModel,
  PaymentRequestModel,
} from "@/model";
import AutoComplete, { AutoCompleteData } from "./AutoComplete.vue";
import CheckboxList, {
  CheckboxListData,
} from "@/components/controls/CheckboxList.vue";
import AmountRange, {
  AmountRangeData,
} from "@/components/controls/AmountRange.vue";
import DateSelector, {
  DateSelectorData,
} from "@/components/controls/DateSelector.vue";
import { filter } from "node_modules/vue/types/umd";

import GearComponent from "./GearComponent.vue";
import ExportComponent from "./ExportComponent.vue";
import RadioList, {
  RadioListData,
} from "@/components/controls/RadioList.vue";

@Component({
  components: {
    AutoComplete,
    CheckboxList,
    RadioList,
    AmountRange,
    DateSelector,
    GearComponent,
    ExportComponent,
  },
})
export default class FilterComponent extends Vue {
  @Prop({ required: true, default: () => new FilterViewModel() })
  data: FilterViewModel;
  @Prop() pageName: string;
  @Prop() feeRequest: FeeRequestModel;
  @Prop() paymentRequest:PaymentRequestModel;

  filterData: FilterViewModel = null;
  selectedFilterData: FilterViewModel = null;
  columns: number = 1;

  mounted() {
    if (this.data) {
      this.selectedFilterData = this.$vuehelper.clone(this.data);
      this.buildFilterItemData(this.selectedFilterData);
    }
  }

  removeItem(filterItem: FilterItemViewModel, item: ListItem) {
    if (filterItem.type == "amountrange") {
      filterItem.data.amount = 0;

      this.$emit("applyFilters", this.selectedFilterData);
    } else if (filterItem.type == "dateselector") {
      filterItem.data.value = undefined;

      this.$emit("applyFilters", this.selectedFilterData);
    } else if (filterItem.items && filterItem.data.items) {
      let remove = filterItem.items.find((s) => s.text == item.text);
      remove.selected = false;

      remove = filterItem.data.items.find((s: any) => s.text == item.text);
      remove.selected = false;

      if (filterItem.data.selectedItems) {
        filterItem.data.selectedItems = filterItem.data.selectedItems.filter(
          (s: any) => s.text != item.text
        );
      }

      this.$emit("applyFilters", this.selectedFilterData);
    }
  }

  clearFilter() {
    this.selectedFilterData = null;
    this.$emit("applyFilters", this.selectedFilterData);
  }

  openFilter() {
    if (this.selectedFilterData) {
      this.filterData = this.$vuehelper.clone(this.selectedFilterData);

      this.filterData.items.forEach((item) => {
        item.active = false;
      });
    } else {
      this.filterData = this.$vuehelper.clone(this.data);

      this.buildFilterItemData(this.filterData);
    }

    this.columns = Math.max(...this.filterData.items.map((i) => i.column));
  }

  buildFilterItemData(filterData: FilterViewModel) {
    filterData.items.forEach((item) => {
      if (item.type == "amountrange") {
        item.data = new AmountRangeData();
      } else if (item.type == "dateselector") {
        item.data = new DateSelectorData();
      } else if (item.type == "autocomplete") {
        item.data = new AutoCompleteData();
        item.data.label = `Search ${item.label}`;
        item.data.multiple = true;
        item.data.request = item.request;
        item.data.service = item.service;
        item.data.items = item.items;
        item.data.selectedItems = item.selectedItems;
      } else if (item.type == "checkboxlist") {
        item.data = new CheckboxListData();
        item.data.items = item.items;
     }
      else if (item.type == "radiolist") {
        item.data = new RadioListData();
        item.data.items = item.items;
      }
    });
  }

  updateFilters() {
    this.selectedFilterData = this.$vuehelper.clone(this.filterData);

    this.filterData = null;
    this.$emit("applyFilters", this.selectedFilterData);
  }

  clearFilters() {
    this.filterData = null;
  }

  onClick(item: FilterItemViewModel, index: number) {
    item.active = !item.active;

    this.filterData = this.$vuehelper.clone(this.filterData);
  }

  onChange(filterItem: FilterItemViewModel, selectedItems: Array<ListItem>) {
    if (filterItem.request && filterItem.service) {
      filterItem.items = selectedItems;
    } else if (filterItem.items) {
      filterItem.items.forEach((i) => {
        let si = selectedItems.find((s) => i.text == s.text);

        i.selected = si && si.selected == true;
      });
    }

    this.filterData = this.$vuehelper.clone(this.filterData);
  }

  removeFilterItem(filterItem: FilterItemViewModel, item: ListItem) {
    let si = filterItem.items.find((i) => i.value == item.value);
    if (si) si.selected = false;

    if (filterItem.data) {
      if (filterItem.data.items) {
        let selectedItem = filterItem.data.items.find(
          (i: any) => i.text == item.text
        );
        if (selectedItem) selectedItem.selected = false;

        if (filterItem.data.selectedItems) {
          filterItem.data.selectedItems = filterItem.data.items.filter(
            (i: any) => i.selected
          );
        }
      }
    }
  }
  
  Save(){
    this.$emit("save");
  }

  onApplyGear() {
    this.$emit("applyFilters", this.selectedFilterData);
  }
}
</script>