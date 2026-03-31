import { client } from '$lib/server/prisma';
import { error } from '@sveltejs/kit';

export async function validateApiKey(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        error(401, 'Missing API key');
    }

    const apiKey = authHeader.replace('Bearer ', '');

    // TODO: Replace with real API key database lookup
    if (apiKey === 'test-api-key-123') {
        // Return a real user from the database for now
        const user = await client.user.findFirst();
        if (!user) {
            error(401, 'No user found');
        }
        return { userId: user.id };
    }

    error(401, 'Invalid API key');
}