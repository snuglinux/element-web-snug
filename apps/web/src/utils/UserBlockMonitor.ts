import { MatrixClient, ClientEvent } from "matrix-js-sdk/src/client";
import SettingsStore from "../settings/SettingsStore";
import dispatcher from "../dispatcher/dispatcher";
import { Action } from "../dispatcher/actions";

let installed = false;

export function installUserBlockMonitor(client: MatrixClient): void {
    if (installed || !SettingsStore.getValue("kickBlockedUser")) return;
    installed = true;

    client.on(ClientEvent.Sync, (state, prevState, data: any) => {
        if (state !== "ERROR") return;

        const err = data?.error;

        if (err?.errcode === "M_USER_LOCKED") {
            dispatcher.dispatch({
                action: "logout",
            });
        }
    });
}
