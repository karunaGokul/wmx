import { DataRequest } from './base.model';

export class UserModel {
    avatar: string;
    externalId: string;
    firstName: string;
    lastName: string;
    nickName: string;
    userName: string;
}

export class UserRequestModel extends DataRequest {
}

export class ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
    confirmPassword?: string;
}

export class ChangeUserNameRequest {
    nickName: string;
}
export class UserPreferenceState {
    userPreferences: Array<UserPreferenceModel>;
}

export class UserPreferenceModel {
    pageName: string;
    columns: Array<UserPreferenceColumnModel>;
}

export class UserPreferenceColumnModel {
    columnName: string;
    columnLabel: string;
    columnOrder: number;
    value: boolean;    
}