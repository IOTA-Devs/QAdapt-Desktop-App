export interface UserData {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    avatarURL: string;
}

export enum ErrorCodes {
    GENERAL_ERROR = 1000,
    INVALID_REQUEST = 1100,
    INVALID_JSON = 1101,
    INVALID_PARAMETER = 1102,
    FILE_TOO_LARGE = 1103,
    RESOURCE_NOT_FOUND = 1104,
    PROCESSING_ERROR = 1105,
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
    tokenId: number
    userId: number
    name: string
    expiresAt: string
    createdAt: string
    status: 'Active' | 'Expired'
}

export type Test = {
    testId: number
    scriptId: number
    name: string
    startTimestamp: Date
    endTimestamp: Date
    status: 'Passed' | 'Failed' | 'Pending' | 'Warning'
}

export type StatusComponentTypes = "danger" | "warning" | "caution" | "ok" | "info" | "unavailable";

export interface UploadImageProps {
    aspectRatio: number;
    height: string;
    maxImageSizeInMb: number;
    onCrop: (croppedImage: Blob) => void;
}