# DAWOOD MART — MASTER CODEX PROJECT BRIEF

## 1. PROJECT

Project Name: Dawood Mart

GitHub Repository:
https://github.com/AbdulHafeez-coder/dawood

Vercel Project:
https://vercel.com/abdul-hafeezs-projects-9f9cb3ad/dawood

Live Website:
https://dawood-virid.vercel.app/

Supabase Project:
https://jowinhlsiofthbrtjind.supabase.co

IMPORTANT ACCOUNT RULE:

Use ONLY the Abdul Hafeez / AbdulHafeez-coder project/account.

DO NOT use:
NHUSSAIN304
Noor Hussain
Any other GitHub/Vercel account

Do not change ownership or connect the project to another person's account.

---

# 2. FIRST TASK — AUDIT EVERYTHING

Before changing anything:

1. Inspect the complete GitHub repository.
2. Inspect package.json and determine the framework.
3. Inspect all existing routes/pages/components.
4. Inspect Supabase connection code.
5. Inspect product and category database structure.
6. Determine how products are currently fetched.
7. Determine why the live website is not displaying the catalog correctly.
8. Inspect current Vercel environment variables.
9. Inspect build/deployment configuration.
10. Do NOT delete existing product data.
11. Do NOT create duplicate products.
12. Do NOT replace the existing Supabase database.

Make a short internal audit before making destructive changes.

---

# 3. CURRENT PRODUCT DATABASE

The project has approximately 700+ products in Supabase.

Previously verified approximate database size:

Products: ~702
Categories: ~69

The database is the source of truth.

DO NOT create fake/sample products to replace the real catalog.

The frontend must load the actual products from Supabase.

---

# 4. SUPABASE CONNECTION

Use environment variables.

For a Next.js application, use:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

If the existing project uses:

NEXT_PUBLIC_SUPABASE_ANON_KEY

then preserve compatibility where appropriate.

NEVER expose:

SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
DATABASE_PASSWORD
POSTGRES_PASSWORD

in client-side code.

NEVER commit .env.local.

Use Vercel Environment Variables for production/preview/development.

---

# 5. GITHUB

Repository:

https://github.com/AbdulHafeez-coder/dawood

All code changes must be made in this repository.

Before pushing:

* run lint
* run typecheck if available
* run unit tests
* run build
* fix errors

Then commit with a clear message.

Example:

feat: redesign Dawood Mart mobile-first ecommerce storefront

Push ONLY to the AbdulHafeez-coder/dawood repository.

---

# 6. VERCEL

Vercel project:

abdul-hafeezs-projects-9f9cb3ad/dawood

After GitHub changes:

1. Deploy through the correct Vercel project.
2. Confirm environment variables.
3. Confirm Supabase connection.
4. Confirm production build.
5. Open the live deployment.
6. Test the homepage.
7. Test categories.
8. Test product listing.
9. Test product details.
10. Test mobile layout.
11. Confirm real Supabase products appear.

Do not create a second unrelated Vercel project.

---

# 7. MAIN DESIGN GOAL

Redesign Dawood Mart as a modern mobile-first Pakistani ecommerce website.

The current frontend should NOT feel like a developer demo.

It should look like a real ecommerce store.

Priority:

Mobile first
Then tablet
Then desktop

Design should be:

Clean
Modern
Fast
Simple
Professional
Easy to browse
Easy to search
Easy to order

Avoid excessive text.

---

# 8. PRODUCT CARD

Product cards should be simple.

Recommended structure:

IMAGE

PRODUCT NAME

PRICE

AVAILABILITY

ACTION

Do NOT put excessive information on the card.

Remove unnecessary text such as:

Return information
Long descriptions
Large technical details
Repeated labels
Unnecessary badges

The product image should be the main visual focus.

Product name should be readable.

Price should be obvious.

Availability/action should be clear.

---

# 9. PRODUCT STATUS SYSTEM

Use clear statuses.

## AVAILABLE

Product can currently be purchased.

Show:

Available
Add to Cart / Order

---

## SOLD OUT

Product is temporarily unavailable.

Show:

Sold Out

Do not make it look like a normal purchasable product.

---

## ON DEMAND

Product is not currently in stock but Dawood Mart may be able to source it from the market.

Show:

Request This Product

Allow customer to contact through WhatsApp.

WhatsApp message should automatically include:

Product name
Product ID/SKU
Product URL

Example:

"Assalam o Alaikum, I want to request this product:

