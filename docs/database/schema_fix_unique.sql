-- Fix trending_products table to allow upsert by product_url
-- This is necessary for the scraping engine to work properly without duplicates

ALTER TABLE trending_products 
ADD CONSTRAINT trending_products_product_url_key UNIQUE (product_url);
