export class DataEntitlementModel {
    advisors: Array<string>;
    dataEntitlementId: number;
    firmCode: string;
}

export class DataEntitlementState {
    dataEntitlements: Array<DataEntitlementModel> = [];
    advisor: string = "";
    firm: string = "";
}
