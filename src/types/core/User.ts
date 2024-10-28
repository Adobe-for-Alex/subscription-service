import { Email, Password } from '../common/aliases';

export interface AccountCredentials {
    email: Email;
    password: Password;
}

export interface User {
    credentials(): Promise<AccountCredentials>;
    hasValidSubscription(): Promise<boolean>;
}