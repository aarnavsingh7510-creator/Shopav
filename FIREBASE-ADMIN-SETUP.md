# Firebase admin setup — Hum Tum Aur Chai

The website files are static HTML and use the Firebase modular SDK from Google's CDN.

## Enable services
1. Firebase Console → Build → Firestore Database → Create database.
2. Choose production mode and a nearby region. Then open the Rules tab and replace the rules with the complete contents of `firestore.rules`; click Publish.
3. Firebase Console → Build → Storage → Get started. Then open Rules, replace with `storage.rules`, and Publish.
4. Authentication → Sign-in method → enable Email/Password. Create the admin user. The admin UID is already allowlisted in both rules files and admin.js.

Storage may require a billing account depending on your Firebase project and current plan. Check Firebase pricing before enabling it.

## Admin
After Vercel deploys, open `/admin.html`, sign in with the admin email/password you created in Firebase Authentication. Do not share the password.

## Notes
- The Firebase web config in firebase-config.js is intended to be public. Access control comes from Firebase Security Rules.
- Never add a service-account private key to this repository.
- Menu cards are read from Firestore when menuItems has records. If the collection is empty, the existing sample cards remain.
- Homepage settings are read from siteContent/home.
