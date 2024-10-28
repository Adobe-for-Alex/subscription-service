import { Session } from '../core/Session';
import { AccountCredentials } from '../core/User';

export interface WebhookNotifier {
    notifyAccountUpdate(session: Session, credentials: AccountCredentials): Promise<void>;
}