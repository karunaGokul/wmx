import { Vue, Provide } from "vue-property-decorator";

import { IUserService, UserService } from '@/service';
import { IReportService, ReportService } from '@/service';
import { IHouseHoldService, HouseHoldService } from '@/service';
import { IApprovalService, ApprovalService } from '@/service';
import { IUploadBillingService, UploadBillingService } from '@/service';
import { IPaymentAccountService, PaymentAccountService } from '@/service';

export class DIContainer extends Vue {
    @Provide('userService') repCodeService: IUserService = new UserService();
    @Provide('reportService') reportService: IReportService = new ReportService();
    @Provide('householdService') householdService: IHouseHoldService = new HouseHoldService();
    @Provide('approvalService') approvalService: IApprovalService = new ApprovalService();
    @Provide('uploadBillingService') uploadBillingService: IUploadBillingService = new UploadBillingService();
    @Provide('paymentService') paymentService: IPaymentAccountService = new PaymentAccountService();
}