import moment from 'moment';

export class VueHelperProvider {

    clone<T>(object: T): T {
        return this._clone(object);
    }

    getImageUrl(blobText: string) {
        return `data:image/png;base64, ${blobText}`
    }

    private _clone(object: any) {
        let cloned: any = new (<any>object).constructor();

        for (let key in object) {
            try {
                cloned[key] = object[key];

                if (typeof object[key].getMonth === "function") {
                    let date = new Date(object[key]);
                    if (isNaN(date.getFullYear()))
                        date = null;

                    cloned[key] = date;
                }
                else if (typeof object[key] === "object")
                    cloned[key] = this._clone(object[key]);
            }
            catch (e) { //error  
            }
        }
        return cloned;
    }
}

class DateHelper {
    format(date: Date, format?: string) {
        if (!format) format = "MM/DD/YYYY";

        if (date)
            return moment(date).format(format);
        else
            return "";
    }

    getString(date: Date) : any {
        return `${date.getFullYear()}-${("0" + (date.getMonth() + 1)).slice(-2)}-${("0" + date.getDate()).slice(-2)}`;
    }
}
