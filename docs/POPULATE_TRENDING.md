# How to Populate Trending Products

## Option 1: Trigger Scraper via API (Recommended)

You can trigger the scraper manually to populate products:

### Using Browser/Postman:
```
POST http://localhost:3000/api/trending/scrape
```

### Using curl:
```bash
curl -X POST http://localhost:3000/api/trending/scrape
```

### Using PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/trending/scrape" -Method POST
```

## Option 2: Insert Test Data Directly

Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO trending_products (title, category, price, image_url, product_url, platform, rank)
VALUES
  ('Wireless Earbuds', 'Electronics', 29.99, 'https://via.placeholder.com/300', 'https://example.com/1', 'Amazon', 1),
  ('Smart Watch', 'Electronics', 49.99, 'https://via.placeholder.com/300', 'https://example.com/2', 'Amazon', 2),
  ('Yoga Mat', 'Sports & Outdoors', 22.99, 'https://via.placeholder.com/300', 'https://example.com/3', 'Amazon', 1),
  ('Coffee Maker', 'Home & Kitchen', 44.99, 'https://via.placeholder.com/300', 'https://example.com/4', 'eBay', 1),
  ('Running Shoes', 'Fashion', 59.99, 'https://via.placeholder.com/300', 'https://example.com/5', 'Amazon', 1);
```

## Verify Products

After populating, refresh the Trending page to see products!
