import { ApiAuthRepository } from "nfx-ui/apis";
import { authEventEmitter, authEvents } from "nfx-ui/events";
import { AuthStore, clearAuth } from "nfx-ui/stores";

export async function logoutSession() {
  const { refreshToken, currentAccountId } = AuthStore.getState();
  if (refreshToken) {
    try {
      await new ApiAuthRepository().Logout({ refreshToken });
    } catch {
      // Local session must still be cleared if revoke fails.
    }
  }
  if (currentAccountId) authEventEmitter.emit(authEvents.LOGOUT, currentAccountId);
  clearAuth();
}
