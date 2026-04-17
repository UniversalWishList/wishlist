import { client } from '$lib/server/prisma';
import type { RequestHandler } from './$types';
import { validateApiKey } from '$lib/server/apiAuth';

export const GET: RequestHandler = async ({ request }) => {
    // Validate API key
    const { userId } = await validateApiKey(request);

    const lists = await client.list.findMany({
        where: { ownerId: userId},
        select: {
            id: true,
            name: true,
            groupId: true,
            icon: true,
            iconColor: true,
            description: true,
        },
    });

  return new Response(JSON.stringify(lists), { status: 200 });
};