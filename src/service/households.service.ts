import { IBaseService, BaseService } from './base.service';
import { DataResponse, HouseHoldRequestModel, HouseHoldModel, HouseHoldSearchModel, IListService, ListItem, AccountFilterModel, HouseHoldDetailModel } from '@/model';

export interface IHouseHoldService extends IBaseService<HouseHoldRequestModel, HouseHoldModel> {
    getDetail(householdId: number, feeType: string): Promise<HouseHoldDetailModel>;
}

export class HouseHoldService extends BaseService<HouseHoldRequestModel, HouseHoldModel> implements IHouseHoldService, IListService<HouseHoldSearchModel> {
    constructor() {
        super('household', HouseHoldModel)
    }

    getDetail(householdId: number, feeType: string): Promise<HouseHoldDetailModel> {
        return this.httpGet(`${this.path}/${householdId}`, {"feeType": feeType}).then(response => {
            return response.data;
        });
    }

    getItems(request: HouseHoldRequestModel): Promise<DataResponse<HouseHoldModel>> {
        return this.searchPost(request, 'list')
    }

    getListItems(request: HouseHoldSearchModel): Promise<Array<ListItem>> {
        return super.httpGet(request.type ? `${this.path}/search` : `${this.path}/billToAccountSearch`, request).then(response => {
            return response.data
                .map((d: any) => {
                    let item = request.type ? new ListItem(d.name, request.type && request.type.toLowerCase() == "account" ? d.accountId : d.householdId)
                        : new ListItem(d.billToAccountNumber);                                               
                    item.data = d;
                    item.type = d.objectType;

                    return item;
                });
        });
    }

    getFilters(): Promise<AccountFilterModel> {
        return this.httpGet(`${this.path}/defaultFilter`, null).then(response => {
            return response.data;
        });
    }
}