<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/state";
    import { toaster } from "$lib/components/toaster";
    import { getFormatter } from "$lib/i18n";
    import ApiKeyCard from "./ApiKeyCard.svelte";

    interface ApiKeyRow {
        id: string;
        name: string;
        keyPrefix: string;
        createdAt: string | Date;
        lastUsedAt: string | Date | null;
        expiresAt: string | Date | null;
    }

    interface Props {
        apiKeys?: ApiKeyRow[];
    }

    const { apiKeys = [] }: Props = $props();
    const t = getFormatter();

    let formData = $derived(page.form);
    let createdApiKey = $state<string | null>(null);
</script>

<div class="bg-surface-100-900 card border-surface-200-800 flex flex-col gap-4 border p-4">
    <header class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold">{$t("admin.api-keys")}</h2>
        <p class="text-sm opacity-70">{$t("admin.api-keys-description")}</p>
    </header>

    <form
        class="flex flex-col gap-4"
        action="?/createApiKey"
        method="POST"
        use:enhance={() => {
            return async ({ result, update }) => {
                if (result.type === "error") {
                    toaster.error({
                        description: (result.error?.message as string) || $t("admin.api-key-create-failed")
                    });
                    return;
                }

                if (result.type === "failure") {
                    toaster.error({
                        description: (result.data?.message as string) || $t("admin.api-key-create-failed")
                    });
                    return;
                }

                if (result.type === "success") {
                    const data = result.data as { createdApiKey?: string } | undefined;
                    createdApiKey = data?.createdApiKey ?? null;
                    await update({
                        invalidateAll: true
                    });
                }
            };
        }}
    >
        <label class="label" for="api-key-name">
            <span>{$t("admin.api-key-name")}</span>
            <input
                id="api-key-name"
                name="name"
                class={["input", formData?.errors?.name && "input-invalid"]}
                placeholder={$t("admin.api-key-name-placeholder")}
                type="text"
            />
            {#if formData?.errors?.name}
                <span class="text-invalid">{formData.errors.name[0]}</span>
            {/if}
        </label>

        <button class="preset-filled-primary-500 btn w-min" type="submit">
            {$t("admin.api-key-create")}
        </button>
    </form>

    {#if createdApiKey}
        <section class="border-surface-200-800 flex flex-col gap-2 rounded border p-3">
            <h3 class="font-semibold">{$t("admin.api-key-created")}</h3>
            <p class="text-sm opacity-70">{$t("admin.api-key-copy-warning")}</p>
            <code class="bg-surface-200-800 rounded p-3 text-sm break-all">{createdApiKey}</code>
        </section>
    {/if}

    <section class="flex flex-col gap-3">
        <h3 class="font-semibold">{$t("admin.api-key-existing")}</h3>

        {#if apiKeys.length === 0}
            <p class="text-sm opacity-70">{$t("admin.api-key-none")}</p>
        {:else}
            {#each apiKeys as key}
                <ApiKeyCard {key} />
            {/each}
        {/if}
    </section>
</div>