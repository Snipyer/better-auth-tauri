import type { SocialProvider } from "better-auth/social-providers"

export function appendCallbackURL({
    callbackURL,
    ctx,
    debugLogs,
    scheme
}: {
    callbackURL: string
    ctx: any
    debugLogs?: boolean
    scheme: string
}) {
    if (!ctx.context.options.socialProviders) return
    if (!["/sign-in/social", "/link-social"].includes(ctx.path)) return

    const platform = ctx.request?.headers.get("platform") || ""

    Object.keys(ctx.context.options.socialProviders).forEach((key) => {
        if (platform && !["android", "ios"].includes(platform)) {
            if (debugLogs) {
                console.log(
                    "[Better Auth Tauri] Appending callback URL to social provider",
                    key,
                    `${ctx.context.baseURL}/callback/${key}?callbackURL=${scheme}:/${callbackURL}`
                )
            }

            ctx.context.options.socialProviders![
                key as SocialProvider
            ]!.redirectURI =
                `${ctx.context.baseURL}/callback/${key}?callbackURL=${scheme}:/${callbackURL}`
        } else {
            if (debugLogs) {
                console.log(
                    "[Better Auth Tauri] Removing callback URL from social provider",
                    key
                )
            }

            ctx.context.options.socialProviders![
                key as SocialProvider
            ]!.redirectURI = undefined
        }
    })
}
