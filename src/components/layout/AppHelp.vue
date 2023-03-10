<template>
  <span class="help">
    <span class="help__trigger" v-if="id"></span>
     <span class="help__trigger" v-else-if="data">
      <i class="fa fa-exclamation-triangle" style="color: red"></i>
    </span>
    <div
      class="help__content"
      :class="position"
    >
    <div v-html="getData(id)" v-if="id"></div>
    <div v-html="data" v-else-if="data"></div>      
    </div>
  </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class AppHelp extends Vue {
  @Prop() data: any;
  @Prop({ default: 0 }) id: number;
  @Prop({ default: "center" }) position: string;

  getData(id: string) {
    let h = this.$store.getters.settings.help;

    if (h) return h[id];

    return "";
  }
}
</script>