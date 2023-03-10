import { AccountFilterModel } from './household.model';
import { UserModel } from './user.model';

export class SessionState {
    filters: AccountFilterModel;

    notifications: number;
    dismissNotification: boolean;

    user: UserModel;
    logo: string;
}