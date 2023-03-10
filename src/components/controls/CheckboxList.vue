<template>
  <div class="checkbox-list">
    <div
      class="checkbox-list__item"
      v-for="(item, index) of data.items"
      :key="index"
      @click="onChange(item)"
    >
      <input type="checkbox" :checked="item.selected" />
      <label class="checkbox-list__label">{{ item.text }}</label>
    </div>
  </div>
</template>

<script lang="ts">
import { IBaseRequest, ListItem } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class CheckboxList extends Vue {
  @Prop({ required: true, default: () => new CheckboxListData() })
  data: CheckboxListData;

  onChange(item: ListItem) {
    item.selected = !item.selected;

    this.$emit("onChanged", this.data.items.filter(d => d.selected));
  }
}

export class CheckboxListData {
  items: Array<ListItem>;  

  get valid(): boolean {
    return this.items && this.items.some(i => i.selected);
  }
}
</script>