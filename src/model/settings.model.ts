export class SettingsModel {
    public apiUrl: string;
    public apiPath: string;

    public wmeApiUrl: string;
    public wmeApiPath: string;

    public keycloakUrl: string;
    public keycloakClientId: string;
    public keycloakRealm: string;
    
    public gridPageSize: number;

    public logo: string;
    public styles: any;
    public help: any;

    public legalContent: string;
    public billingEvent: any;
}

export class SettingsState {
    public settings: SettingsModel;
}