<template>
   <div class="modal-container show" v-if="dialog">
    <div class="blocker"></div>
    <div class="modal" style="width: 400px">
      <div class="modal__header">
        <h2 class="modal__title">{{ title }}</h2>
      </div>
      <div class="modal__content">
        <p class="pa-2" v-html="message">
        </p>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn--small" @click="cancel">{{ noButtonText }}</button>
        <button type="button" class="btn btn--primary btn--small" @click="agree">{{ yesButtonText }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class AppConfirm extends Vue {
  dialog: boolean = false;
  message: string = "";
  resolve: any = null;
  reject: any = null;
  title: string = "";
  yesButtonText: string = "Yes";
  noButtonText: string = "No";

  show(title: string, message: string, yesButtonText?: string, noButtonText?: string) : Promise<boolean> {
    this.dialog = true;
    this.title = title;
    this.message = message;
    this.yesButtonText = yesButtonText;
    this.noButtonText = noButtonText;

    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  agree() {
    this.resolve(true);
    this.dialog = false;
  }

  cancel() {
    this.resolve(false);
    this.dialog = false;
  }
}
</script>