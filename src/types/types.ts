export interface UserData {
    userId: string;
    username: string;
    fullName: string;
    email: string;
}

export enum ErrorCodes {
    GENERAL_ERROR = 1000,
    INVALID_REQUEST = 1100,
    INVALID_JSON = 1101,
    INVALID_PARAMETER = 1102,
    RESOURCE_NOT_FOUND = 1103,
    PROCESSING_ERROR = 1104,
    VALIDATION_ERROR = 1200,
    RESOURCE_CONFLICT = 1300,
    RATE_LIMIT_EXCEEDED = 1400,
    SERVICE_UNAVAILABLE = 1500,
    INTERNAL_SERVER_ERROR = 1501,
    AUTHENTICATION_ERROR = 1600,
    INCORRECT_CREDENTIALS = 1601
}

export interface APIError {
    message: string;
    code: ErrorCodes;
}

export interface SidebarMenuItem {
    icon: React.ReactNode;
    label: string;
    link: string;
}

export interface SidebarMenuProps {
    children: React.ReactNode;
    items: SidebarMenuItem[];
}

export type PersonalAccessToken = {
    userId: number
    name: string
    expiresAt: Date
    createdAt: Date
    status: 'active' | 'expired'
}