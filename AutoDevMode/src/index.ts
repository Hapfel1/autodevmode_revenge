import { logger } from "@vendetta";
import { FluxDispatcher } from "@vendetta/metro/common";

interface UserSettingsProtoUpdate {
  type: string;
  settings: {
    proto: {
      developerMode: {
        value: boolean;
      };
    };
  };
  local: boolean;
}

interface SettingsUpdateEvent {
  settings?: {
    proto?: {
      developerMode?: {
        value: boolean;
      };
    };
  };
}

let unpatch: (() => void) | undefined;

export default {
  onLoad: (): void => {
    const enableDevMode = (): void => {
      try {
        const updatePayload: UserSettingsProtoUpdate = {
          type: "USER_SETTINGS_PROTO_UPDATE",
          settings: {
            proto: {
              developerMode: {
                value: true
              }
            }
          },
          local: true
        };

        FluxDispatcher.dispatch(updatePayload);

        logger.log("[Auto DevMode] Developer mode enabled");
      } catch (error) {
        logger.error("[Auto DevMode] Failed to enable developer mode:", error);
      }
    };

    // Enable immediately on load
    enableDevMode();

    // Listen for settings changes and re-enable if disabled
    const listener = (event: SettingsUpdateEvent): void => {
      if (event?.settings?.proto?.developerMode?.value === false) {
        setTimeout(enableDevMode, 100);
      }
    };

    FluxDispatcher.subscribe("USER_SETTINGS_PROTO_UPDATE", listener);

    unpatch = (): void => {
      FluxDispatcher.unsubscribe("USER_SETTINGS_PROTO_UPDATE", listener);
    };
  },

  onUnload: (): void => {
    unpatch?.();
  }
};
