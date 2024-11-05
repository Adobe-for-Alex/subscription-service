import Adobe from './Adobe';
import Account from '../account/Account';
import Mail from '../mail/Mail';
import axios from 'axios';

export default class AdobeApi implements Adobe {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async account(mail: Mail): Promise<Account> {
    try {
      const response = await axios.post(`${this.baseUrl}/accounts`, {
        email: await mail.address(),
        password: await mail.password()
      });

      return {
        mail: async () => mail,
        subscribed: async () => response.data.subscribed || false,
        delete: async () => {
          await axios.delete(`${this.baseUrl}/accounts/${response.data.id}`);
          await mail.delete();
        }
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error';
      throw new Error(`Failed to create Adobe account: ${errorMessage}`);
    }
  }
}