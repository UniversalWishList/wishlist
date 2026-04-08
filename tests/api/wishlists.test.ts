import { expect, test } from '@playwright/test';
import { request } from 'node:http';

const API_KEY = 'test-api-key-123';
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

// Auth edge cases

test('returns 401 with empty Bearer token', async ({ request }) => {
  const response = await request.get('/api/lists', {
    headers: { Authorization: 'Bearer ' },
  });
  expect(response.status()).toBe(401);
});

// POST also require auth

test('POST returns 401 without API key', async ({ request }) => {
    const response = await request.post('/api/lists/any-id/items', {
        data: { name: 'Test Item' },
    });
    expect(response.status()).toBe(401);
});

// POST error cases

test('POST returns 404 for nonexistent list', async ({ request }) => {
  const response = await request.post('/api/lists/fake-id-12345/items', {
    headers,
    data: { name: 'Test Item' },
  });
  expect(response.status()).toBe(404);
});

test('POST returns 400 with missing item name', async ({ request }) => {
  const listsResponse = await request.get('/api/lists', { headers });
  const lists = await listsResponse.json();
  const listId = lists[0].id;

  const response = await request.post(`/api/lists/${listId}/items`, {
    headers,
    data: { url: 'https://example.com' },
  });
  expect(response.status()).toBe(400);
});

test('returns 401 with missing Bearer prefix', async ({ request }) => {
  const response = await request.get('/api/lists', {
    headers: { Authorization: API_KEY },
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