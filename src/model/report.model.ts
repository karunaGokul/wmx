import { BaseModel } from './base.model';

export class SummaryModel extends BaseModel {
    change: number;
    feeSummaryStatus: Array<FeeSummaryStatusModel>;
    reports: Array<ReportModel>;
    totalHouseholds: number;
    totalRevenue: number;
}

export class ReportModel {
    adjustmentFee: number;
    endDate: Date;
    isDataAvailabe: boolean;
    lostFee: number;
    newFee: number;
    onCycleFee: number;
    reportName: string;
    reportType: string;
    startDate: Date;
    totalExclusionAmount: number;
    totalFee: number;
    totalHouseholds: number;
    totalMarketValue: number;
}

export class FeeSummaryStatusModel {
    category: string;
    totalFees: number;
}