from django.core.management.base import BaseCommand
from api.models import Category, Product
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seeds the database with sample categories and products'

    def handle(self, *args, **options):
        self.stdout.write('Starting to seed database...')

        # Create Categories
        categories_data = [
            {'name': 'Skin', 'slug': 'skin', 'description': 'Skincare products for all skin types'},
            {'name': 'Body', 'slug': 'body', 'description': 'Body care products for smooth and soft skin'},
            {'name': 'Hair', 'slug': 'hair', 'description': 'Haircare products for healthy and shiny hair'},
            {'name': 'Fragrances', 'slug': 'fragrances', 'description': 'Perfumes and body mists'},
            {'name': 'Gifting', 'slug': 'gifting', 'description': 'Gift sets and combos'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories[cat_data['slug']] = category
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category.name}'))
            else:
                self.stdout.write(f'Category already exists: {category.name}')

        # Create Products
        products_data = [
            {
                'name': '2% Niacinamide & Rice Water Brightening Gel Moisturizer',
                'slug': 'niacinamide-rice-water-moisturizer',
                'description': '2x hydration | Brightens skin in 2 Weeks | Non-Greasy. Perfect for all skin types.',
                'price': Decimal('750.00'),
                'discount_price': Decimal('525.00'),
                'category': categories['skin'],
                'stock': 50,
                'skin_type': 'all',
                'rating': Decimal('4.4'),
                'review_count': 2261,
                'is_trending': True,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': '10% Niacinamide & Rice Water Brightening Face Serum',
                'slug': 'niacinamide-face-serum',
                'description': 'Brightens from 1st use | 2x instant hydration | Dermat-Tested. Suitable for all skin types.',
                'price': Decimal('849.00'),
                'discount_price': None,
                'category': categories['skin'],
                'stock': 30,
                'skin_type': 'all',
                'rating': Decimal('4.5'),
                'review_count': 3271,
                'is_trending': False,
                'is_bestseller': True,
                'is_new': False,
            },
            {
                'name': 'Vanilla Caramello Body Lotion',
                'slug': 'vanilla-caramello-body-lotion',
                'description': 'Deep Moisturization | Non-Greasy | Warm & Cozy Vanilla Fragrance | Normal to Dry Skin',
                'price': Decimal('475.00'),
                'discount_price': None,
                'category': categories['body'],
                'stock': 40,
                'skin_type': 'all',
                'rating': Decimal('4.4'),
                'review_count': 221,
                'is_trending': True,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': 'Coconut Milk & Peptides Shampoo',
                'slug': 'coconut-milk-peptides-shampoo',
                'description': 'Softens Strands | Nourishes Hair. Perfect for all hair types.',
                'price': Decimal('345.00'),
                'discount_price': None,
                'category': categories['hair'],
                'stock': 35,
                'skin_type': 'all',
                'rating': Decimal('4.3'),
                'review_count': 669,
                'is_trending': True,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': 'Green Tea Pore Cleansing Face Wash for Acne',
                'slug': 'green-tea-face-wash',
                'description': 'Controls Oil upto 2-hrs | Reduces Acne in 7 days. Ideal for oily and acne-prone skin.',
                'price': Decimal('299.00'),
                'discount_price': Decimal('225.00'),
                'category': categories['skin'],
                'stock': 45,
                'skin_type': 'oily',
                'rating': Decimal('4.5'),
                'review_count': 186,
                'is_trending': False,
                'is_bestseller': True,
                'is_new': False,
            },
            {
                'name': 'Green Tea Oil-Free Moisturizer for Oily Skin',
                'slug': 'green-tea-oil-free-moisturizer',
                'description': 'Fights Acne & Controls Oil | Non-Comedogenic | Dermat-Tested',
                'price': Decimal('425.00'),
                'discount_price': None,
                'category': categories['skin'],
                'stock': 38,
                'skin_type': 'oily',
                'rating': Decimal('4.5'),
                'review_count': 1738,
                'is_trending': False,
                'is_bestseller': True,
                'is_new': False,
            },
            {
                'name': 'Vanilla Caramello Eau De Parfum',
                'slug': 'vanilla-caramello-perfume',
                'description': 'Long Lasting | Vanilla & Salted Caramel Fragrance | Supremely Luxurious',
                'price': Decimal('995.00'),
                'discount_price': Decimal('695.00'),
                'category': categories['fragrances'],
                'stock': 25,
                'skin_type': 'all',
                'rating': Decimal('4.3'),
                'review_count': 91,
                'is_trending': False,
                'is_bestseller': True,
                'is_new': False,
            },
            {
                'name': 'Hawaiian Rumba Shower Gel',
                'slug': 'hawaiian-rumba-shower-gel',
                'description': 'SLS-Free | Hydrating Formula | Fresh Beachy Fragrance | Aloe-Infused Body Wash',
                'price': Decimal('380.00'),
                'discount_price': None,
                'category': categories['body'],
                'stock': 42,
                'skin_type': 'all',
                'rating': Decimal('4.4'),
                'review_count': 27,
                'is_trending': True,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': 'CeraSense™ Moisturizing Cream with Ceramides & Peptides',
                'slug': 'cerasense-moisturizing-cream',
                'description': 'Intense hydration with ceramides and peptides | Restores skin barrier | For dry and sensitive skin',
                'price': Decimal('599.00'),
                'discount_price': None,
                'category': categories['skin'],
                'stock': 28,
                'skin_type': 'dry',
                'rating': Decimal('4.2'),
                'review_count': 37,
                'is_trending': False,
                'is_bestseller': False,
                'is_new': True,
            },
            {
                'name': 'Vanilla Vibes Body Oil',
                'slug': 'vanilla-vibes-body-oil',
                'description': 'Intense Moisture & Instant Glow | Non-Greasy & Lightweight | Nourishes Skin | Warm Vanilla Fragrance',
                'price': Decimal('575.00'),
                'discount_price': None,
                'category': categories['body'],
                'stock': 32,
                'skin_type': 'all',
                'rating': Decimal('4.4'),
                'review_count': 77,
                'is_trending': False,
                'is_bestseller': True,
                'is_new': False,
            },
            {
                'name': 'Green Tea & Zinc Super-Matte SPF 50 Sunscreen Gel',
                'slug': 'green-tea-zinc-sunscreen',
                'description': 'Instant Oil Reduction | 120-min Water Resistant | Dermat-Tested | No White Cast',
                'price': Decimal('549.00'),
                'discount_price': None,
                'category': categories['skin'],
                'stock': 40,
                'skin_type': 'oily',
                'rating': Decimal('4.6'),
                'review_count': 56,
                'is_trending': True,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': 'Hazelnut Eclair Body Lotion',
                'slug': 'hazelnut-eclair-body-lotion',
                'description': 'Deep Moisturization | Cocoa Butter & Vitamin B5 | Decadent Hazelnut Chocolate Fragrance | Non-Greasy & Lightweight',
                'price': Decimal('575.00'),
                'discount_price': None,
                'category': categories['body'],
                'stock': 35,
                'skin_type': 'all',
                'rating': Decimal('4.0'),
                'review_count': 85,
                'is_trending': False,
                'is_bestseller': False,
                'is_new': True,
            },
            {
                'name': 'Candy Melts Red Velvet Love Tinted Lip Balm',
                'slug': 'candy-melts-lip-balm',
                'description': 'Nourishes & Protects | Sheer-Tint | Velvety Smooth. Perfect for dry, flaky, chapped lips.',
                'price': Decimal('199.00'),
                'discount_price': None,
                'category': categories['skin'],
                'stock': 60,
                'skin_type': 'all',
                'rating': Decimal('4.5'),
                'review_count': 33,
                'is_trending': False,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': 'NaturStudio All-Day-Wear Kohl Kajal',
                'slug': 'naturstudio-kajal',
                'description': '2-in-1 Kajal + Liner | Water-Proof | Safe for Sensitive Eyes',
                'price': Decimal('499.00'),
                'discount_price': None,
                'category': categories['skin'],
                'stock': 45,
                'skin_type': 'all',
                'rating': Decimal('4.4'),
                'review_count': 18,
                'is_trending': False,
                'is_bestseller': False,
                'is_new': False,
            },
            {
                'name': 'Saffron & Kumkumadi Oil Glow Bright Moisturizer with SPF 35',
                'slug': 'saffron-kumkumadi-moisturizer',
                'description': 'Brightens skin | SPF 35 protection | Saffron & Kumkumadi oil blend | For all skin types',
                'price': Decimal('415.00'),
                'discount_price': Decimal('299.00'),
                'category': categories['skin'],
                'stock': 30,
                'skin_type': 'all',
                'rating': Decimal('4.3'),
                'review_count': 142,
                'is_trending': True,
                'is_bestseller': False,
                'is_new': False,
            },
        ]

        for product_data in products_data:
            # Use placeholder image URL (you can replace with actual Cloudinary URLs later)
            product_data['image'] = 'https://via.placeholder.com/400x400?text=' + product_data['name'].replace(' ', '+')
            product_data['images'] = [product_data['image']]
            
            product, created = Product.objects.get_or_create(
                slug=product_data['slug'],
                defaults=product_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created product: {product.name}'))
            else:
                self.stdout.write(f'Product already exists: {product.name}')

        self.stdout.write(self.style.SUCCESS('\nDatabase seeding completed successfully!'))
        self.stdout.write(f'Created/Updated {len(categories)} categories and {len(products_data)} products.')

