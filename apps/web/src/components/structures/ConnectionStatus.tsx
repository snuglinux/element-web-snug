import React, { useEffect, useState } from 'react';
import SdkConfig from "../../SdkConfig";
import { _t } from "../../languageHandler";
import SettingsStore from "../../settings/SettingsStore";

interface ConnectionStatusProps {
    intervalMs?: number;
}

const DEFAULT_INTERVAL = 3000;

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
    intervalMs = DEFAULT_INTERVAL,
    children,
}) => {
    const [offline, setOffline] = useState(false);

    const showOfflineScreen = SettingsStore.getValue("showOfflineScreen");

    useEffect(() => {
        let isMounted = true;
        let checkTimeout: NodeJS.Timeout;

        const checkServer = async () => {
            const hsUrl = SdkConfig.get().default_server_config?.["m.homeserver"]?.base_url;
            const url = `${hsUrl}/_matrix/client/versions`;

            for (let attempt = 0; attempt < 3; attempt++) {
                try {
                    const resp = await fetch(url, {
                        method: "GET",
                        cache: "no-store",
                    });

                    if (resp.ok) {
                        return true;
                    }
                } catch {}

                if (offline) {
                    break;
                }
            }

            return false;
        };

        const doCheck = async () => {
            if (!isMounted || !showOfflineScreen) return;
            const isOnline = await checkServer();
            setOffline(!isOnline);
            checkTimeout = setTimeout(doCheck, intervalMs);
        };

        doCheck();

        return () => {
            isMounted = false;
            clearTimeout(checkTimeout);
        };
    }, [intervalMs, offline]);

    return (
        <>
            {offline && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 10000,
                        background: "rgba(255,255,255,0.8)"
                    }}
                >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "12px",
                        color: "#000",
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="96"
                        height="96"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M20 16l-4 4" />
                        <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5" />
                        <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5" />
                        <path d="M3 21l2.5 -2.5" />
                        <path d="M18.5 5.5l2.5 -2.5" />
                        <path d="M10 11l-2 2" />
                        <path d="M13 14l-2 2" />
                        <path d="M16 16l4 4" />
                    </svg>

                    <div
                        style={{
                            fontSize: 24,
                            fontWeight: 600,
                        }}
                    >
                        {_t("voip|connection_lost")}
                    </div>
                </div>
            </div>
            )}
            <div
                style={{
                    display: offline ? "none" : "contents",
                }}
            >
                {children}
            </div>
        </>
    );
};

export default ConnectionStatus;
