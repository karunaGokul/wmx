<template>
  <header class="header">
    <div class="notification-bar" v-if="$store.getters.showNotificationBar">
      <i class="fa fa-exclamation-circle"></i> You have billing to review and
      approve. To get started,
      <router-link to="/approve-billing" tag="a"> click here </router-link>
      <button type="button" @click="$store.dispatch('dismissNotification')">
        Dismiss
      </button>
    </div>
    <div class="row pa--top-2 position--relative">
      <div class="column-1 pa--left-2">
        <a class="nav__icon" href="#" @click.stop="navDrawer = !navDrawer"> </a>
        <div class="nav-dropdown-container" v-if="navDrawer">
          <div class="blocker"></div>
          <div class="nav-dropdown" v-click-outside="clickOutsideNavDrawer">
            <div class="nav-dropdown__close" @click="closeNavBar"></div>
            <div class="nav-dropdown__header">
              <img
                v-if="avatar"
                class="avatar avatar-large"
                :src="$vuehelper.getImageUrl(avatar)"
                :alt="nickName"
              />
              <span v-else class="avatar avatar-large">{{
                firstLetterOfNickname
              }}</span>
              <div class="nav-dropdown__header-message">
                Hello, {{ nickName }}
              </div>
            </div>
            <ul class="nav-dropdown__menu pa--top-1">
              <router-link
                to="/"
                tag="li"
                class="nav-dropdown__menu-item"
                :active-class="routerActiveClass"
                @click.native="closeNavBar"
                exact
                >Overview</router-link
              >
              <router-link
                to="/households"
                tag="li"
                class="nav-dropdown__menu-item"
                :active-class="routerActiveClass"
                @click.native="closeNavBar"
                >Households</router-link
              >
              <router-link
                to="/approve-billing"
                tag="li"
                class="nav-dropdown__menu-item"
                :active-class="routerActiveClass"
                @click.native="closeNavBar"
                >Approve Billing</router-link
              >
              <router-link
                to="/review-billing"
                tag="li"
                class="nav-dropdown__menu-item"
                :active-class="routerActiveClass"
                @click.native="closeNavBar"
                >Review Billing</router-link
              >
              <router-link
                to="/upload-billing"
                tag="li"
                class="nav-dropdown__menu-item"
                :active-class="routerActiveClass"
                @click.native="closeNavBar"
                >Upload Billing</router-link
              >
              <router-link
                to="/payment-accounts"
                tag="li"
                class="nav-dropdown__menu-item"
                :active-class="routerActiveClass"
                @click.native="closeNavBar"
                v-if="$store.getters.settings.paymentAccountsPage"
                >Payment Accounts</router-link
              >
            </ul>
            <hr class="divider ma--y-1" />
            <div class="nav-dropdown__title">Settings</div>
            <ul class="nav-dropdown__menu pa--bottom-1">
              <li
                class="nav-dropdown__menu-item"
                :class="{
                  'nav-dropdown__menu-item--active': profileToggle,
                }"
                @click.stop="
                  passwordToggle = false;
                  profileToggle = true;
                "
              >
                <span>Personalize</span>
                <div
                  class="nav-dropdown__menu-flyout profile"
                  v-if="profileToggle"
                  v-click-outside="clickOutsideProfile"
                >
                  <div class="profile__avatar-wrapper">
                    <img
                      class="profile__avatar"
                      v-if="avatar"
                      :src="$vuehelper.getImageUrl(avatar)"
                    />
                    <span
                      v-else
                      class="profile__avatar fas fa-user user-icon"
                    ></span>
                    <div class="profile__avatar-edit">
                      <a
                        class="fas fa-edit"
                        @click.stop="openAvatarUpload()"
                      ></a>
                      <input
                        type="file"
                        ref="avatarUpload"
                        @change="uploadAvatar"
                        class="display--none"
                      />
                    </div>
                  </div>
                  <div class="profile__name">
                    <div class="form-input form-input__group" v-if="editName">
                      <input
                        type="text"
                        :value="nickName"
                        @blur="updateuserName($event.target.value)"
                      />
                    </div>
                    <span v-if="!editName">{{ nickName }}</span>
                    <a
                      class="profile__name-edit"
                      href="#"
                      @click.stop="editName = true"
                      v-if="!editName"
                    ></a>
                  </div>
                </div>
              </li>
              <li
                class="nav-dropdown__menu-item"
                :class="{ 'nav-dropdown__menu-item--active': passwordToggle }"
                @click.stop="
                  profileToggle = false;
                  passwordToggle = true;
                "
              >
                <span>Change password</span>
                <div
                  class="nav-dropdown__menu-flyout password-container"
                  v-if="passwordToggle"
                  v-click-outside="clickOutsidePassword"
                >
                  <div class="error-message" v-if="passwordError">
                    {{ passwordError }}
                  </div>
                  <div class="password__forms">
                    <form @submit.prevent="changePassword">
                      <div class="form-group ma--bottom-3">
                        <input
                          type="password"
                          name="Current Password"
                          placeholder="Current Password"
                          v-model="passwordRequest.oldPassword"
                          class="form__input"
                          :class="{
                            'form__input--error':
                              validatePassword && !passwordRequest.oldPassword,
                          }"
                        />
                      </div>
                      <div class="form-group ma--bottom-3">
                        <input
                          type="password"
                          name="New Password"
                          placeholder="New Password"
                          v-model="passwordRequest.newPassword"
                          :class="{
                            'form__input--error':
                              validatePassword && !passwordRequest.newPassword,
                          }"
                        />
                      </div>
                      <div class="form-group ma--bottom-3">
                        <p
                          class="error-message"
                          v-if="
                            passwordRequest.newPassword &&
                            passwordRequest.confirmPassword &&
                            passwordRequest.newPassword !=
                              passwordRequest.confirmPassword
                          "
                        >
                          Confirmation password does not match
                        </p>
                        <input
                          type="password"
                          name="Confirm Password"
                          placeholder="Confirm Password"
                          v-model="passwordRequest.confirmPassword"
                          :class="{
                            'form__input--error':
                              validatePassword &&
                              !passwordRequest.confirmPassword,
                          }"
                        />
                      </div>
                      <div class="form-group text--align-center">
                        <button type="submit" class="btn">SAVE</button>
                      </div>
                    </form>
                  </div>
                </div>
              </li>
              <li class="nav-dropdown__menu-item" @click="logout()">
                Sign out
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="column-2">
        <div class="header-logo" v-if="$store.getters.logo">
          <router-link to="/">
            <img
              class="header-logo__img"
              :src="$vuehelper.getImageUrl($store.getters.logo)"
              alt="Wealth Manager Xplorer"
            />
          </router-link>
        </div>
      </div>

      <div class="column-2 header-dropdown">
        <div
          class="dropdown"
          v-click-outside="clickOutsideFirms"
          v-if="firms.length > 1"
        >
          <a class="dropdown-toggle" @click="firmToggle = !firmToggle">{{
            selectedFirm
          }}</a>
          <ul class="dropdown-menu" :class="{ show: firmToggle }">
            <li
              class="dropdown-item"
              v-for="(item, index) in firms"
              :key="index"
              :class="{ 'dropdown-item-active': selectedFirm == item }"
              @click="updateFirmCode(item)"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <div class="column-3">
        <auto-complete
          :data="searchData"
          @onChanged="onSearchChange($event)"
          v-if="searchData"
        />
      </div>

      <div class="column-2">
        <div class="header-utility-nav">
          <div class="dropdown" v-click-outside="clickOutsideRepCodes">
            <a class="dropdown-toggle" @click="openAdvisors">Rep codes</a>
            <div class="dropdown-menu show" v-if="advisorToggle">
              <auto-complete
                :data="advisorData"
                @onChanged="onAdvisorChange($event)"
                @onCanceled="onAdvisorCancel"
                v-if="advisorData"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="column-1 text--align-center">
        <div class="header-notification">
          <router-link to="/approve-billing"
            ><span
              class="header-notification__bubble"
              v-if="$store.getters.notifications < 10"
              >{{ $store.getters.notifications }}</span
            >
            <span
              class="header-notification__bubble"
              :data-tooltip="$store.getters.notifications"
              v-else
              ><i class="fa fa-exclamation"></i
            ></span>
          </router-link>
        </div>
      </div>

      <div class="column-1 text--align-center pa--right-3">
        <div class="display--flex justify-content--end">
          <img
            v-if="avatar"
            class="avatar"
            :src="$vuehelper.getImageUrl(avatar)"
            alt="nickName"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { Component, Vue, Inject } from "vue-property-decorator";
