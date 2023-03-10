import { Vue } from "vue-property-decorator";
import { AxiosResponse, AxiosError } from "axios";
import { AlertType, UserModel } from '@/model';

export interface IAppLoading {
    showLoader() : void;
    showProgress() : void;
    hide() : void;
}

export class BaseComponent extends Vue {
    error(e: AxiosError) {
        let root: any = this.$root;

        root.$alert(e.message, AlertType.Error);
    }

    alert(message: string, title?: string, type?: string) {
        this.loader.hide();

        let root: any = this.$root;

        root.$alert(message, title, type);
    }

    get loader() : IAppLoading {
        let root: any = this.$root;

        return root.$loader;
    }

    confirm(title: string, message: string, yesButtonText?: string, noButtonText?: string) {
        let root: any = this.$root;

        return root.$confirm(title, message, yesButtonText, noButtonText);
    }

}