<template>  
  <div class="checkbox-list">
    <div
      class="checkbox-list__item"
      v-for="(item, index) of data.items"
      :key="index"
      @click="onChange(item)"
    >
      <input type="radio" :checked="item.selected" />
      <label class="checkbox-list__label">{{ item.text }}</label>
    </div>
  </div>
</template>

<script lang="ts">
import { IBaseRequest, ListItem } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class RadioList extends Vue {
  @Prop({ required: true, default: () => new RadioListData() })
  data: RadioListData;
  currentState: boolean = true;
  
  onChange(item: ListItem) {
    if (!item.selected) {
      this.data.items.forEach((s) => (s.selected = null));
      item.selected = true;
    } else {
      item.selected = null;
    }
    this.$emit(
      "onChanged",
      this.data.items.filter((d) => d.selected)
    );
  }
}

export class RadioListData {
  items: Array<ListItem>;

  get valid(): boolean {
    return this.items && this.items.some((i) => i.selected);
  }
}
</script>