import { IUserService, IApprovalService } from "@/service";
import {
  HouseHoldSearchModel,
  IListService,
  ListItem,
  ChangePasswordRequest,
  ChangeUserNameRequest,
} from "@/model";
import AutoComplete, {
  AutoCompleteData,
} from "@/components/controls/AutoComplete.vue";

@Component({
  components: { AutoComplete },
})
export default class AppHeader extends Vue {
  @Inject("userService") userService: IUserService;
  @Inject("approvalService") approvalService: IApprovalService;
  @Inject("householdService")
  householdSearch: IListService<HouseHoldSearchModel>;  

  public navDrawer: boolean = false;
  public editName: boolean = false;
  private advisorToggle: boolean = false;

  public searchData: AutoCompleteData = null;
  public advisorData: AutoCompleteData = null;

  private profileToggle: boolean = false;
  private passwordToggle: boolean = false;
  private userNameUpdated: boolean = false;
  private firmToggle: boolean = false;

  private passwordRequest = new ChangePasswordRequest();
  private passwordError: string = "";
  private validatePassword: boolean = false;

  mounted() {
    this.buildSearchData();
  }

  logout() {
    this.$store.dispatch("clearEntitlements");
    this.$store.dispatch("clearSession");

    this.$keycloak.logoutFn();
  }

