import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

const serviceAccount = JSON.parse(
  readFileSync(path.resolve('firebase-service-account.json'), 'utf-8')
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const auth = admin.auth();
