import { BaseModel, DataRequest } from './base.model';

export class FeeReportModel extends BaseModel {
    feeId: number;
    accountName: string;
    accountNumber: string;
    annualRate: number;
    program: string;
    billingEvent: string;
    householdNumber: string;
    householdName: string;
    custodianCode: string;
    advisorCode: string;
    advisorName: string;
    managerCode: string;
    styleCode: string;
    programDescription: string;
    product: string;
    feeReportAmount: number;
    marketValue: number;
    totalAUM: number;
    billingPeriodName: string;
    accountClassification: string;
    cashAvailable: number;
    priorFeeAmount: number;
    priorFeeMarketValue: number;
    externalAccountId: string;
    paymentMethod: string;
    paymentInformation: string;
    manualFlag: boolean;
    firmCode: string;
    billingMethod: string;
    billingFrequency: string;
    externalFeeId: string;
    originalFeeId: string;
    feeScheduleCode: string;
    feeScheduleDescription: string;
    billingStartDate: string;
    eventDate: string;
    feeStartDate: string;
    feeEndDate: string;
    feeReportDate: string;
    feeExportDate: string;
    status: string;
}

export class FeeRequestModel extends DataRequest {
    accountId: Array<number>;
    advisorCode: Array<string>;
    annualRate: FeeRangeModel = new FeeRangeModel();
    billingEvent: Array<string>;
    custodianCode: Array<string>;
    feeAmount: FeeRangeModel = new FeeRangeModel();
    firmCode: string;
    householdId: Array<number> = [];
    managerCode: Array<string>;
    product: Array<string>;
    program: Array<string>;
    status: Array<string>;
    styleCode: Array<string>;
    feeTypeCode: string = "IF";
    feeReportStartDate: DateRangeModel;
    feeReportEndDate: DateRangeModel;
    notificationType: Array<notificationTypeModel>=[];
    feeAmountVariance: FeeRangeModel = new FeeRangeModel();
    feeAumVariance: FeeRangeModel = new FeeRangeModel();
    feeAum: FeeRangeModel = new FeeRangeModel();
}

export class FeeRangeModel {
    range: string;
    value: number;
    lowerBoundValue?:number;
}

export class notificationTypeModel {
    comparator: string;
    value: string;
    isSufficientFund?:boolean;
}

export class DateRangeModel {
    constructor(public comparator: string, public date: Date) { }
}
export class ExportRequestModel {
    pageName: string;
    allColumns: boolean;
    requestDTO: FeeRequestModel = new FeeRequestModel();
}