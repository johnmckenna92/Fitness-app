-- Migration: Add image_url and has_valid_image to public.recipes
-- Populate Food.com CDN URLs

ALTER TABLE public.recipes
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS has_valid_image BOOLEAN DEFAULT FALSE;

-- Populate image_url using standard Food.com CDN format
UPDATE public.recipes
SET image_url = 'https://img.sndimg.com/food/image/upload/w_555,h_416,c_fit,fl_progressive,q_95/v1/img/recipes/' || id || '/pic.jpg'
WHERE image_url IS NULL;

-- Performance index for high-density filtering
CREATE INDEX IF NOT EXISTS idx_recipes_has_valid_image ON public.recipes(has_valid_image);
