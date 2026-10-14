import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let firebaseAdminApp: App | null = null;
let firebaseAdminAuth: Auth | null = null;

export function getAdminAuth(): Auth {
  if (!firebaseAdminAuth) {
    if (!getApps().length) {
      firebaseAdminApp = initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } else {
      firebaseAdminApp = getApps()[0];
    }
    firebaseAdminAuth = getAuth(firebaseAdminApp);
  }
  return firebaseAdminAuth;
}
