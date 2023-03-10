export class TableRowModel {
    status: string;
    valid: boolean;
    selected: boolean;

    columns: Array<TableColumnModel> = [];
}

export class TableColumnModel {
    title: string;

    fieldName: string;
    value: any;
    valid: boolean;
    error: string;
    align: string;
    duplicate: boolean;
    required: (row: TableRowModel) => boolean;

    type: string;
    options: Array<string>;

    edit: boolean;

    constructor() {
        this.required = () => { return true };
    }
}

export class UploadBillingAccountModel {
    accountName: string;
    accountNumber: string;
    advisorCode: string;
    asset: string;
    assetDate: string;
    billToAccount: string;
    billingStartDate: string;
    custodianCode: string;
    endDate: string;
    errors: any;
    feeScheduleRateType: string;
    feeScheduleRate: string;
    householdNumber: string;
    paymentMethod: string;
    startDate: string;
}
export class UploadBillingAssetsModel {
    accountKey: string;
    accountNumber: string;    
    asset: string;
    assetDate: string;
    assetType: string;    
    custodianCode: string;   
    errors: any;
    flowBasis: string;    
}
export class UploadFileInfo {
    uploadedTime: Date;
    name: string;
    rows: number;
}

export class PayeeModel {
    code: string;
    name: string;
    payeeType: string;
}

export class FeeScheduleModel {
    feeScheduleCode: string;
    feeScheduleDescription: string;
}
