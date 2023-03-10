import { BaseModel, DataRequest } from './base.model';
import { FeeRangeModel, notificationTypeModel } from './feeReport.model';

export class PaymentRequestModel extends DataRequest {
    advisorCode: Array<string>;
    billToAccountId: Array<number>;
    billToAccountNumber: Array<string>;
    cashAvailable: FeeRangeModel = new FeeRangeModel();
    firmCode: string;      
    totalFee: FeeRangeModel = new FeeRangeModel();
    paymentInstitution: Array<string>;
    notificationType:Array<notificationTypeModel>=[];
}

export class PaymentReportModel extends BaseModel {
    billToAccountNumber: string;
    cashAvailable:number;
    id:number;
    manualFlag:boolean;
    paymentInstitution: string;
    totalFee:number; 
    balance:number;    
}

export class PaymentExportRequestModel {
    pageName: string;
    allColumns: boolean;
    requestDTO: PaymentRequestModel = new PaymentRequestModel();
}
