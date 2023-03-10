<template>
  <main class="content">
    <router-view></router-view>
    <app-alert ref="alert"></app-alert>
    <app-confirm ref="confirm"></app-confirm>
    <app-loading ref="loader"></app-loading>
  </main>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import AppAlert from "@/components/layout/AppAlert.vue";
import AppConfirm from "@/components/layout/AppConfirm.vue";
import AppLoading from "@/components/layout/AppLoading.vue";

@Component({
  components: { AppAlert, AppConfirm, AppLoading },
})
export default class AppContent extends Vue {
  mounted() {
    let root: any = this.$root;

    let alert: AppAlert = this.$refs.alert as AppAlert;
    root.$alert = alert.show;

    let confirm: AppConfirm = this.$refs.confirm as AppConfirm;
    root.$confirm = confirm.show;

    let loader: AppLoading = this.$refs.loader as AppLoading;
    root.$loader = loader;
  }
}
</script>