<template>
  <div class="autocomplete" style="width:100%">
    <div
      class="autocomplete__input"
      :class="{ open: toggle || data.alwaysOpen }"
    >
      <input
        type="text"
        v-model="searchText"
        :placeholder="placeholder"
        @keyup="onSearchChange"
        @blur="onSearchOut"
        @click="onSearchChange"
      />
    </div>
    <div
      class="autocomplete__dropdown"
      :class="{ open: toggle || data.alwaysOpen }"
    >
      <div class="autocomplete__dropdown-action">
        <button
          type="button"
          class="btn btn--small btn--outline"
          @click.stop.prevent="applyChanges"
          v-if="changed && data.multiple"
        >
          Apply
        </button>
        <button
          type="button"
          class="btn btn--small btn--inline"
          @click.stop.prevent="cancelChanges"
        >
          Cancel
        </button>
      </div>
      <div
        class="autocomplete__dropdown-head"
        v-if="selectedItems.length || data.selectedItems.length"
      >
        <ul>
          <li
            class="autocomplete__item"
            v-for="(item, index) of data.selectedItems"
            :key="'old-' + index"
          >
            <span
              class="autocomplete__item-action icon--remove"
              @click.stop.prevent="removeItem(item)"
            ></span>
            <span>{{ item.text }}</span>
          </li>
          <li
            class="autocomplete__item"
            v-for="(item, index) of selectedItems"
            :key="'current-' + index"
          >
            <span
              class="autocomplete__item-action icon--remove"
              @click.stop.prevent="removeItem(item)"
            ></span>
            <span>{{ item.text }}</span>
          </li>
        </ul>
        <div class="divider"></div>
      </div>
      <div class="autocomplete__dropdown-body">
        <div class="autocomplete__dropdown-loading" v-if="loading">
          <div class="loading-pulse"></div>
        </div>
        <ul>
          <li
            class="autocomplete__item select-all"
            v-if="data.multiple && data.allowSelectAll"
            :class="{ 'autocomplete__item--selected': data.selectAll }"
            @click.stop.prevent="selectAll()"
          >
            <span class="autocomplete__item-action icon--select"></span>
            <span>{{ data.selectAllText }}</span>
          </li>
          <template v-if="data.items">
            <li
              class="autocomplete__item"
              v-for="(item, index) of data.items.filter((i) => !i.hidden)"
              :key="index"
              :class="{ 'autocomplete__item--selected': item.selected }"
              @click.stop.prevent="addItem(item)"
            >
              <span
                class="autocomplete__item-action icon--select"
                v-if="data.multiple"
              ></span>
              <span
                v-if="data.showLabel && item.type"
                class="autocomplete__item-label"
                :class="item.type.toLowerCase()"
                >{{ item.type.charAt(0).toUpperCase() }}</span
              >
              <span>{{ item.text }}</span>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { IBaseRequest, ListItem, IListService } from "@/model";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class AutoComplete extends Vue {
  @Prop({ required: true, default: () => new AutoCompleteData() })
  data: AutoCompleteData;

  placeholder: string = "";
  searchText: string = "";
  toggle: boolean = false;
  loading: boolean = false;
  changed: boolean = false;
  currentSearchText: string = "";

  selectedItems: Array<ListItem> = [];
  removedItems: Array<ListItem> = [];

  mounted() {
    this.onSearchOut();

    if (this.data.items) {
      if (!this.data.selectedItems) this.data.selectedItems = [];

      this.data.items
        .filter((i) => i.selected)
        .forEach((i) => {
          if (!this.data.selectedItems.some((s) => s.value == i.value))
            this.data.selectedItems.push(i);
        });

      if (this.data.allowSelectAll)
        this.data.selectAll =
          this.data.items.length == this.data.selectedItems.length;

      if (this.data.selectAll) {
        this.data.selectedItems = [];
      }
    }
  }

  clickOutside() {
    this.cancelChanges();
  }

  onSearchOut() {
    if (this.data) this.placeholder = this.data.label;
  }

  debounce: any = null;
  onSearchChange() {
    if (this.searchText) this.data.selectAll = false;

    if (this.searchText != this.currentSearchText && this.data.selectAll) {
      if (this.data.items) this.data.items.forEach((i) => (i.selected = false));
      this.selectedItems = [];
    }

    this.placeholder = "Start typing to filter";
    if (this.data.request && this.data.service) {
      if (this.searchText || !this.data.ignoreEmptySearch) {
        if (this.searchText != this.currentSearchText) {
          this.currentSearchText = this.searchText;
          this.loading = true;
          this.toggle = true;
          this.data.items = [];

          clearTimeout(this.debounce);
          this.debounce = setTimeout(() => {
            this.data.request.search = this.searchText;

            this.data.service.getListItems(this.data.request).then((items) => {
              
              if(this.data.showLabel) {
                var household:any[] = [], data:any[] = [];
                items.filter((e) => {  if(e.data.objectType == "Household") household.push(e) });
                
                if(household.length > 0) {
                  household.filter((a) => {
                    data.push(a);
                    items.filter((e) => { 
                      if(e.data.objectType == "Account" && e.data.householdId == a.data.householdId)
                      data.push(e);
                    }); 
                  });

                  items = data;
                  
                }
              }

              this.data.items = items;

              this.loading = false;
              this.currentSearchText = '';

              if (
                this.selectedItems.length == 0 &&
                this.data.items.length == 0 &&
                this.data.selectedItems.length == 0
              )
                this.toggle = false;
            });
          }, 600);
        }
      } else {
        this.data.items = [];

        if (this.selectedItems.length || this.data.selectedItems.length)
          this.toggle = true;

        if (!this.data.multiple) this.toggle = false;
      }
    } else {
      this.toggle = true;

      this.data.items.forEach((i) => {
        i.hidden = this.searchText && !i.text
          .toLowerCase()
          .includes(this.searchText.toLowerCase());
      });
    }
  }

  applyChanges() {
    this.selectedItems.forEach((si) => {
      if (!this.data.selectedItems.some((s) => s.value == si.value))
        this.data.selectedItems.push(si);
    });

    if (this.data.selectAll) {
      this.data.items.forEach((si) => {
        if (!this.data.selectedItems.some((s) => s.value == si.value))
          this.data.selectedItems.push(si);
      });
    }

    if (this.data.required && this.data.selectedItems.length == 0) return;

    this.toggle = false;
    this.searchText = undefined;

    this.$emit("onChanged", this.data.selectedItems);

    this.reconcile();
    this.selectedItems = [];
    this.removedItems = [];
    this.changed = false;
  }

  cancelChanges() {
    if (!this.data.alwaysOpen) {
      this.toggle = false;
      this.searchText = undefined;

      this.data.selectedItems.push(...this.removedItems);
      this.data.selectedItems.forEach((si) => {
        si.selected = true;
      });

      this.reconcile();
      this.selectedItems = [];
      this.removedItems = [];
      this.changed = false;
    }

    this.$emit("onCanceled");
  }

  reconcile() {
    this.data.items.forEach((i) => {
      let si = this.data.selectedItems.find((s) => i.value == s.value);

      i.selected = si && si.selected == true;
    });
  }

  selectAll() {
    this.changed = true;
    this.searchText = undefined;

    let select = !this.data.selectAll;

    if (this.data.items) {
      this.data.items.forEach((i) => {
        i.selected = select;
        i.hidden = false;
      });
    }

    this.data.selectedItems = [];
    this.selectedItems = [];

    this.data.selectAll = select;
  }

  addItem(item: ListItem) {
    if (this.data.selectAll) return;

    if (this.data.multiple) {
      if (
        !this.data.selectedItems.some((s) => s.value == item.value) &&
        !this.selectedItems.some((s) => s.value == item.value)
      ) {
        this.changed = true;
        item.selected = true;
        this.selectedItems.push(item);
      }
    } else {
      this.$emit("onChanged", item);

      this.searchText = item.text;
      setTimeout(() => {
        this.searchText = undefined;
      }, 1000);
      this.toggle = false;
    }
  }

  removeItem(item: ListItem) {
    this.changed = true;
    item.selected = false;

    this.selectedItems = this.selectedItems.filter((s) => s != item);

    let si = this.data.items.find((i) => i.value == item.value);
    if (si) si.selected = false;

    let di = this.data.selectedItems.find((s) => s.value == item.value);
    if (di) {
      this.data.selectedItems = this.data.selectedItems.filter(
        (s) => s != item
      );

      this.removedItems.push(di);
    }
  }
}

export class AutoCompleteData {
  label: string = "Search";
  ignoreEmptySearch: boolean = false;
  multiple: boolean = false;
  showLabel: boolean = false;
  alwaysOpen: boolean = false;
  allowSelectAll: boolean = false;
  selectAll: boolean = false;
  required: boolean = false;
  selectAllText: string = "Select All";

  request: IBaseRequest;
  service: IListService<IBaseRequest>;

  items: Array<ListItem>;

  selectedItems: Array<ListItem> = [];

  get valid(): boolean {
    return (
      (this.items && this.items.some((i) => i.selected)) ||
      (this.selectedItems && this.selectedItems.length > 0)
    );
  }
}
</script>