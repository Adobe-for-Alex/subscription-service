import { Sessions } from './Session';
import { WebhookNotifier } from '../webhook/Notifier';

export interface Service {
    sessions(): Promise<Sessions>;
    webhook(): Promise<WebhookNotifier>;
}

export interface ServiceFactory {
    create(): Promise<Service>;
}