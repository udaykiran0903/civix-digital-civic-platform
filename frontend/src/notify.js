const EVENT_NAME = "civix:notify";

export const notify = (message, type = "success", duration = 2600) => {
  if (!message) return;

  window.dispatchEvent(
    new CustomEvent(EVENT_NAME, {
      detail: {
        id: Date.now() + Math.random(),
        message,
        type,
        duration,
      },
    }),
  );
};

export const notifySuccess = (message, duration) =>
  notify(message, "success", duration);

export const notifyError = (message, duration) =>
  notify(message, "error", duration);

export const notifyInfo = (message, duration) =>
  notify(message, "info", duration);

export const NOTIFY_EVENT_NAME = EVENT_NAME;
