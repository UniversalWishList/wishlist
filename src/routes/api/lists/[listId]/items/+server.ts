import { getFormatter } from "$lib/server/i18n";
import { itemEmitter } from "$lib/server/events/emitters";
import { client } from "$lib/server/prisma";
import type { RequestHandler } from "./$types";
import { error } from "@sveltejs/kit";
import { listItemsUpdateSchema } from "$lib/server/validations";
import { ItemEvent } from "$lib/events";
import { requireLoginOrError } from "$lib/server/auth";
import { logger } from "$lib/server/logger";
import { validateApiKey } from "$lib/server/apiAuth";

export const PATCH: RequestHandler = async ({ request, params }) => {
    await requireLoginOrError();
    const $t = await getFormatter();

    const body = (await request.json()) as Record<string, unknown>[];
    const updateData = listItemsUpdateSchema.array().safeParse(body);

    if (updateData.error) {
        error(422, $t("errors.one-or-more-items-missing-an-id"));
    }

    try {
        await client.$transaction(
            updateData.data.map((d) => {
                return client.listItem.update({
                    where: {
                        listId_itemId: {
                            listId: params.listId,
                            itemId: d.itemId
                        }
                    },
                    data: {
                        displayOrder: d.displayOrder
                    }
                });
            })
        );

        itemEmitter.emit(ItemEvent.ITEMS_UPDATE);

        return new Response(null, { status: 200 });
    } catch (err) {
        logger.error({ err }, "Error patching list items");
        error(404, $t("errors.item-not-found"));
    }
};

export const POST: RequestHandler = async ({ request, params }) => {
    // Validate API key
    const { userId} = await validateApiKey(request);

    // TODO: Replace with API key auth
    const body = await request.json();

    if (!body.name) {
        error(400, "Item name is required");
    }

    const list = await client.list.findUnique({
        where: { id: params.listId },
    });

    if (!list) {
        error(404, "List not found");
    }

    const item = await client.item.create({
        data: {
            name: body.name,
            url: body.url ?? null,
            price: body.price ?? null,
            note: body.note ?? null,
            imageUrl: body.imageUrl ?? null,
            userId: userId,
            createdById: userId,
        },
    });

    await client.listItem.create({
        data: {
            listId: params.listId,
            itemId: item.id,
            addedById: userId,
        },
    });

    return new Response(JSON.stringify(item), { status: 201 });
};