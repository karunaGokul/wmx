import { ServiceHelper } from './base.service'
import { IBaseModel, SummaryModel } from '@/model';

export interface IReportService {
    getReport(reportType: string, feeType: string): Promise<SummaryModel>;
}

export class ReportService extends ServiceHelper implements IReportService {
    getReport(reportType: string, feeType: string): Promise<SummaryModel> {
        return this.httpGet('report', { "reportType": reportType, "feeType": feeType }).then(response => {
            return response.data;
        });
    }
}