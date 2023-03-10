import store from '@/store';

export interface IBaseModel {

}

export class BaseModel implements IBaseModel {
    
}

export interface IBaseRequest {
    sortColumn: string;
    ascending: boolean;
    page: number;
    pageSize: number;
    totalResults: number;
    totalPages: number;
    search: string;

    _skipPaging: boolean;
    _loading: boolean;
}

export interface Dictionary<T> {
    [index: string]: T;
}

export class DataRequest implements IBaseRequest {
    sortColumn: string;
    ascending: boolean = true;
    firstRow: number = 0;
    page: number = 1;
    pageSize: number = store.getters.settings.gridPageSize;
    totalResults: number;
    totalPages: number;
    search: string;

    _key: number = 0;
    _skipPaging: boolean = false;
    _loading: boolean = false;

    sorts: Array<SortModel> = undefined;
}

export class SortModel {
    sortColumn: string;
    ascending: boolean = true;
}

export class PageInfo {
    totalResults: number;
    pageSize: number;
    page: number;
    sortColumn: string;
    ascending: boolean;
    totalPages: number;
}

export class DataResponse<T> {
    data: Array<T> = [];

    pageInfo: PageInfo = new PageInfo();
    loading: boolean = false;
}

export class ListItem {
    constructor(public text: string, public value?: string) {
        if (!this.value) this.value = this.text;
    }

    data: any;
    selected: boolean = false;
    type: string;
    hidden: boolean = false;
}

export interface IListService<R extends IBaseRequest> {
    getListItems(request: R): Promise<Array<ListItem>>;
}