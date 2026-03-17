import type { SetupBetterAuthTauriOptions } from "./setup-better-auth-tauri"

export async function handleAuthDeepLink({
    authClient,
    debugLogs,
    scheme,
    url,
    onError,
    onRequest,
    onSuccess
}: SetupBetterAuthTauriOptions & { url: string }) {
    const basePath = "/api/auth/"

    const newUrl = new URL(url)

    const schemeWithDoubleSlash = `${scheme}:/`
    const schemeWithTripleSlash = `${scheme}:///`

    if (
        !url.startsWith(`${scheme}:/${basePath}`) &&
        !url.startsWith(`${scheme}://${basePath}`) &&
        !newUrl.pathname.startsWith(basePath)
    )
        return false

    const href = `/${
        newUrl.protocol.startsWith("http")
            ? url.replace(newUrl.origin, "").replace(basePath, "")
            : url
                  .replace(schemeWithDoubleSlash, "")
                  .replace(schemeWithTripleSlash, "")
                  .replace(basePath, "")
    }`

    if (debugLogs) {
        console.log("[Better Auth Tauri] handleAuthDeepLink fetch", href)
    }

    onRequest?.(href)
    const response = await authClient.$fetch(href)

    if (debugLogs) {
        console.log(
            "[Better Auth Tauri] handleAuthDeepLink response",
            response,
            href
        )
    }

    if (
        response.error?.status !== 302 &&
        (response.error?.message || response.error?.statusText)
    ) {
        if (debugLogs) {
            console.error(
                "[Better Auth Tauri] handleAuthDeepLink error",
                response.error,
                href
            )
        }

        onError?.(response.error)
    } else {
        const searchParams = new URL(url).searchParams
        const callbackURL = searchParams
            .get("callbackURL")
            ?.replace(`${scheme}:/`, "")

        if (debugLogs) {
            console.log(
                "[Better Auth Tauri] handleAuthDeepLink onSuccess callbackURL",
                callbackURL,
                href
            )
        }

        onSuccess?.(callbackURL)
    }

    return true
}
