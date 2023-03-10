<template>
  <div class="date-picker">
    <date-picker
      :value="date"
      format="MM-DD-YYYY"
      type="date"
      placeholder="Select date"
      @change="onChange"
      @close="onClose"
      :clearable="data.clearable"
      ref="picker"
    >
    </date-picker>
  </div>
</template>

<script lang="ts">
import { IBaseRequest, ListItem } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";

@Component({
  components: { DatePicker }
})
export default class DateSelector extends Vue {
  @Prop({ required: true, default: () => new DateSelectorData() })
  data: DateSelectorData;

  date: Date = null;

  created() {
    if (this.data.value) this.date = this.data.value;
  }

  onChange(date: Date) {
    this.data.value = date;
    this.date = date;

    this.$emit("onChanged", this.data);
  }

  onClose() {
    this.$emit("onClose", this.data);
  }

  public focus() {
    let picker: any = this.$refs.picker;
    picker.focus();
  }

}

export class DateSelectorData {
  value: Date;
  clearable: boolean = true;

  get valid(): boolean {
    return this.value != undefined;
  }
}
</script>