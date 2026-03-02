"use client";

import { useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { getToken } from "@/lib/auth";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationRegister() {
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    const registerPush = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const existingSub = await registration.pushManager.getSubscription();
        if (existingSub) return;

        const { publicKey } = await apiClient.get<{ publicKey: string }>(
          "/api/push/vapid-public-key"
        );
        if (!publicKey) return;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey).buffer as ArrayBuffer,
        });

        const json = subscription.toJSON();
        await apiClient.post("/api/push/subscribe", {
          endpoint: json.endpoint,
          p256dh: json.keys?.p256dh,
          auth: json.keys?.auth,
        });
      } catch (err) {
        console.error("Push subscription failed:", err);
      }
    };

    registerPush();
  }, []);

  return null;
}
