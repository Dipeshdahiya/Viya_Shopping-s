from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, CartViewSet,
    OrderViewSet, UserViewSet, register_view, login_view, logout_view,
    newsletter_subscribe_view
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/logout/', logout_view, name='logout'),
    path('newsletter/subscribe/', newsletter_subscribe_view, name='newsletter_subscribe'),
]

