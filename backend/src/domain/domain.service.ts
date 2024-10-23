import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { ConfigService } from '@nestjs/config';
import { response } from 'express';
import { PythonShell } from 'python-shell';


@Injectable()
export class DomainService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getDomainInfo(domain: string): Promise<any> {
    const hunterKey = this.configService.get('HUNTER_API_KEY');
    console.log('api: ', hunterKey);
    const url = `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${hunterKey}`;

    try {
      const response: AxiosResponse = await this.httpService
        .get(url)
        .toPromise();
      const processedData = this.extractEmails(response.data);
      console.log('processedData: ', processedData);
      const finalRes = this.checkEmails(processedData);
      return finalRes;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch domain info',
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async getEmails(email: string): Promise<any> {
    const apiKey = this.configService.get('HAVEIBEENPWNE_API_KEY');
    console.log('have been pawned api key: ', apiKey);
    console.log('email: ', email);
    const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`;

    try {
      const response: AxiosResponse = await this.httpService
        .get(url, {
          headers: {
            'hibp-api-key': apiKey,
          },
        })
        .toPromise();
      console.log('Response Status:', response.status);
      const state =
        response.data.length > 0 &&
        response.data.every((item) => item.hasOwnProperty('Name'));
        this.searchIntelx(email);
      console.log('state: ', state);

      return {
        res: response.data,
        state,
      };
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          console.error('Resource not found (404)');
          // throw new HttpException(
          //   'Resource not found',
          //   HttpStatus.NOT_FOUND,
          // );
        }
      }
    }
  }

  private extractEmails(data: any): string[] {
    const emails = data?.data?.emails;
    if (!emails) {
      return ['Nothing found'];
    }
    return emails.map((email: { value: string }) => email.value);
  }

  //   import { Injectable } from '@nestjs/common';
  // import { HttpService } from '@nestjs/axios';
  // import { AxiosResponse } from 'axios';
  // import { ConfigService } from '@nestjs/config';
  // import { YourDatabaseService } from './your-database.service'; // Import your database service

  async checkEmails(emails: string[]): Promise<any[]> {
    const apiKey = this.configService.get('HAVEIBEENPWNE_API_KEY');
    console.log('Have I Been Pwned API Key:', apiKey);

    const results = [];

    for (const email of emails) {
      console.log('Checking email:', email);
      const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${email}`;
      console.log('how many times: ', url);

      try {
        const response: AxiosResponse = await this.httpService
          .get(url, {
            headers: {
              'hibp-api-key': apiKey,
            },
          })
          .toPromise();

        console.log('Response Status:', response.status);

        // Check if there are breaches for the email
        const breached = response.data.length > 0;
        console.log(`Breached status for ${email}:`, breached);

        // Save the result to the results array
        results.push({ email, breached, data: response.data });

        // Optionally save to the database here
        // await this.yourDatabaseService.saveEmailCheckResult(email, breached, response.data);
      } catch (error) {
        results.push({ email, breached: false, data: [] });
        // if (error.response) {
        //     if (error.response.status === 404) {
        //         console.error(`Email not found in breaches: ${email} (404)`);
        //         results.push({ email, breached: false, data: [] });
        //         console.log('Results:', results);
        //         console.log('--------------------------------------;');
        //         console.log('email:', email);
        //     } else {
        //         console.error(`Error checking email alooo ${email}:`, error.response.statusd);
        //     }
        // } else {
        //     console.error(`Error checking email aloo 2 ${email}:`, error.message);
        // }
      }
    }

    console.log('Final results:', results);
    return results;
  }






  async searchIntelx(query: string): Promise<any> {
    const options = {
      args: [query, '2014-01-01 00:00:00', '2014-02-02 23:59:59'],
    };

    return new Promise((resolve, reject) => {
      PythonShell.run('src/domain/intelx_search.py', options).then((results) => {
        console.log('Results:', results);
        resolve(results);
      });
    });
  }


}
