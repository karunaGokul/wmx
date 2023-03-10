import { BaseService, IBaseService } from './base.service'
import { IBaseModel, UserModel, UserRequestModel, DataEntitlementModel, ExportRequestModel, ChangeUserNameRequest, ChangePasswordRequest, UserPreferenceState, UserPreferenceModel, PayeeModel, FeeScheduleModel } from '@/model';

export interface IUserService extends IBaseService<UserRequestModel, UserModel> {
    getDataEntitlements(): Promise<Array<DataEntitlementModel>>;
    uploadAvatar(file: File): Promise<any>;
    changeUserName(request: ChangeUserNameRequest): Promise<any>;
    changePassword(request: ChangePasswordRequest): Promise<any>;
    getUserPreference(): Promise<UserPreferenceState>;
    createUserPreference(request:UserPreferenceModel): Promise<any>;    
    getPageColumnConfiguration(): Promise<Array<UserPreferenceModel>>;
    getDefaultPreference(pageName: string):Promise<UserPreferenceModel>;
    exportFile(format: string, request: ExportRequestModel): Promise<any>;
    householdExportFile(format: string, request: ExportRequestModel): Promise<any>;    
    getLogo(firmCode: string): Promise<string>;
    getCustodians(payeeType: string): Promise<Array<PayeeModel>>;
    getFeeScheduleCode(firmCode: string): Promise<Array<FeeScheduleModel>>;
}

export class UserService extends BaseService<UserRequestModel, UserModel> implements IUserService {
    constructor() {
        super("user", UserModel);
    }

    getDataEntitlements(): Promise<Array<DataEntitlementModel>> {
        return this.httpGet('dataEntitlement', null, null).then(response => {
            return response.data;
        });
    }

    uploadAvatar(file: File): Promise<any> {
        let formData = new FormData();
        formData.append("uploadImage", file);
        return this.upload(formData, `user/uploadAvatar`)
    }

    changeUserName(request: ChangeUserNameRequest): Promise<any> {
        return this.httpPatch('user', request).then(response => {
            return response.data;
        });
    }

    changePassword(request: ChangePasswordRequest): Promise<any> {
        return this.httpPut('users/changePassword', request).then(response => {
            return response.data;
        });
    }

    getUserPreference(): Promise<UserPreferenceState>{
        return this.httpGet('getUserPreference', null).then(response => {
            return response.data;
        }); 
    }

    createUserPreference(request:UserPreferenceModel): Promise<any>{
        return this.httpPost('createUserPreference', request).then(response => {
            return response.data;
        });
    }

    getPageColumnConfiguration(): Promise<Array<UserPreferenceModel>>{
        return this.httpGet('pageColumnConfiguration/all', null).then(response => {
            return response.data;
        });
    }

    getDefaultPreference(pageName: string):Promise<UserPreferenceModel>{
        return this.httpGet('userPreference/restore?pageName='+pageName,null ).then(response => {
            return response.data;
        });
    }

    public exportFile(format: string, request: ExportRequestModel): Promise<any> {        
       return this.httpPost('approval/export', request, true).then((response) => {
            let fileUrl = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement("a");
            fileLink.href = fileUrl;
            fileLink.setAttribute("download", format);
            fileLink.style.display = "none";
            document.body.appendChild(fileLink);

            fileLink.click();
            document.body.removeChild(fileLink);
            return response.data;
        })
        
    }
    public householdExportFile(format: string, request: ExportRequestModel): Promise<any> {        
        return this.httpPost('household/export', request, true).then((response) => {
             let fileUrl = window.URL.createObjectURL(new Blob([response.data]));
             let fileLink = document.createElement("a");
             fileLink.href = fileUrl;
             fileLink.setAttribute("download", format);
             fileLink.style.display = "none";
             document.body.appendChild(fileLink);
 
             fileLink.click();
             document.body.removeChild(fileLink);
             return response.data;
         })
         
     }

    getLogo(firmCode: string): Promise<string> {
        return this.httpGet('payee/logo', { "firmCode": firmCode }).then(response => {
            return response.data;
        });
    }
    
    getCustodians(payeeType: string): Promise<Array<PayeeModel>> {
        return this.httpGet(`payee/${payeeType}`, null).then(response => {
            return response.data;
        });
    }

    getFeeScheduleCode(firmCode: string): Promise<Array<FeeScheduleModel>> {
        return this.httpGet('feeSchedule/batch', { "firmCode": firmCode }).then(response => {
            return response.data;
        });
    }


}