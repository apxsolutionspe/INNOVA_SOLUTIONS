import { registerSW } from 'virtual:pwa-register';

export const updateServiceWorker = registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    setInterval(() => {
      if (!document.hidden) {
        void registration.update();
      }
    }, 60 * 60 * 1000);
  },
});
