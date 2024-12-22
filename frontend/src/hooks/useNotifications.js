import { useState, useEffect } from 'react';

function useNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState(null);

  // Get VAPID public key from backend
  const getVapidPublicKey = async () => {
    try {
      console.log('Fetching VAPID public key...');
      const response = await fetch('http://localhost:8000/vapid-public-key/');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received VAPID public key:', data.public_key);
      return data.public_key;
    } catch (error) {
      console.error('Failed to get VAPID key:', error);
      setError('Failed to get VAPID key: ' + error.message);
      throw error;
    }
  };

  // Subscribe to push notifications
  const subscribeUser = async () => {
    try {
      console.log('Starting subscription process...');
      
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported in this browser');
      }

      // Check if service worker is registered
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log('Current service worker registrations:', registrations);

      if (registrations.length === 0) {
        throw new Error('No service worker registered. Please check your service worker registration.');
      }

      // Get the active service worker registration
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker registration status:', registration.active ? 'Active' : 'Inactive');

      if (!registration.active) {
        throw new Error('Service Worker is registered but not active');
      }

      const vapidPublicKey = await getVapidPublicKey();
      
      // Check if we already have a push subscription
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Found existing push subscription:', existingSubscription);
        setIsSubscribed(true);
        setSubscription(existingSubscription);
        return true;
      }

      // Convert VAPID key to Uint8Array
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      // Create subscription
      console.log('Creating push subscription...');
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      });
      console.log('Push subscription created:', pushSubscription);

      // Send subscription to backend
      const response = await fetch('http://localhost:8000/push-subscriptions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: pushSubscription.endpoint,
          auth: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(pushSubscription.getKey('auth')))),
          p256dh: btoa(String.fromCharCode.apply(null, 
            new Uint8Array(pushSubscription.getKey('p256dh'))))
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to store subscription: ${response.status}`);
      }

      setIsSubscribed(true);
      setSubscription(pushSubscription);
      setError(null);
      console.log('Successfully subscribed to push notifications');
      return true;
    } catch (error) {
      console.error('Subscription process failed:', error);
      setError(error.message);
      return false;
    }
  };

  // Helper function to convert VAPID key (unchanged)
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Check initial state on mount
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        console.log('Checking push notification support...');
        
        if (!('serviceWorker' in navigator)) {
          throw new Error('Service Worker not supported');
        }
        
        if (!('PushManager' in window)) {
          throw new Error('Push notifications not supported');
        }

        console.log('Push notifications are supported');
        setIsSupported(true);
        
        // Check for service worker registration
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('Found service worker registrations:', registrations);

        // Check if already subscribed
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready state:', registration.active ? 'Active' : 'Inactive');
        
        const existingSubscription = await registration.pushManager.getSubscription();
        console.log('Existing subscription:', existingSubscription);
        
        setIsSubscribed(!!existingSubscription);
        setSubscription(existingSubscription);
      } catch (error) {
        console.error('Error in subscription check:', error);
        setError(error.message);
      }
    };

    checkSubscription();
  }, []);

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe: subscribeUser,
    error
  };
}

export default useNotifications;