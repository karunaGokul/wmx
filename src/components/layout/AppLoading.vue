<template>
  <div class="modal-container show" v-if="dialog">
    <div class="blocker"></div>
    <div class="modal pa-6">
      <div class="modal__content text--align-center">
        <div class="loading-container">
          <div class="loading">
            <div :class="css"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class AppLoading extends Vue {
  dialog: boolean = false;

  type: string;

  public showLoader() {
    this.type = "pulse";

    this.dialog = true;
  }

  public showProgress() {
    this.type = "float";

    this.dialog = true;
  }

  public hide() {
    this.dialog = false;
  }

  get css() {
    return `loading-${this.type}`;
  }
}
</script>