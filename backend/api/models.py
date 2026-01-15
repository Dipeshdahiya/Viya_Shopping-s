from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    SKIN_TYPE_CHOICES = [
        ('all', 'All Skin Types'),
        ('oily', 'Oily'),
        ('dry', 'Dry'),
        ('combination', 'Combination'),
        ('sensitive', 'Sensitive'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    image = CloudinaryField('image', folder='products')
    images = models.JSONField(default=list, blank=True)  # For multiple images
    stock = models.IntegerField(default=0)
    skin_type = models.CharField(max_length=20, choices=SKIN_TYPE_CHOICES, default='all')
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    review_count = models.IntegerField(default=0)
    is_trending = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_new = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def discount_percentage(self):
        if self.discount_price and self.price:
            return int(((self.price - self.discount_price) / self.price) * 100)
        return 0

    @property
    def final_price(self):
        return self.discount_price if self.discount_price else self.price


class Cart(models.Model):
    user = models.ForeignKey(User, related_name='carts', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'product']

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

    @property
    def total_price(self):
        return self.product.final_price * self.quantity


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(User, related_name='orders', on_delete=models.CASCADE)
    order_number = models.CharField(max_length=50, unique=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    full_name = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    shipping_address = models.TextField()
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    phone = models.CharField(max_length=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    razorpay_order_id = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    razorpay_signature = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.order_number}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.order.order_number} - {self.product.name}"

