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
// for extracting metadata helper function
import { extractProductMetadata } from "$lib/server/productMetadata";
// for creating the image
import { createImage } from "$lib/server/image-util";
// for handling price
import { getMinorUnits } from "$lib/price-formatter";
import { getLocale } from "$lib/server/i18n";

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

    const body = await request.json();

    if (!body.url) {
        error(400, "Item URL is required");
    }

    const list = await client.list.findUnique({
        where: { id: params.listId },
    });

    if (!list) {
        error(404, "List not found");
    }

    let extracted = null;
    try {
        extracted = await extractProductMetadata(new URL(body.url));
    } catch (err) {
        logger.warn({ err, url: body.url }, "Failed to extract metadata from URL");
    }

    const finalName = body.name ?? extracted?.name ?? extracted?.title ?? null;
    const finalUrl = body.url ?? extracted?.url ?? null;
    const finalPrice = body.price ?? extracted?.price ?? null;
    const finalCurrency = body.currency ?? extracted?.currency ?? null;
    const finalNote = body.note ?? null;
    const finalImageUrl = body.imageUrl ?? extracted?.image ?? null;

    if (!finalName) {
        error(400, "Item name is required if extraction fails");
    }

    let newImageFile: string | undefined | null = null;

    if (finalImageUrl) {
        try {
            newImageFile = await createImage(finalName, finalImageUrl);
        } catch (err) {
            logger.warn({ err, imageUrl: finalImageUrl }, "Failed to create image from URL");
        }
    }

    let itemPriceId: string | null = null;

    if (finalPrice && finalCurrency) {
        const itemPrice = await client.itemPrice.create({
            data: {
                value: getMinorUnits(Number(finalPrice), finalCurrency, getLocale()),
                currency: finalCurrency
            }
        });
        itemPriceId = itemPrice.id;
    }
    // DEBUGGING PURPOSES TO REMOVE
    console.log("Extracted metadata:", extracted);
    console.log("Final item data:", {
        finalName,
        finalUrl,
        finalPrice,
        finalCurrency,
        finalNote,
        finalImageUrl,
        itemPriceId,
        userId
    });
    //

    const item = await client.item.create({
        data: {
            name: finalName,
            url: finalUrl,
            itemPriceId: itemPriceId,
            note: finalNote,
            imageUrl: newImageFile,
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