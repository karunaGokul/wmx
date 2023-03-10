import axios from 'axios';
import { AxiosResponse, AxiosError, AxiosRequestConfig, ResponseType } from 'axios'
import { stringify } from 'qs';
import { plainToClass } from 'class-transformer';

import store from '@/store';
import { DataResponse, IBaseModel, IBaseRequest, PageInfo, ListItem, DataRequest } from '@/model';

export interface IBaseService<R extends IBaseRequest, T extends IBaseModel> {
    getItem(id: string, endPoint?: string): Promise<T>;
    getItems(request: R, endPoint?: string): Promise<DataResponse<T>>;

    search(request: R, endPoint?: string): Promise<DataResponse<T>>;

    post(data: T, endPoint?: string): Promise<T>;
    put(data: T, endPoint?: string): Promise<T>;
    delete(id: string, endPoint?: string): Promise<boolean>;
    export(request: R, fileName: string, endPoint?: string): void;
}

export interface EntityType<T> {
    new(): T;
}

export abstract class ServiceHelper {
    protected baseUrl: string = store.getters.settings.apiUrl;

    protected apiUrl: string = `${this.baseUrl}/${store.getters.settings.apiPath}`;

    private cancelToken = axios.CancelToken;
    private source: any;


    protected deserialize<T>(classType: EntityType<T>, source: any): T {
        let raw = plainToClass<T, any>(classType, source);

        let item: T = raw;

        return item;
    }

