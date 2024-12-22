// This function registers our service worker
const register = async () => {
  if ('serviceWorker' in navigator) {  // Remove production check
    try {
      const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        return;
      }

      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      console.log('Registering service worker from:', swUrl);  // Debug log
      
      const registration = await navigator.serviceWorker.register(swUrl);
      console.log('Service Worker registered successfully:', registration);

      return registration;
    } catch (error) {
      console.error('Error during service worker registration:', error);
      throw error;
    }
  }
};;

// This function unregisters the service worker
const unregister = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('Service Worker unregistered successfully');
    } catch (error) {
      console.error('Error during service worker unregistration:', error);
    }
  }
};

export { register, unregister };