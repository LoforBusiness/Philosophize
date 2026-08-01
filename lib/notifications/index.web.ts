import { stubNotifications } from './stub';

// Browsers get nothing. The web build exists so screens can be verified without
// a device (see CLAUDE.md §21); scheduling is not part of that.
export const notifications = stubNotifications;
export * from './types';
