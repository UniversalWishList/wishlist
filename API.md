# Wishlist Extension API

## Files Added

### `src/lib/server/apiAuth.ts`
Handles API key validation. All API requests must include a key in the `Authorization` header as `Bearer <API_KEY>`. This is currently a placeholder using a hardcoded test key — it needs to be refactored once API key generation is completed.

### `src/routes/api/lists/+server.ts`
GET endpoint that returns all wishlists owned by the authenticated user.

### `src/routes/api/lists/[listId]/items/+server.ts`
POST endpoint that adds a new item to a specific wishlist. The only required field is `name`. Optional fields: `url`, `price`, `note`, `imageUrl`.

### `tests/api/wishlists.test.ts`
Playwright tests covering authentication (401 for missing/invalid keys), GET, and POST.

## TODO

- Refactor `validateApiKey` in `src/lib/server/apiAuth.ts` to perform real API key database lookups instead of using a hardcoded test key
- Add an `ApiKey` model to the Prisma schema linking API keys to users