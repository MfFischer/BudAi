// firebase.js
const admin = require('firebase-admin');
const path = require('path');

function getFirebaseAdmin() {
    if (!admin.apps.length) {
        const serviceAccount = require('../firebase-key.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase initialized successfully');
    }
    return admin;
}

const firebaseAdmin = getFirebaseAdmin();
const db = firebaseAdmin.firestore();

module.exports = { admin: firebaseAdmin, db };