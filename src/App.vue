<template>
  <div
    id="app"
    class="site__wrapper"
    :class="{ app_embossed: embossed }"
    :style="themeStyles"
    v-if="$store.getters.selectedFirm && $store.getters.dataEntitlements && $store.getters.dataEntitlements.length"
  >
    <AppHeader />

    <AppContent />

    <AppFooter />
    <div class="app__emboss" v-if="embossed">
      <div class="row">
        <div class="column-1" v-for="index in 12" :key="index">
          <div class="app__emboss--filler"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import moment from "moment";

import { DIContainer } from "./dicontainer";

import AppHeader from "@/components/layout/AppHeader.vue";
import AppContent from "@/components/layout/AppContent.vue";
import AppFooter from "@/components/layout/AppFooter.vue";
import AccessDenied from "@/components/layout/AccessDenied.vue";
import { Dictionary } from "./model";

@Component({
  components: { AppHeader, AppContent, AppFooter, AccessDenied },
})
export default class App extends DIContainer {
  embossed: boolean = false;

  themeStyles: Dictionary<string> = {};

  created() {
    this.buildDirectives();
    this.buildFilters();

    this.$store.getters.settings.styles.forEach((s: any) => {
      this.themeStyles[`--theme-${s.name}`] = s.value;
    });

  }

  mounted() {
    setTimeout(() => {
      this.embossed = this.$route.query.embossed == "true";
    }, 1000);
  }

  buildDirectives() {
    Vue.directive("click-outside", {
      bind: function (el: any, binding: any, vnode: any) {
        el.clickOutsideEvent = function (event: any) {
          if (!(el == event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.body.addEventListener("click", el.clickOutsideEvent);
      },
      unbind: function (el: any) {
        document.body.removeEventListener("click", el.clickOutsideEvent);
      },
    });
  }

  buildFilters() {
    Vue.filter(
      "currencyDisplay",
      (value: any, numberOfDigits: number = 2, minDigits: number = 2, symbol: string = "$") => {
        if (!value) return `${symbol}0`;

        if (isNaN(parseFloat(value)))
          return value;

        value = parseFloat(value);

        if (value >= 0)
          return `${symbol}${value.toLocaleString(undefined, {
            minimumFractionDigits: minDigits,
            maximumFractionDigits: numberOfDigits,
          })}`;
        else
          return `${symbol}(${Math.abs(value).toLocaleString(undefined, {
            minimumFractionDigits: minDigits,
            maximumFractionDigits: numberOfDigits,
          })})`;
      }
    );

    Vue.filter("percentDisplay", (value: any, numberOfDigits: number = 2) => {
      if (!value && value != null) value = 0;
      if (!value) return "N/A";

      if (value >= 0)
        return `${value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: numberOfDigits,
        })}%`;
      else
        return `(${Math.abs(value).toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: numberOfDigits,
        })})%`;
    });

    Vue.filter("dateDisplay", (value: any, format: string) => {
      if (!value) return "";

      if (!format) format = "MM-DD-YYYY";

      return moment(value).format(format);
    });
  }
}
</script>