Product: [NAME]
Product ID: [ID]
Link: [URL]"

---

## COMING SOON

Use ONLY for genuinely upcoming products.

Do NOT mark every unavailable product as Coming Soon.

---

## DISCONTINUED

Products that will no longer be sold should be unpublished from normal shopping results.

Keep them in database if required for historical/reference purposes.

---

# 10. PRODUCT SORTING

The storefront should prioritize:

1. Available products
2. On Demand products
3. Sold Out products
4. Coming Soon products

Do not allow Sold Out products to dominate the first screen.

Customers should immediately see products they can actually order.

---

# 11. CATEGORY STRUCTURE

Do NOT show 69 categories in the main navigation.

Do NOT use brands as primary categories.

Keep the main category structure simple.

Target:

3–5 primary categories maximum.

Initial structure:

1. Sheets
2. Crockery
3. Towels

If the actual database requires another major product group, create only the necessary additional category.

Do not create categories simply to increase the category count.

---

# 12. SHEETS

Sheets must be a separate main category.

Inside Sheets, distinguish actual product types.

Important subcategories:

TABLE SHEETS

WALLPAPER SHEETS

Table Sheets can include:

Dining Table Sheets
Center Table Sheets
Dastarkhwan
Table Covers

Wallpaper Sheets should be separate.

Do not mix Wallpaper Sheets with Table Sheets.

---

# 13. CROCKERY

Crockery should contain actual crockery-related products.

Examples:

Cups
Mugs
Glasses
Kitchen/Crockery items
Relevant household serving products

Do not create unnecessary brand categories.

---

# 14. TOWELS

Towels should have their own main category.

Possible subcategories:

Bath Towels
Hand Towels
Face Towels
Other relevant towel types

Only create subcategories when actual products justify them.

---

# 15. BRANDS

Brands must NOT be displayed as primary navigation categories.

Brand should instead be:

Searchable
Filterable
Visible on product detail when useful

Example:

Filters:

Category
Brand
Price
Availability

But the homepage should not show dozens of brand categories.

---

# 16. HOMEPAGE

Create a modern ecommerce homepage.

Suggested order:

HEADER

Logo / Dawood Mart
Search
Cart

CATEGORY CHIPS

Sheets
Crockery
Towels
Other necessary categories

HERO / FEATURE AREA

Use a clean promotional section only if actual assets/content exist.

Do not create fake offers.

AVAILABLE PRODUCTS

Show currently available products first.

ON DEMAND

Show selected products that can be sourced.

POPULAR / FEATURED

Only if actual product data supports it.

CATEGORY SECTIONS

Sheets
Crockery
Towels

FOOTER

WhatsApp
Contact
Categories
Policies
Social links if configured

---

# 17. MOBILE NAVIGATION

Mobile-first bottom navigation is preferred.

Possible:

Home
Categories
Search
Cart
WhatsApp/Account

Keep it simple.

Do not overload the bottom navigation.

---

# 18. SEARCH

Search must work against the real Supabase product data.

Search should support:

Product name
SKU/Product ID
Brand
Relevant keywords

Search results should be fast.

Show useful empty-state message if nothing is found.

---

# 19. FILTERS

Add useful filters where appropriate:

Category
Subcategory
Brand
Price
Availability

Do not create complicated filters that customers do not need.

---

# 20. PRODUCT DETAIL PAGE

Product detail page should have:

Large product image/gallery

Product name

Price

Availability

Product ID/SKU

Brand if available

Short description

Relevant specifications

Order/Add to Cart action

WhatsApp Request button for On Demand/Sold Out products where applicable

Related products

Category/breadcrumb

Do not put the important product content awkwardly above the product image.

The page should have a natural ecommerce hierarchy.

---

# 21. WHATSAPP

For On Demand products, create a WhatsApp request action.

The message should automatically contain the product information.

Use the configured Dawood Mart WhatsApp number from the existing project if already available.

Do NOT invent a new phone number.

If no WhatsApp number exists in the code/configuration, flag it for configuration instead of inventing one.

---

# 22. REAL DATABASE — VERY IMPORTANT

Frontend must use Supabase as the source of truth.

Do NOT hardcode a small list of products.

The previous problem was that the database contained hundreds of products while the frontend was showing only a small subset.

Fix the actual data-loading problem.

The storefront should correctly paginate/load the real catalog.

Use pagination/infinite loading where appropriate.

