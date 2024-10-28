import { Email, Password } from '../common/aliases';

export interface AdobeAccount {
    email(): Promise<Email>;
    password(): Promise<Password>;
    isSubscriptionValid(): Promise<boolean>;
    subscription(): Promise<Subscription>;
}

export interface Subscription {
    isValid(): Promise<boolean>;
    expiresAt(): Promise<Date>;
    refresh(): Promise<void>;
}