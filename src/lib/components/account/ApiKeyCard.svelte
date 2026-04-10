<script lang="ts">
    import { enhance } from "$app/forms";
    import { getFormatter } from "$lib/i18n";
    import { toaster } from "$lib/components/toaster";

    interface ApiKeyRow {
        id: string;
        name: string;
        keyPrefix: string;
        createdAt: string | Date;
        lastUsedAt: string | Date | null;
        expiresAt: string | Date | null;
    }

    interface Props {
        key: ApiKeyRow;
    }

    const { key }: Props = $props();
    const t = getFormatter();
</script>

<div class="border-surface-200-800 flex flex-col gap-3 rounded border p-3">
    <div class="flex flex-col gap-1">
        <span class="font-medium">{key.name}</span>
        <span class="text-sm opacity-70">
            {$t("admin.api-key-prefix")}: {key.keyPrefix}...
        </span>
        <span class="text-sm opacity-70">
            {$t("admin.api-key-created-at")}: {new Date(key.createdAt).toLocaleString()}
        </span>

        {#if key.lastUsedAt}
            <span class="text-sm opacity-70">
                {$t("admin.api-key-last-used")}: {new Date(key.lastUsedAt).toLocaleString()}
            </span>
        {/if}

        {#if key.expiresAt}
            <span class="text-sm opacity-70">
                {$t("admin.api-key-expires")}: {new Date(key.expiresAt).toLocaleString()}
            </span>
        {/if}
    </div>

    <form
        action="?/deleteApiKey"
        method="POST"
        use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === "error") {
                    toaster.error({
                        description: (result.error?.message as string) || $t("admin.api-key-delete-failed")
                    });
                    return;
                }

                if (result.type === "failure") {
                    toaster.error({
                        description: (result.data?.message as string) || $t("admin.api-key-delete-failed")
                    });
                    return;
                }

                await update({ invalidateAll: true });
            };
        }}
    >
        <input name="id" type="hidden" value={key.id} />
        <button class="preset-tonal-error btn w-min" type="submit">
            {$t("wishes.delete")}
        </button>
    </form>
</div>