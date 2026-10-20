import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { publicProducts, productPageQuery, saveProductVisibility } from '../src/lib/product-queries.ts';

const requests = [];
let active = false;
const client = createClient('https://catalog.test', 'test-key', {
  auth: { persistSession: false, autoRefreshToken: false },
  global: { fetch: async (url, init) => {
    const query = new URL(url).searchParams;
    requests.push({ query, method: init.method, body: init.body });
    if (init.method === 'PATCH') active = JSON.parse(init.body).is_active;
    const rows = query.get('id') === 'eq.missing' ? [] : [{ id: 'existing-product', is_active: active }];
    return new Response(JSON.stringify(rows), { headers: { 'content-type': 'application/json', 'content-range': '0-0/1' } });
  } },
});

for (const page of [1, 2, 3]) {
  await productPageQuery(client, { page }).order('id');
  const { query } = requests.at(-1);
  assert.equal(query.get('is_active'), 'eq.true');
  assert.equal(query.get('limit'), '24');
  assert.equal(query.get('offset'), String((page - 1) * 24));
}
await productPageQuery(client, { pageSize: 700 });
assert.equal(requests.at(-1).query.get('limit'), '24');
await publicProducts(client).eq('id', 'existing-product').maybeSingle();
assert.equal(requests.at(-1).query.get('is_active'), 'eq.true');
await publicProducts(client).ilike('name', 'T%').limit(6);
assert.equal(requests.at(-1).query.get('is_active'), 'eq.true');
assert.equal(requests.at(-1).query.get('limit'), '6');
await productPageQuery(client, { admin: true, page: 2, pageSize: 100 });
assert.equal(requests.at(-1).query.has('is_active'), false);
assert.equal(requests.at(-1).query.get('offset'), '100');
for (const value of [true, false]) {
  await saveProductVisibility(client, 'existing-product', value);
  assert.deepEqual(JSON.parse(requests.at(-1).body), { is_active: value });
  assert.equal(active, value);
}
await assert.rejects(saveProductVisibility(client, 'missing', true), /did not confirm/);
console.log('PASS: public query filtering, 24-row pages, bounded autocomplete/detail, admin access and acknowledged visibility-only updates.');
