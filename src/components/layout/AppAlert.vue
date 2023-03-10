<template>
  <div class="modal-container show" v-if="dialog">
    <div class="blocker"></div>
    <div class="modal" style="width: 400px">
      <div class="modal__header">
        <h2 class="modal__title">{{ title }}</h2>
      </div>
      <div class="modal__content">
        <div class="modal__content-alert">
          <span class="alert__icon" :class="type" v-if="type"></span>
          <p v-html="text"></p>
        </div>
      </div>
      <div class="modal__footer">
        <button type="button" class="btn btn--small" @click="dialog = false">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";

@Component
export default class AppAlert extends Vue {
  dialog: boolean = false;
  text: string = "";
  title: string = "";
  type: string = "";

  public show(text: string, title?: string, type?: string) {
    this.dialog = true;
    this.text = text;
    this.title = title ? title : "Alert";
    this.type = type;
  }  
}
</script>