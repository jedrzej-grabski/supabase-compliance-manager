export interface MfaCheck {
    passing: boolean;
    users: Array<{
        id: string;
        email: string;
        mfaEnabled: boolean;
    }>;
}