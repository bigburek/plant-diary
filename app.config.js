import 'dotenv/config';

export default {
    expo: {
        name: 'PlantDiary',
        slug: 'plant-diary',
        scheme: "plantdiary",
        extra: {
            apiKey: process.env.API_KEY,
            authDomain: process.env.AUTH_DOMAIN,
            projectId: process.env.PROJECT_ID,
            storageBucket: process.env.STORAGE_BUCKET,
            messagingSenderId: process.env.SENDER_ID,
            appId: process.env.APP_ID,
        },
        "android": {
            "package": "com.anonymous.plantdiary"
        }


    },
};
