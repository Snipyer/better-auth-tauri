import { isTauri } from "@tauri-apps/api/core"
import { openUrl } from "@tauri-apps/plugin-opener"
import { platform } from "@tauri-apps/plugin-os"

import type { BetterFetchOption } from "better-auth/client"
import type { AuthClient } from "../types/auth-client"
import type { FetchError } from "../types/fetch-error"

const isOpenerEnabled = () =>
    isTauri() &&
    (window.location.protocol === "tauri:" || platform() !== "macos")

export type LinkSocialParams = Parameters<AuthClient["linkSocial"]>[0]

type LinkSocialData = { redirect: boolean; url?: string }
type LinkSocialResult = {
    data: LinkSocialData | null
    error: FetchError | null
}

export interface LinkSocialProps extends LinkSocialParams {
    authClient: AuthClient
}

export function linkSocial(params: LinkSocialProps): Promise<LinkSocialResult>

export function linkSocial(
    params: Omit<LinkSocialProps, "fetchOptions"> & {
        fetchOptions: Omit<BetterFetchOption, "throw"> & { throw: true }
    }
): Promise<LinkSocialData>

export async function linkSocial({
    authClient,
    fetchOptions,
    callbackURL,
    ...rest
}: LinkSocialProps): Promise<LinkSocialData | LinkSocialResult> {
    const openerEnabled = isOpenerEnabled()
    const params: LinkSocialParams = {
        ...rest,
        disableRedirect: openerEnabled,
        callbackURL: openerEnabled ? undefined : callbackURL,
        fetchOptions: {
            ...(fetchOptions ?? {}),
            headers: {
                ...(fetchOptions?.headers ?? {}),
                ...(openerEnabled ? { Platform: platform() } : {})
            }
        }
    }

    if (fetchOptions?.throw) {
        const data = await authClient.linkSocial({
            ...params,
            fetchOptions: { ...params.fetchOptions, throw: true }
        })

        handleLinkSocial(data)

        return data
    }

    const response = await authClient.linkSocial(params)

    handleLinkSocial(response.data)

    return response
}

function handleLinkSocial(data: LinkSocialData | null) {
    if (!data?.url || data.redirect || !isOpenerEnabled()) return

    openUrl(data.url)
}
