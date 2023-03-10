<template>
  <div class="modal-container show" v-if="dialog">
    <div class="blocker"></div>
    <div class="modal" style="width: 400px">
      <div class="modal__header">
        <h2 class="modal__title">{{ alertTitle }}</h2>
      </div>
      <div class="modal__content">
        <div
          class="modal__content-alert pa--y-0"
          v-for="(item, index) of alertDetail"
          :key="index"
        >
          <span class="alert__icon" :class="item.type" v-if="item.type"></span>
          <p v-html="item.text"></p>
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
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class CustomAlert extends Vue {
  @Prop() alertDetail: any;
  @Prop() alertTitle: string;
  dialog: boolean = true;
}
</script>