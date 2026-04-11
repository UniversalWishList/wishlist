import { client } from "$lib/server/prisma";
import { error } from "@sveltejs/kit";
import * as bcrypt from "bcryptjs";

export async function validateApiKey(request: Request) {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw error(401, "Missing API key");
    }

    const apiKey = authHeader.slice("Bearer ".length).trim();

    if (!apiKey) {
        throw error(401, "Missing API key");
    }

    const keyPrefix = apiKey.slice(0, 12);

    const candidates = await client.apiKey.findMany({
        where: {
            keyPrefix
        },
        select: {
            id: true,
            keyHash: true,
            userId: true,
            expiresAt: true
        }
    });

    for (const candidate of candidates) {
        if (candidate.expiresAt && candidate.expiresAt < new Date()) {
            continue;
        }

        const matches = await bcrypt.compare(apiKey, candidate.keyHash);

        if (matches) {
            await client.apiKey.update({
                where: { id: candidate.id },
                data: { lastUsedAt: new Date() }
            });

            return { userId: candidate.userId };
        }
    }

    throw error(401, "Invalid API key");
}