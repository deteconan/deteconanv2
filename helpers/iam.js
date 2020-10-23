import googleapis from 'googleapis';
const { google } = googleapis;
const iam = google.iam('v1');
import credentials from '../credentials/admin.json';
import { v4 as uuid } from 'uuid';
import Credentials from '../models/credentials.js';

const jwToken = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    ['https://www.googleapis.com/auth/cloud-platform'],
    null
);

export default class IamHelper {

    static async getServiceAccountIamPolicy(projectId, accountId) {
        const res = await iam.projects.serviceAccounts.getIamPolicy({
            resource: `projects/${projectId}/serviceAccounts/${accountId}`,
            auth: jwToken
        });

        return res.data;
    }

    static async getServiceAccounts(projectId) {
        const res = await iam.projects.serviceAccounts.list({
            name: `projects/${projectId}`,
            auth: jwToken
        });

        return res.data.accounts;
    }

    static async createServiceAccount(projectId) {
        const letter = String.fromCharCode(97+Math.floor(Math.random() * 26));
        let name = uuid().split('-').join('');
        name = letter + name.slice(0, 9);

        const res = await iam.projects.serviceAccounts.create({
            name: `projects/${projectId}`,
            resource: {
                accountId: name,
                serviceAccount: {
                    displayName: name
                }
            },
            auth: jwToken
        });

        await iam.projects.serviceAccounts.setIamPolicy({
            'resource_': `projects/${projectId}/serviceAccounts/${res.data.uniqueId}`,
            resource: {
                policy: {
                    bindings: [
                        {
                            role: 'roles/owner',
                            members: [
                                `serviceAccount:${res.data.email}`
                            ]
                        }
                    ]
                }
            },
            auth: jwToken
        });

        const cred = await this.createServiceAccountCredentials(projectId, res.data.email);

        const credDB = new Credentials(cred);
        await credDB.save();

        return cred;
    }

    static async getServiceAccountKeys(projectId, accountId) {
        const res = await iam.projects.serviceAccounts.keys.list({
            name: `projects/${projectId}/serviceAccounts/${accountId}`,
            auth: jwToken
        });

        return res.data.keys;
    }

    static async createServiceAccountCredentials(projectId, accountId) {
        const res = await iam.projects.serviceAccounts.keys.create({
            name: `projects/${projectId}/serviceAccounts/${accountId}`,
            auth: jwToken
        });

        return JSON.parse(Buffer.from(res.data.privateKeyData, 'base64').toString()); // Decode Base64
    }

}
