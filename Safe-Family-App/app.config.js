import "dotenv/config";

export default
{
  "expo": {
    "name": "Safe-Family-App",
    "slug": "Safe-Family-App",
    "scheme": "safe-family-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon7.png",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/icon7.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      },

    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon7.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false,
      "package": "com.prayer07.SafeFamilyApp",
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        }
      },
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-notifications",
      ]
    ],

    "extra": {
      env: "production",
      "eas": {
        "projectId": "4e78c582-1b13-4d1b-9435-fae13dd5ee22"
      }
    }
  }
}
