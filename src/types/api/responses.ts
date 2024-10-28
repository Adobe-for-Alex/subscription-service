import { Email, Password } from '../common/aliases';

export interface SessionCredentialsResponse {
    email: Email;
    password: Password;
}