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
        },
        extra: {
        eas: {
        projectId: '26fe15ae-da6e-4625-8146-8e7f1a138145',
      },
      "plugins": [
    "expo-barcode-scanner"
  ]
    },

    },
};
