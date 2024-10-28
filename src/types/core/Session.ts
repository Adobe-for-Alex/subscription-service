import { SessionId } from '../common/aliases';
import { User } from './User';
import { AdobeAccount } from './Account';

export interface Session {
    id(): Promise<SessionId>;
    user(): Promise<User>;
    account(): Promise<AdobeAccount>;
    expires(): Promise<Date>;
    extendTo(newExpireDate: Date): Promise<Date>;
    isExpired(): Promise<boolean>;
}

export interface Sessions {
    expired(): Promise<Session[]>;
    active(): Promise<Session[]>;
    open(user: User): Promise<Session>;
    close(id: SessionId): Promise<void>;
    find(id: SessionId): Promise<Session | null>;
}