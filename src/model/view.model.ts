import { IBaseRequest, IListService, ListItem } from "./base.model";

export class ChartViewModel {
  categories: Array<string> = [];

  fields: Array<ChartFieldViewModel> = [];

  isLogarithmic: boolean = false;
}

export class ChartFieldViewModel {
  name: string;
  data: Array<any> = [];
  color: string;
}

export class FilterViewModel {
  title: string;
  width: number;

  items: Array<FilterItemViewModel>;
}

export class FilterItemViewModel {
  active: boolean;
  request: IBaseRequest;
  service: IListService<IBaseRequest>;

  items: Array<ListItem>;

  get selectedItems() {
    return this.items ? this.items.filter(i => i.selected) : [];
  }

  get valid() {
    return this.data && this.data.valid;
  }

  data: any;

  constructor(
    public id: string,
    public type: string,
    public label: string,
    public column: number = 1
  ) {
    this.active = false;
  }
}

export class DataTableModel {
  rows: Array<DataTableRowModel>;
  columns: Array<DataTableColumnModel>;
}

export class DataTableRowModel {
  items: Array<DataTableCellModel>;

  data: any;
}

export class DataTableCellModel {
  columnName: string;
  value: any;
  columnLabel: string;
  columnOrder: number;
  type: string;
}
export class DataTableColumnModel {
  columnName: string;
  columnLabel: string;
  columnOrder?: number;
}