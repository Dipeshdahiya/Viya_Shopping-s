from django.contrib import admin
from .models import Category, Product, Cart, Order, OrderItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_trending', 'is_bestseller']
    list_filter = ['category', 'is_trending', 'is_bestseller', 'skin_type']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'quantity', 'created_at']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'user', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    inlines = [OrderItemInline]

