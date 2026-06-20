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
      geminiApiKey: process.env.GEMINI_API_KEY,

      eas: {
        projectId: '26fe15ae-da6e-4625-8146-8e7f1a138145',
      },
    },

    android: {
      package: "com.anonymous.plantdiary"
    },

    plugins: [
      "expo-barcode-scanner"
    ]
  }
};