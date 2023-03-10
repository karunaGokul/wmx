<template>
  <div>
    <button type="button" class="btn btn--icon" @click="openGear()">
      <i class="fas fa-cog fa-lg"></i>
    </button>
    <div class="overlay" v-if="toggleGear">
      <div class="dialog">
        <div class="dialog__header pa--y-2">
          <div class="dialog__header--title">
            <h3 class="text--weight-medium text--align-left">Table Settings</h3>
          </div>
          <div class="dialog__header--clear">
            <span @click.stop.prevent="toggleGear = false">
              <i class="fas fa-times fa-lg"></i>
            </span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="display--flex ma-2">
          <div
            style="flex-grow: 4.5"
            @drop="onDrop($event, 'availableColumn', null)"
            @dragover.prevent
            @drop.stop.prevent
          >
            <div style="height: 100%">
              <div class="row text--align-center border border--bottom-none">
                <h3 class="ma-2">Available Columns</h3>
              </div>
              <div class="gear-list border">
                <div
                  class="row border--bottom pa-2"
                  v-for="(column, index) in availableColumn.columns"
                  :key="index"
                  draggable
                  @dragstart="startDrag($event, column, 'availableColumn')"
                >
                  <div class="column-1">
                    <i class="fas fa-grip-vertical grab-handle"></i>
                  </div>
                  <div class="column-11">
                    <div class="form-checkbox">
                      <input
                        type="checkbox"
                        v-model="column.value"
                        :id="`available-${index}`"
                      />
                      <label
                        class="form-checkbox__label"
                        :for="`available-${index}`"
                        >{{ column.columnLabel }}</label
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            class="text--align-center ma--top-6 pa--top-6"
            style="flex-grow: 0.1"
          >
            <button class="btn btn--round ma--x-1" @click="moveRight()">
              <i class="fas fa-angle-right fa-lg"></i>
            </button>
            <br />
            <button class="btn btn--round ma--x-1" @click="moveLeft()">
              <i class="fas fa-angle-left fa-lg"></i>
            </button>
          </div>
          <div
            style="flex-grow: 4.5"
            @drop="onDrop($event, 'viewableColumn', null)"
            @dragover.prevent
            @drop.stop.prevent
          >
            <div style="height: 100%">
              <div class="row text--align-center border border--bottom-none">
                <h3 class="ma-2">Viewable Columns</h3>
              </div>
              <div class="gear-list border">
                <div
                  v-for="(column, index) in userPreference.columns"
                  :key="index"
                  draggable
                  @dragstart="startDrag($event, column, 'viewableColumn')"
                >
                  <div
                    class="row border--bottom pa-2"
                    @drop="onDrop($event, 'viewableColumn', index)"
                    @dragover.prevent
                    @drop.stop.prevent
                  >
                    <div class="column-1">
                      <i class="fas fa-grip-vertical grab-handle"></i>
                    </div>
                    <div class="column-11">
                      <div class="form-checkbox">
                        <input
                          type="checkbox"
                          v-model="column.value"
                          :id="`userpreference-${index}`"
                        />
                        <label
                          class="form-checkbox__label"
                          :for="`userpreference-${index}`"
                        >
                          {{ column.columnLabel }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row pa--x-3 pa--top-1">Select 6 columns for best view.</div>
        <div class="row pa-2">
          <div class="column-6 text--align-left">
            <button
              class="btn btn--primary"
              @click.stop.prevent="defaultPreference()"
            >
              Reset to Default
            </button>
          </div>
          <div class="column-6 text--align-right">
            <button
              class="btn btn--outline"
              @click.stop.prevent="toggleGear = false"
              style="border: solid 1px #989797"
            >
              Cancel
            </button>
            <button
              class="btn btn--primary ma--left-2"
              @click.stop.prevent="createUserPreference()"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { UserPreferenceModel } from "@/model";
import { IUserService } from "@/service";
import { Component, Inject, Prop, Vue } from "vue-property-decorator";
@Component
export default class GearComponent extends Vue {
  @Prop() pageName: string;
  @Inject("userService") service: IUserService;

  private toggleGear: boolean = false;

  public userPreference: UserPreferenceModel = new UserPreferenceModel();
  public availableColumn: UserPreferenceModel = new UserPreferenceModel();

  openGear() {
    this.service.getPageColumnConfiguration().then((response) => {
      this.toggleGear = true;
      this.availableColumn = JSON.parse(
        JSON.stringify(response.find((a: any) => a.pageName == this.pageName))
      );
      this.availableColumn.columns.sort((a, b) => {
        if (a.columnLabel.toLowerCase() < b.columnLabel.toLowerCase())
          return -1;
        if (a.columnLabel.toLowerCase() > b.columnLabel.toLowerCase()) return 1;
        else return 0;
      });

      this.userPreference = JSON.parse(
        JSON.stringify(
          this.$store.getters.userPreferences.find(
            (a: any) => a.pageName == this.pageName
          )
        )
      );

      this.availableColumn.columns = this.availableColumn.columns.filter(
        (a: any) => {
          let c = this.userPreference.columns.find(
            (b: any) => b.columnName == a.columnName
          );
          if (!c) return a;
        }
      );
    });
  }

  createUserPreference() {
    let order = 1;
    this.userPreference.columns.forEach((b: any) => {
      b.columnOrder = order;
      order++;
    });
    this.service.createUserPreference(this.userPreference).then((response) => {
      this.$store.dispatch("updateUserPreferences");
      this.$emit("applyGear");
      this.toggleGear = false;
    });
  }

  defaultPreference() {
    this.service.getDefaultPreference(this.pageName).then((response) => {
      this.userPreference = response;
      this.$store.dispatch("updateUserPreferences");
      this.$emit("applyGear");
      this.toggleGear = false;
    });
  }

  moveRight() {
    this.availableColumn.columns
      .filter((c) => c.value)
      .forEach((c) => {
        const c1 = this.$vuehelper.clone(c);
        c1.value = false;
        this.userPreference.columns.push(c1);
      });

    this.availableColumn.columns = this.availableColumn.columns.filter(
      (c) => !c.value
    );
  }

  moveLeft() {
    this.userPreference.columns
      .filter((c) => c.value)
      .forEach((c) => {
        if (c.columnName != "accountNumber") {
          const c1 = this.$vuehelper.clone(c);
          c1.value = false;
          this.availableColumn.columns.push(c1);
        } else {
          c.value = false;
        }
      });

    this.userPreference.columns = this.userPreference.columns.filter(
      (c) => !c.value
    );
  }

  startDrag(evt: any, item: any, dragFrom: any) {
    if (item.columnName != "accountNumber") {
      evt.dataTransfer.dropEffect = "move";
      evt.dataTransfer.effectAllowed = "move";
      evt.dataTransfer.setData("itemName", item.columnName);
      evt.dataTransfer.setData("dragFrom", dragFrom);
    }
  }

  onDrop(evt: any, dragTo: string, index: number) {
    evt.preventDefault();
    const itemName = evt.dataTransfer.getData("itemName");
    const dragFrom = evt.dataTransfer.getData("dragFrom");
    if (dragFrom === "availableColumn" && dragTo === "viewableColumn") {
      this.userPreference.columns = this.userPreference.columns.concat(
        this.availableColumn.columns.filter(
          (a: any) => a.columnName === itemName
        )
      );
      this.availableColumn.columns = this.availableColumn.columns.filter(
        (a: any) => a.columnName != itemName
      );
    } else if (dragFrom === "viewableColumn" && dragTo === "availableColumn") {
      this.availableColumn.columns = this.availableColumn.columns.concat(
        this.userPreference.columns.filter(
          (a: any) => a.columnName === itemName
        )
      );
      this.userPreference.columns = this.userPreference.columns.filter(
        (a: any) => a.columnName != itemName
      );
    } else if (
      dragFrom === "viewableColumn" &&
      dragTo === "viewableColumn" &&
      index != 0
    ) {
      let item = this.userPreference.columns.filter(
        (a: any) => a.columnName === itemName
      );
      this.userPreference.columns = this.userPreference.columns.filter(
        (a: any) => a.columnName != itemName
      );
      this.userPreference.columns.splice(index, 0, item[0]);
    }
  }
}
</script>

