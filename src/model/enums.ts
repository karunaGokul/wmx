export enum AlertType {
    Success = 1,
    Info = 2,
    Warning = 3,
    Error = 4
}

export enum NotificationStatus {
    PUBLISH,
    APPROVE
}

export enum SufficientFunds {
    "Yes" = "NullOrNotEquals",
    "No" = "Equals"
}

export enum ChangesToData {
    "Fee Schedule" = "FEE_SCHEDULE_ASSIGNMENT",
    "Bill-to Account" = "BILL_TO_ACCOUNT",
    "Household" = "BILLING_HOUSEHOLD",    
    "Advisor Code" = "ADVISOR_CODE",
    "Program/Product" = "BILLING_PROGRAM_PRODUCT",
    "Invoice Group" = "INVOICE_GROUP"
}

export enum ChartColor {
    "Needs Your Approval" = "#f3a739",
    "Waived/Exempted" = "#e53a40",
    "Approved" = "#367FA9",
    "Pending Payment" = "#E3ECE3",
    "Paid" = "#629664",
    "Rejected" = "#F08A8D"
}

export enum RevenueType {
    'On-cycle' = 'OnCycle',
    'New Accounts/Contributions' = 'New',
    'Terminations/Withdrawals' = 'Close',
    'Adjustments' = 'Adjustments',
    'Total' = 'Net'
}

export enum FeeType {
    "Client fee" = "IF",
    "Advisory fee" = "RF"
}

export enum FeeStatusGauge {
    "Needs Your Approval" = "PU",
    "Approved" = "AP",
    "Waived/Exempted" = "RE,CA",
    "Pending Payment" = "PP",
    "Paid" = "CO",
    "Rejected" = "RJ"
}