  public updateFirmCode(selectedItem: string) {
    this.$store.dispatch("firmCodeChanged", selectedItem);
    this.$store.dispatch("clearSession");

    this.$router.go(0);
  }

  public closeNavBar() {
    this.navDrawer = false;
    this.profileToggle = false;
    this.passwordToggle = false;
  }

  openAdvisors() {
    this.advisorToggle = !this.advisorToggle;

    this.buildAdvisorData();
  }

  buildAdvisorData() {
    this.advisorData = new AutoCompleteData();
    this.advisorData.label = `Search Advisor`;
    this.advisorData.multiple = true;
    this.advisorData.alwaysOpen = true;
    this.advisorData.allowSelectAll = true;
    this.advisorData.selectAllText = "All Rep codes";
    this.advisorData.required = true;
    this.advisorData.items = Object.entries(
      this.$store.getters.advisors.sort()
    ).map((e) => new ListItem(e[1].toString(), e[0]));

    let selectedAdvisors = this.$store.getters.selectedAdvisor;
    if (selectedAdvisors) {
      selectedAdvisors.split(",").forEach((s: string) => {
        let si = this.advisorData.items.find((a) => a.text == s);
        if (si) si.selected = true;
      });
    } else {
      this.advisorData.items.forEach((s) => {
        if (s) s.selected = true;
      });
    }
  }

  buildSearchData() {
    let request = new HouseHoldSearchModel();
    request.type = "Both";

    this.searchData = new AutoCompleteData();
    this.searchData.label = `Search Accounts`;
    this.searchData.ignoreEmptySearch = true;
    this.searchData.showLabel = true;
    this.searchData.request = request;
    this.searchData.service = this.householdSearch;   
  }

  public onAdvisorChange(items: Array<ListItem>) {
    this.advisorToggle = false;

    let currentAdvisors = this.$store.getters.selectedAdvisor;
    let selectedAdvisors = items.map((i) => i.text).join(",");

    if (currentAdvisors !== selectedAdvisors) {
      this.$store.dispatch("advisorCodeChanged", selectedAdvisors);
      this.$router.go(0);
    }
  }

  public onAdvisorCancel() {
    this.advisorToggle = false;
  }

  public onSearchChange(item: ListItem) {
    this.$router.push({
      path: `/households/${item.value}`,
    });
  }

  public openAvatarUpload() {
    let file: any = this.$refs.avatarUpload;

    file.click();
  }

  public uploadAvatar(event: any) {
    let file: File = event.target.files[0];
    if (!file) return;

    this.$store.dispatch("updateUserAvatar", file);
  }

  public changePassword() {
    this.validatePassword = true;

    if (
      this.passwordRequest.oldPassword &&
      this.passwordRequest.newPassword &&
      this.passwordRequest.newPassword == this.passwordRequest.confirmPassword
    ) {
      this.userService
        .changePassword({
          oldPassword: this.passwordRequest.oldPassword,
          newPassword: this.passwordRequest.newPassword,
        })
        .then(
          (response) => {
            this.validatePassword = false;
            this.passwordToggle = false;
          },
          (error) => {
            this.passwordError = "Password doesnot match our records.";
            if (error && error.response && error.response.data)
              this.passwordError = error.response.data.message;
          }
        );
    }
  }

  public updateuserName(nickName: string) {
    this.$store.dispatch("updateUserName", nickName);

    this.editName = false;
    this.userNameUpdated = true;
  }

  public clickOutsideNavDrawer() {
    if (!this.userNameUpdated) {
      this.navDrawer = false;
      this.profileToggle = false;
      this.passwordToggle = false;

      this.editName = false;
    }
  }

  public clickOutsideFirms() {
    this.firmToggle = false;
  }

  public clickOutsideRepCodes() {
    this.advisorToggle = false;
  }

  public clickOutsideProfile() {
    if (!this.userNameUpdated) this.profileToggle = false;
    else this.userNameUpdated = false;
  }

  public clickOutsidePassword() {
    this.passwordToggle = false;

    this.passwordRequest = new ChangePasswordRequest();
    this.passwordError = undefined;
    this.validatePassword = false;
  }

  get firms() {
    return this.$store.getters.firms.sort();
  }

  get advisors() {
    let advisors: Array<string> = this.$store.getters.advisors.sort();

    return advisors;
  }

  get firstLetterOfNickname() {
    return (this.nickName ? this.nickName : this.$keycloak.userName)
      .charAt(0)
      .toUpperCase();
  }

  get nickName() {
    return this.$store.getters.userName;
  }

  get avatar() {
    return this.$store.getters.userAvatar;
  }

  get selectedFirm() {
    let firmCode = this.$store.getters.selectedFirm;

    return firmCode;
  }

  get routerActiveClass() {
    return !this.passwordToggle && !this.profileToggle
      ? "nav-dropdown__menu-item--active"
      : "";
  }
}
</script>