Do not load 700+ products unnecessarily into the browser in one request.

---

# 23. IMAGES

Use existing product images from the database/storage.

Do not replace hundreds of real product images with placeholders.

Handle:

Missing image
Broken image
Multiple images

with a professional fallback.

---

# 24. PERFORMANCE

Optimize for mobile users in Pakistan.

Important:

Fast first load
Optimized images
Lazy loading
Pagination
Minimal JavaScript where possible
Avoid unnecessary API requests

Do not sacrifice functionality merely for animations.

---

# 25. SEO

Every product should have a useful SEO-friendly URL.

Example:

/products/product-name

or the existing project convention if already established.

Product metadata should include:

Title
Description
Open Graph information where appropriate

Category pages should also have useful metadata.

Do not create duplicate URLs for the same product.

---

# 26. RESPONSIVE DESIGN

Test:

Mobile ~360px
Mobile ~390px
Tablet
Desktop

Product grid should adapt.

Example:

Mobile:
2 columns

Tablet:
3 columns

Desktop:
4+ columns depending on screen width

Do not make product cards too small.

---

# 27. DO NOT BREAK EXISTING FEATURES

Before changing code identify existing:

Cart
Checkout/order flow
Authentication
Admin functionality
Supabase queries
Product management
Category management
Existing API routes

Do not remove working functionality without reason.

---

# 28. DATA MIGRATION

Do NOT immediately delete the existing 69 categories.

First inspect the actual products and determine the correct mapping.

The desired customer-facing structure is approximately:

Sheets
Crockery
Towels

* only genuinely necessary additional category/categories

Brands should not be primary categories.

Ambiguous products should be reviewed based on their actual names/data instead of blindly assigning them.

---

# 29. TESTING

Before deployment run:

npm install / existing package manager

npm run lint

npm run typecheck

npm test

npm run build

Use the commands that actually exist in package.json.

If a command does not exist, do not invent it.

Fix all blocking errors.

---

# 30. FINAL QA

After deployment verify:

Homepage loads
Real products load
Product images load
Search works
Categories work
Filters work
Product detail works
Cart works
WhatsApp works
Mobile layout works
Desktop layout works
No obvious console errors
No broken links
No fake products
No duplicate products
No exposed secret keys

---

# 31. SECURITY

Never expose:

service_role
secret keys
database password
POSTGRES_PASSWORD
private tokens

Never commit:

.env
.env.local
.env.production.local

Public browser variables may use the NEXT_PUBLIC_ prefix only when they are intentionally public.

Supabase Row Level Security must be reviewed before production.

---

# 32. GIT COMMIT

Use a clear commit.

Example:

feat: rebuild Dawood Mart mobile-first ecommerce storefront

Before push:

git status
git diff
tests
build

Then push to:

AbdulHafeez-coder/dawood

---

# 33. DEPLOYMENT

Deploy to the existing:

abdul-hafeezs-projects-9f9cb3ad/dawood

Do NOT deploy under NHUSSAIN304.

Do NOT create an unrelated duplicate project.

After deployment provide:

GitHub commit hash

Vercel deployment URL

Production URL

Build status

Supabase connection status

Tests status

---

# 34. FINAL REPORT

At completion provide a concise report:

## Completed

* Frontend redesign
* Mobile-first layout
* Category restructuring
* Product cards
* Product statuses
* Search
* Filters
* Product detail
* WhatsApp request
* Supabase product loading
* Performance improvements
* SEO
* Tests

## GitHub

Repository:
https://github.com/AbdulHafeez-coder/dawood

Commit:
[actual commit hash]

## Vercel

Deployment:
[actual deployment URL]

Production:
[actual production URL]

## Database

Supabase:
Connected / Not Connected

Products loaded:
[actual count]

Categories:
[actual customer-facing count]

## QA

Build:
PASS/FAIL

Tests:
PASS/FAIL

Mobile:
PASS/FAIL

Desktop:
PASS/FAIL

Search:
PASS/FAIL

Product detail:
PASS/FAIL

WhatsApp:
PASS/FAIL

---

# MOST IMPORTANT RULE

Do not pretend something is completed.

If GitHub access is unavailable, say so.

If Vercel access is unavailable, say so.

If Supabase access is unavailable, say so.

If deployment fails, report the actual error.

Never claim that code was pushed or deployed unless it actually happened.

The goal is a REAL production-ready Dawood Mart storefront using the existing GitHub + Vercel + Supabase infrastructure.
