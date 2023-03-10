<template>
  <footer>
    <div class="footer">
      <div class="row align--center">
        <div class="column-4">
          <a @click="dialog = true">Legal Disclosures</a>
        </div>
        <div class="column-4">
          <div class="footer__poweredby">
            <span>powered by</span> <img :src="$store.getters.settings.logo" />
          </div>
        </div>
        <div class="column-4">
          <div class="footer__legal">
            <span>Copyright Redi2 Technologies, Inc. {{ (new Date()).getFullYear() }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-container show" v-if="dialog">
      <div class="blocker"></div>
      <div class="modal footer__legal-modal">
        <div class="modal__content">
          <div class="footer__legal-head">
            <h2>Legal Disclosures</h2>
            <a @click="dialog = false"><i class="fa fa-times"></i></a>
          </div>
          <div class="footer__legal-content" v-html="$store.getters.settings.legalContent">
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class AppFooter extends Vue {
  dialog: boolean = false;
}
</script>