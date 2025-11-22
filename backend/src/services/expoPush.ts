import axios from "axios";

export async function sendPushNotification(
  expoPushToken: string,
  title: string,
  body: string,
  data: Record<string, string> = {}
) {
  try {
    const message = {
      to: expoPushToken,
      sound: "default",
      title,
      body,
      data,
    };

    const res = await axios.post(
      "https://exp.host/--/api/v2/push/send",
      message,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Push notification sent successfully");
    return res.data;
  } catch (error: any) {
    console.error(
      "❌ Error sending push notification:",
      error.response?.data || error.message
    );
    throw error;
  }
}