import { IBaseService, BaseService } from './base.service';
import { DataResponse, PaymentRequestModel, PaymentReportModel, ListItem, DataRequest, PaymentExportRequestModel } from '@/model';

export interface IPaymentAccountService extends IBaseService<PaymentRequestModel, PaymentReportModel> {
    getAllPaymentInstitutions(): Promise<Array<string>>;
    exportFile(format: string, request: PaymentExportRequestModel): Promise<any>;
}
export class PaymentAccountService extends BaseService<PaymentRequestModel, PaymentReportModel> implements IPaymentAccountService {
    constructor() {
        super('account/billToAccount', PaymentReportModel)
    }

    getItems(request: PaymentRequestModel): Promise<DataResponse<PaymentReportModel>> {
        return this.searchPost(request, `list`)
    }


    getAllPaymentInstitutions(): Promise<Array<string>> {
        return this.httpGet(`billToAccount/paymentInstitution`, null, null).then(response => {
            return response.data;
        });
    }


    getListItems(request: DataRequest): Promise<Array<ListItem>> {
        return super.httpGet(`billToAccount/search`, request).then(response => {
            return response.data
                .map((d: any) => {
                    let item = new ListItem(d.billToAccountNumber);
                    item.data = d;
                    item.type = d.objectType;
                    return item;
                });
        });
    }
    public exportFile(format: string, request: PaymentExportRequestModel): Promise<any> {        
        return this.httpPost(`${this.path}/export`, request, true).then((response) => {
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
}