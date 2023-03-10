<template>
  <td
    @click="openInputFunc"
    v-click-outside="clickOutsideFunc"
    class="form-control"
    :class="{
      className,
      'form-control__errors': errors,
    }"
    :data-tooltip="titleTooltip"
  >
    <div
      class="form-control__input"
      v-if="show"
      :class="{
        'form-control__input--amount': controls == 'Flat Amount',
        'form-control__input--rate': controls == 'Flat Rate',
      }"
    >
      <input
        type="text"
        v-if="
          controls == 'Flat Amount' ||
          controls == 'Flat Rate' ||
          controls == 'BasicInput'
        "
        v-model="searchText"
        @keyup="update($event)"
      />
      <select
        v-if="controls == 'BasicSelectBox' || controls == 'Tiered'"
        v-model="searchText"
        @change="update($event)"
      >
        <option v-for="(item, index) in response" :key="index" :value="item">
          {{ item }}
        </option>
      </select>
      <date-selector
        v-if="controls == 'BasicDatePicker'"
        :data="{ value: searchText }"
        @onChanged="update($event)"
      />
    </div>
    <span v-if="!show">{{ searchText }}</span>
  </td>
</template>
<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import moment from "moment";

import DateSelector from "@/components/controls/DateSelector.vue";

@Component({
  components: {
    DateSelector,
  },
})
export default class InputControl extends Vue {
  @Prop() value: string;
  @Prop() className: string;
  @Prop() controls: string;
  @Prop() response: Array<string>;
  @Prop() errors: boolean;
  @Prop() titleTooltip: string;

  public show: boolean = false;
  public searchText: string = "";

  mounted() {
    this.searchText = this.value;
  }

  public openInputFunc() {
    this.show = true;
  }

  public clickOutsideFunc() {
    if (this.show) this.show = false;
  }

  public update(selectedDate?: any) {
    if (this.controls == "BasicDatePicker")
      this.searchText = this.selectedBilledSinceFilter(selectedDate.value);

    this.$emit(
      "onChanged",
      this.controls == "BasicDatePicker"
        ? this.selectedBilledSinceFilter(selectedDate.value)
        : this.searchText
    );
  }

  public selectedBilledSinceFilter(selectedDate: any) {
    var date = selectedDate;
    if (!date) return (date = "");

    date = moment(date).format("MM-DD-YYYY");
    return date;
  }
}
</script>