from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, Cart, Order, OrderItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    discount_percentage = serializers.ReadOnlyField()
    final_price = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discount_price',
            'category', 'category_id', 'image', 'images', 'stock', 'skin_type',
            'rating', 'review_count', 'is_trending', 'is_bestseller', 'is_new',
            'discount_percentage', 'final_price', 'created_at'
        ]


class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'total_amount', 'full_name', 'email',
            'shipping_address', 'city', 'state', 'pincode', 'phone',
            'status', 'items', 'created_at', 'updated_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']
        read_only_fields = ['username', 'date_joined']