    httpGet(route: string, request: any, responseType?: ResponseType): Promise<AxiosResponse<any>> {
        let params: any = {};
        if (request) {
            for (let key in request) {
                if (key.charAt(0) != "_") {
                    if (request[key] instanceof Date) {
                        let dateString: any = request[key];

                        let date: Date = new Date(dateString);

                        if (date)
                            params[key] = `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
                    }
                    else {
                        let value: any = request[key];

                        if (value || value === false)
                            params[key] = request[key];
                    }
                }
            }
        }

        let path = `${this.apiUrl}/${route}`;
        this.source = this.cancelToken.source();
        let config: AxiosRequestConfig = {
            params: params,
            'paramsSerializer': params => {
                return stringify(params, { arrayFormat: 'repeat' })
            },
            cancelToken: this.source.token
        };

        if (responseType) config.responseType = responseType;
        return axios.get<any>(path, config);
    }


    protected httpPost(route: string, data: any, blob?: boolean): Promise<AxiosResponse<any>> {
        let path = `${this.apiUrl}/${route}`;

        if (blob)
            return axios.post(path, data, {
                responseType: 'blob'
            });
        else return axios.post(path, data);
    }

    protected httpPut(route: string, data: any): Promise<AxiosResponse<any>> {
        let path = `${this.apiUrl}/${route}`;

        return axios.put(path, data);
    }

    protected httpDelete(route: string): Promise<AxiosResponse<any>> {
        let path = `${this.apiUrl}/${route}`;

        return axios.delete(path);
    }

    protected httpPatch(route: string, data: any): Promise<AxiosResponse<any>> {
        let path = `${this.apiUrl}/${route}`;

        return axios.patch(path, data);
    }

    upload(formData: FormData, route: string) {
        let path = `${this.apiUrl}/${route}`;

        let config: AxiosRequestConfig = { headers: { 'Content-Type': 'multipart/form-data' } };

        return axios.post(path, formData, config).then(response => {
            return response.data;
        });
    }

    protected abortRequest() {
        if (this.source)
            this.source.cancel();
        this.source = null;
    }
}

export class BaseService<R extends IBaseRequest, T extends IBaseModel> extends ServiceHelper {
    protected eType: EntityType<T>;

    constructor(protected path: string, private _eType: any) {
        super();

        this.eType = _eType;
    }

    protected format(item: T) { }

    protected construct(data: any) {
        if (this.eType) {
            let item: T = this.deserialize<T>(this.eType, data);

            this.format(item);
            return item;
        }
        else
            return data;
    }

    getItem(id: string, endPoint?: string): Promise<T> {
        let path = this.path;
        if (endPoint) path = `${path}/${endPoint}`;

        if (id)
            path = `${path}/${id}`;

        return this.httpGet(path, null).then(
            (response: AxiosResponse) => {
                let result: T;
                if (response.data)
                    result = this.construct(response.data);

                return result;
            },
            (reason: AxiosError) => {
                return null;
            }
        );
    }


    getItems(request: R, endPoint?: string): Promise<DataResponse<T>> {
        let path = this.path;
        if (endPoint) path = `${path}/${endPoint}`;

        if (request._skipPaging) {
            request.page = undefined;
            request.pageSize = undefined;
        }

        request._loading = true;
        return this.httpGet(path, request).then(
            (response: AxiosResponse) => {
                request._loading = false;

                let result = new DataResponse<T>();

                if (response.data) {
                    let items: T[] = [];

                    if (response.data.data) {
                        response.data.data.forEach((item: any) => {
                            items.push(this.construct(item));
                        });
                    }

                    result = response.data;
                    result.data = items;
                }

                return result;
            },
            (reason: AxiosError) => {
                request._loading = false;

                throw reason;
            }
        );
    }

    post(data: T, endPoint?: string): Promise<T> {
        let path = this.path;
        if (endPoint) path = `${path}/${endPoint}`;

        return this.httpPost(path, data).then(response => {
            return response.data;
        });
    }

    search(request: R, endPoint?: string): Promise<DataResponse<T>> {
        return this.getItems(request);
    }

    put(data: T, endPoint?: string): Promise<T> {
        let path = this.path;
        if (endPoint) path = `${path}/${endPoint}`;

        return this.httpPut(path, data).then(response => {
            return response.data;
        });
    }

    delete(id: string): Promise<boolean> {
        let path = `${this.path}/${id}`;

        return this.httpDelete(path).then((response: AxiosResponse) => {
            return true;
        });
    }

    export(request: R, fileName: string, endPoint?: string): void {
        let path = `${this.path}/export`;
        if (endPoint) path = endPoint;

        this.httpGet(path, request, "blob").then(response => {
            let fileUrl = window.URL.createObjectURL(new Blob([response.data]));
            let fileLink = document.createElement("a");
            fileLink.href = fileUrl;
            fileLink.setAttribute("download", fileName);
            fileLink.style.display = "none";
            document.body.appendChild(fileLink);

            fileLink.click();
            document.body.removeChild(fileLink);
        });
    }

    protected searchPost(request: R, endPoint?: string): Promise<DataResponse<T>> {
        if (request._skipPaging) {
            request.page = undefined;
            request.pageSize = undefined;
        }

        request._loading = true;

        let path = this.path;
        if (endPoint) path = `${path}/${endPoint}`;

        return this.httpPost(path, request).then(
            (response: AxiosResponse) => {
                request._loading = false;

                let result = new DataResponse<T>();

                if (response.data) {
                    let items: T[] = [];

                    if (response.data.data) {
                        response.data.data.forEach((item: any) => {
                            items.push(this.construct(item));
                        });
                    }

                    result = response.data;
                    result.data = items;
                }

                return result;
            },
            (reason: AxiosError) => {
                request._loading = false;

                throw reason;
            }
        );
    }
}


export class BaseMockService<R extends IBaseRequest, T extends IBaseModel> {
    getItem(id: string): Promise<T> {
        return null;
    }

    getItems(request: R): Promise<DataResponse<T>> {
        return new Promise((resolve, reject) => {
            resolve(new DataResponse<T>());
        });
    }

    search(request: R, endPoint?: string): Promise<DataResponse<T>> {
        return this.getItems(request);
    }

    post(data: T, endPoint?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            resolve(data);
        });
    }

    put(data: T, endPoint?: string): Promise<T> {
        return new Promise((resolve, reject) => {
            resolve(data);
        });
    }

    delete(id: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    }

    export(request: R, fileName: string, endPoint?: string): void {

    }
}
