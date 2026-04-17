import { expect, test } from '@playwright/test';

const API_KEY = process.env.TEST_API_KEY!;
const headers = { Authorization: `Bearer ${API_KEY}` };

// Testing Auth

test('returns 401 without API key', async ({ request }) => {
  const response = await request.get('/api/lists');
  expect(response.status()).toBe(401);
});

test('returns 401 with invalid API key', async ({ request }) => {
  const response = await request.get('/api/lists', {
    headers: { Authorization: 'invalid-key-example' },
  });
  expect(response.status()).toBe(401);
});

// Testing GET

test('GET /api/lists returns the user wishlists', async ({ request }) => {
  const response = await request.get('/api/lists', { headers });
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data.length).toBeGreaterThan(0);
  expect(data[0]).toHaveProperty('id');
  expect(data[0]).toHaveProperty('name');
  expect(data[0]).toHaveProperty('groupId');
});

// Testing POST - This is a base for test and probably needs to change based on implementation (what data we decide to send)

test('POST /api/wishlists/:id/items adds an item', async ({ request }) => {

  const listsResponse = await request.get('/api/lists', { headers });
  const lists = await listsResponse.json();
  const listId = lists[0].id;

  const response = await request.post(`/api/lists/${listId}/items`, {
    headers,
    data: {
      name: 'Cool Headphones',
      url: 'https://example.com/headphones',
      price: '79.99',
    },
  });
  expect(response.status()).toBe(201);

  const item = await response.json();
  expect(item).toHaveProperty('id');
  expect(item.name).toBe('Cool Headphones');
});