import { BaseModel, DataRequest, Dictionary } from './base.model';
import { FeeRangeModel, DateRangeModel, FeeReportModel } from './feeReport.model';
import { ReportModel } from './report.model';

export class HouseHoldModel extends BaseModel {
    accounts: Array<AccountModel>;
    custodians: Array<string>;
    householdId: number;
    householdName: string;
    householdNumber: string;
    repCodes: Array<string>;
    startDate: string;
    totalAccounts: number;
    totalAssets: number;
}

export class AccountModel {
    accountId: number;
    accountName: string;
    accountNumber: string;
    assetsPercent: number;
    billingStartDate: Date;
    custodian: string;
    feeScheduleCode: string;
    householdId: number;
    householdName: string;
    householdNumber: string;
    marketValue: number;
    repCode: string;
    terminationDate: string;
}


export class HouseHoldRequestModel extends DataRequest {
    accountId: Array<number>;
    advisorCode: Array<string>;
    billingFrequency: Array<string>;
    billingMethod: Array<string>;
    billingStartDate: DateRangeModel;
    custodianCode: Array<string>;
    firmCode: string;
    householdId: Array<number>;
    managerCode: Array<string>;
    marketValue: FeeRangeModel;
    product: Array<string>;
    program: Array<string>;
    styleCode: Array<string>;
    valuationMethod: Array<string>;
}


export class HouseHoldSearchModel extends DataRequest {
    // search: string;
    type?: string;
}

export class AccountFilterModel extends BaseModel {
    billingFrequency: Dictionary<string> = {};
    billingMethod: Dictionary<string> = {};
    custodian: Dictionary<string> = {};
    manager: Dictionary<string> = {};
    product: Dictionary<string> = {};
    program: Dictionary<string> = {};
    style: Dictionary<string> = {};
    valuationMethod: Dictionary<string> = {};

    periods: Array<BillingPeriod> = [];
    status: Dictionary<Array<string>> = {};
}

export class BillingPeriod {
    startDate: Date;
    endDate: Date;
    name: string;
}


export class HouseHoldDetailModel {
    adjustmentRevenue: number;
    deposit: number;
    effectiveRate: number;
    endDate: Date;
    excludedFromBilling: number;
    feesByBillingPeriod: Dictionary<Array<FeeReportModel>>;
    householdName: string;
    inception: number;
    lostRevenue: number;
    netFee: number;
    newRevenue: number;
    onCycle: number;
    reports: Array<ReportModel>;
    startDate: Date;
    termination: number;
    totalAccounts: number;
    totalAssets: number;
    totalBookAssetsPercent: number;
    withdrawal: number;
}