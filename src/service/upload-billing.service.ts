import { IBaseService, BaseService, ServiceHelper } from './base.service';
import { UploadBillingAccountModel, UploadBillingAssetsModel } from '@/model';

export interface IUploadBillingService {
    uploadFile(file: File): Promise<Array<UploadBillingAccountModel>>;
    submit(request: Array<UploadBillingAccountModel>): Promise<Array<UploadBillingAccountModel>>;
    validate(request: UploadBillingAccountModel): Promise<UploadBillingAccountModel>;
    getDefault(): Promise<Array<UploadBillingAccountModel>>;
    uploadAssetsFile(file: File): Promise<Array<UploadBillingAssetsModel>>;
    submitAssets(request: Array<UploadBillingAssetsModel>): Promise<Array<UploadBillingAssetsModel>>;
    validateAssets(request: UploadBillingAssetsModel): Promise<UploadBillingAssetsModel>;
}

export class UploadBillingService extends ServiceHelper implements IUploadBillingService {
    path: string = 'manualAccount';

    getDefault(): Promise<Array<UploadBillingAccountModel>> {
        return this.httpGet(`${this.path}`, null).then((response) => {
            return response.data;
        });
    }

    uploadAssetsFile(file: File): Promise<Array<UploadBillingAssetsModel>> {
        let formData = new FormData();
        formData.append("file", file);

        return this.upload(formData, `${this.path}/assets/upload`)
    }

    submitAssets(request: Array<UploadBillingAssetsModel>): Promise<Array<UploadBillingAssetsModel>> {
        return this.httpPost(`${this.path}/assets`, request).then((response) => {
            return response.data;
        });
    }

    validateAssets(request: UploadBillingAssetsModel): Promise<UploadBillingAssetsModel> {
        return this.httpPost(`${this.path}/assets/validate`, request).then((response) => {
            return response.data;
        });
    }

    uploadFile(file: File): Promise<Array<UploadBillingAccountModel>> {
        let formData = new FormData();
        formData.append("file", file);

        return this.upload(formData, `${this.path}/upload`)
    }

    submit(request: Array<UploadBillingAccountModel>): Promise<Array<UploadBillingAccountModel>> {
        return this.httpPost(`${this.path}`, request).then((response) => {
            return response.data;
        });
    }

    validate(request: UploadBillingAccountModel): Promise<UploadBillingAccountModel> {
        return this.httpPost(`${this.path}/validate`, request).then((response) => {
            return response.data;
        });
    }

}