from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.db.models import Q
import razorpay
from django.conf import settings
import random
import string

from .models import Category, Product, Cart, Order, OrderItem
from .serializers import (
    CategorySerializer, ProductSerializer, CartSerializer,
    OrderSerializer, UserSerializer
)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = Product.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        trending = self.request.query_params.get('trending', None)
        bestseller = self.request.query_params.get('bestseller', None)
        skin_type = self.request.query_params.get('skin_type', None)

        if category:
            queryset = queryset.filter(category__slug=category)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        if trending == 'true':
            queryset = queryset.filter(is_trending=True)
        if bestseller == 'true':
            queryset = queryset.filter(is_bestseller=True)
        if skin_type:
            queryset = queryset.filter(skin_type=skin_type)

        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = Product.objects.filter(
            Q(is_trending=True) | Q(is_bestseller=True)
        )[:10]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND
            )

        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def total(self, request):
        cart_items = self.get_queryset()
        total = sum(item.total_price for item in cart_items)
        return Response({'total': total})


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        cart_items = Cart.objects.filter(user=request.user)
        if not cart_items.exists():
            return Response(
                {'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST
            )

        total_amount = sum(item.total_price for item in cart_items)

        # Generate order number
        order_number = 'ORD' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))

        order = Order.objects.create(
            user=request.user,
            order_number=order_number,
            total_amount=total_amount,
            full_name=request.data.get('full_name', ''),
            email=request.data.get('email', request.user.email),
            shipping_address=request.data.get('shipping_address'),
            city=request.data.get('city', ''),
            state=request.data.get('state', ''),
            pincode=request.data.get('pincode', ''),
            phone=request.data.get('phone'),
        )

        # Create order items
        for cart_item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.final_price
            )

        # Clear cart
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def create_payment(self, request, pk=None):
        order = self.get_object()

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {'error': 'Razorpay credentials not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        razorpay_order = client.order.create({
            'amount': int(order.total_amount * 100),  # Amount in paise
            'currency': 'INR',
            'receipt': order.order_number
        })

        order.razorpay_order_id = razorpay_order['id']
        order.save()

        return Response({
            'order_id': razorpay_order['id'],
            'amount': razorpay_order['amount'],
            'currency': razorpay_order['currency'],
            'key': settings.RAZORPAY_KEY_ID
        })

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        order = self.get_object()
        payment_id = request.data.get('payment_id')
        signature = request.data.get('signature')

        if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
            return Response(
                {'error': 'Razorpay credentials not configured'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': order.razorpay_order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })

            order.razorpay_payment_id = payment_id
            order.razorpay_signature = signature
            order.status = 'processing'
            order.save()

            # Send order confirmation email to user
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                
                user_email = order.email or order.user.email
                if user_email:
                    # Get order items details
                    items_list = []
                    for item in order.items.all():
                        items_list.append(f"- {item.product.name} x {item.quantity} - ₹{item.price * item.quantity}")
                    
                    items_text = '\n'.join(items_list) if items_list else 'No items'
                    
                    subject = f'Order Confirmed - {order.order_number}'
                    message = f'''Dear {order.full_name or order.user.username},

Thank you for your order!

Your order has been successfully placed and payment confirmed.

Order Details:
- Order Number: {order.order_number}
- Order Date: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
- Total Amount: ₹{order.total_amount}

Items Ordered:
{items_text}

Shipping Address:
{order.shipping_address}
{order.city}, {order.state} - {order.pincode}
Phone: {order.phone}

Your order is being processed and will be shipped soon. You will receive tracking information once your order is dispatched.

Thank you for shopping with Veya!
Team Veya
we have chemistry™

---
This is an automated email. Please do not reply to this email.
'''
                    send_mail(
                        subject,
                        message,
                        settings.DEFAULT_FROM_EMAIL,
                        [user_email],
                        fail_silently=False,
                    )
                    print(f'Order confirmation email sent successfully to {user_email}')
            except Exception as e:
                import traceback
                error_msg = f'Error sending order confirmation email: {str(e)}\n{traceback.format_exc()}'
                print(error_msg)

            # Send order notification email to admin (connect.veya@gmail.com)
            try:
                from django.core.mail import send_mail
                from django.conf import settings
                
                # Get order items details
                items_list = []
                for item in order.items.all():
                    items_list.append(f"- {item.product.name} (Qty: {item.quantity}) - ₹{item.price * item.quantity} each")
                
                items_text = '\n'.join(items_list) if items_list else 'No items'
                
                admin_subject = f'New Order Received - {order.order_number}'
                admin_message = f'''New Order Received!

Order Details:
- Order Number: {order.order_number}
- Order Date: {order.created_at.strftime('%B %d, %Y at %I:%M %p')}
- Customer: {order.full_name or order.user.username}
- Customer Email: {order.email or order.user.email}
- Customer Phone: {order.phone}
- Total Amount: ₹{order.total_amount}
- Payment ID: {payment_id}
- Status: {order.status}

Items Ordered:
{items_text}

Shipping Address:
{order.shipping_address}
{order.city}, {order.state} - {order.pincode}

Please process this order and update the status accordingly.

---
This is an automated notification from Veya E-commerce System.
'''
                send_mail(
                    admin_subject,
                    admin_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [settings.DEFAULT_FROM_EMAIL],  # Send to connect.veya@gmail.com
                    fail_silently=False,
                )
                print(f'Order notification email sent successfully to admin')
            except Exception as e:
                import traceback
                error_msg = f'Error sending admin order notification email: {str(e)}\n{traceback.format_exc()}'
                print(error_msg)

            return Response({'status': 'success', 'message': 'Payment verified'})

        except razorpay.errors.SignatureVerificationError:
            return Response(
                {'error': 'Payment verification failed'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        import json
        from datetime import datetime
        log_path = r'c:\Users\HP\OneDrive\Desktop\ecommmer\.cursor\debug.log'
        
        if request.method == 'GET':
            # #region agent log
            try:
                with open(log_path, 'a') as f:
                    f.write(json.dumps({
                        'location': 'views.py:216',
                        'message': 'users/me GET called',
                        'data': {'is_authenticated': request.user.is_authenticated, 'user': request.user.username if request.user.is_authenticated else None, 'session_key': request.session.session_key},
                        'timestamp': int(datetime.now().timestamp() * 1000),
                        'sessionId': 'debug-session',
                        'runId': 'run1',
                        'hypothesisId': 'A'
                    }) + '\n')
            except: pass
            # #endregion
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login, logout


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    from django.core.mail import send_mail
    from django.conf import settings
    
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    # Validate required fields
    if not username:
        return Response(
            {'error': 'Username is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not email:
        return Response(
            {'error': 'Email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not password:
        return Response(
            {'error': 'Password is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if username already exists
    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {'error': 'Username already exists. Please choose a different username.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if email already exists
    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {'error': 'Email already exists. Please use a different email address.'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Send welcome email
        try:
            subject = 'Welcome to Veya - Registration Successful!'
            message = f'''Dear {first_name or username},

Thank you for registering with Veya!

You have successfully registered to Veya with the following details:
- Username: {username}
- Email: {email}

We're excited to have you as part of the Veya family. Start exploring our amazing collection of beauty products and enjoy exclusive offers!

Happy Shopping!
Team Veya
we have chemistry™

---
This is an automated email. Please do not reply to this email.
'''
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )
            print(f'Registration email sent successfully to {email}')
        except Exception as e:
            # Log the error but don't fail registration if email fails
            import traceback
            error_msg = f'Error sending registration email to {email}: {str(e)}\n{traceback.format_exc()}'
            print(error_msg)
            # You can also log to a file or send to monitoring service

        login(request, user)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'error': f'Registration failed: {str(e)}'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    if user is not None:
        # Clear any existing session first
        request.session.flush()
        # Create new session
        login(request, user)
        # Ensure session is saved
        request.session.save()
        
        # Send login confirmation email
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            subject = 'Veya - Login Successful'
            message = f'''Dear {user.first_name or user.username},

You have successfully logged in to your Veya account.

If this wasn't you, please contact our support team immediately.

Stay beautiful!
Team Veya
we have chemistry™

---
This is an automated email. Please do not reply to this email.
'''
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            print(f'Login confirmation email sent successfully to {user.email}')
        except Exception as e:
            import traceback
            error_msg = f'Error sending login email to {user.email}: {str(e)}\n{traceback.format_exc()}'
            print(error_msg)
        
        serializer = UserSerializer(user)
        return Response(serializer.data)
    else:
        return Response(
            {'error': 'Invalid username or password'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Allow logout even if session expired
def logout_view(request):
    import json
    import os
    from datetime import datetime
    
    log_path = r'c:\Users\HP\OneDrive\Desktop\ecommmer\.cursor\debug.log'
    
    try:
        # #region agent log
        session_key_before = request.session.session_key
        user_before = request.user.username if request.user.is_authenticated else None
        with open(log_path, 'a') as f:
            f.write(json.dumps({
                'location': 'views.py:297',
                'message': 'logout_view called',
                'data': {'session_key': session_key_before, 'user': user_before, 'is_authenticated': request.user.is_authenticated},
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sessionId': 'debug-session',
                'runId': 'run1',
                'hypothesisId': 'A'
            }) + '\n')
        # #endregion
        
        # Get session key before flushing
        session_key = request.session.session_key
        
        # Flush the session completely
        request.session.flush()
        
        # #region agent log
        with open(log_path, 'a') as f:
            f.write(json.dumps({
                'location': 'views.py:310',
                'message': 'Session flushed',
                'data': {'session_key_before': session_key, 'session_key_after': request.session.session_key},
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sessionId': 'debug-session',
                'runId': 'run1',
                'hypothesisId': 'A'
            }) + '\n')
        # #endregion
        
        # Also delete the session from database if it exists
        if session_key:
            from django.contrib.sessions.models import Session
            try:
                # Delete ALL sessions for this user, not just the current one
                user_id = request.user.id if request.user.is_authenticated else None
                deleted_count = Session.objects.filter(session_key=session_key).delete()[0]
                
                # Also delete any other sessions that might exist
                if user_id:
                    # Get all session data and check for this user
                    all_sessions = Session.objects.all()
                    additional_deleted = 0
                    for sess in all_sessions:
                        try:
                            session_data = sess.get_decoded()
                            if session_data.get('_auth_user_id') == str(user_id):
                                sess.delete()
                                additional_deleted += 1
                        except:
                            pass
                
                # #region agent log
                with open(log_path, 'a') as f:
                    f.write(json.dumps({
                        'location': 'views.py:318',
                        'message': 'Session deleted from DB',
                        'data': {'session_key': session_key, 'deleted_count': deleted_count, 'additional_deleted': additional_deleted if user_id else 0},
                        'timestamp': int(datetime.now().timestamp() * 1000),
                        'sessionId': 'debug-session',
                        'runId': 'run2',
                        'hypothesisId': 'A'
                    }) + '\n')
                # #endregion
            except Exception as db_error:
                # #region agent log
                with open(log_path, 'a') as f:
                    f.write(json.dumps({
                        'location': 'views.py:325',
                        'message': 'Session DB deletion error',
                        'data': {'error': str(db_error)},
                        'timestamp': int(datetime.now().timestamp() * 1000),
                        'sessionId': 'debug-session',
                        'runId': 'run2',
                        'hypothesisId': 'A'
                    }) + '\n')
                # #endregion
        
        # Call Django logout
        logout(request)
        
        # #region agent log
        with open(log_path, 'a') as f:
            f.write(json.dumps({
                'location': 'views.py:332',
                'message': 'Django logout called',
                'data': {'user_after': request.user.username if request.user.is_authenticated else None, 'is_authenticated': request.user.is_authenticated},
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sessionId': 'debug-session',
                'runId': 'run1',
                'hypothesisId': 'A'
            }) + '\n')
        # #endregion
        
        # Delete the session cookie with proper settings
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('sessionid', path='/', domain=None, samesite='Lax')
        response.delete_cookie('csrftoken', path='/', domain=None, samesite='Lax')
        
        # Also try to delete with different paths
        response.delete_cookie('sessionid', path='/api')
        response.delete_cookie('csrftoken', path='/api')
        
        # #region agent log
        with open(log_path, 'a') as f:
            f.write(json.dumps({
                'location': 'views.py:345',
                'message': 'Logout response created',
                'data': {'cookies_deleted': ['sessionid', 'csrftoken']},
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sessionId': 'debug-session',
                'runId': 'run1',
                'hypothesisId': 'A'
            }) + '\n')
        # #endregion
        
        return response
    except Exception as e:
        # #region agent log
        with open(log_path, 'a') as f:
            f.write(json.dumps({
                'location': 'views.py:352',
                'message': 'Logout exception',
                'data': {'error': str(e), 'error_type': type(e).__name__},
                'timestamp': int(datetime.now().timestamp() * 1000),
                'sessionId': 'debug-session',
                'runId': 'run1',
                'hypothesisId': 'D'
            }) + '\n')
        # #endregion
        # Even if logout fails, return success to clear frontend state
        response = Response({'message': 'Logged out successfully'})
        response.delete_cookie('sessionid', path='/', domain=None, samesite='Lax')
        response.delete_cookie('csrftoken', path='/', domain=None, samesite='Lax')
        response.delete_cookie('sessionid', path='/api')
        response.delete_cookie('csrftoken', path='/api')
        return response


@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_subscribe_view(request):
    from django.core.mail import send_mail
    from django.conf import settings
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    
    email = request.data.get('email', '').strip().lower()
    
    if not email:
        return Response(
            {'error': 'Email is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate email format
    try:
        validate_email(email)
    except ValidationError:
        return Response(
            {'error': 'Invalid email format'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Send subscription confirmation email to user
    try:
        subject = 'Welcome to Veya Newsletter!'
        message = f'''Thank you for subscribing to Veya Newsletter!

You will now receive:
- Latest beauty tips and trends
- Exclusive offers and discounts
- New product launches
- Expert skincare advice
- Special promotions

We're excited to share our beauty journey with you!

Stay beautiful!
Team Veya
we have chemistry™

---
This is an automated email. Please do not reply to this email.
To unsubscribe, please contact us at {settings.DEFAULT_FROM_EMAIL}
'''
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        print(f'Newsletter subscription email sent successfully to {email}')
    except Exception as e:
        import traceback
        error_msg = f'Error sending newsletter subscription email: {str(e)}\n{traceback.format_exc()}'
        print(error_msg)
    
    # Send notification to admin
    try:
        from datetime import datetime
        admin_subject = 'New Newsletter Subscription'
        admin_message = f'''New Newsletter Subscription!

Email: {email}
Subscription Date: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}

---
This is an automated notification from Veya E-commerce System.
'''
        send_mail(
            admin_subject,
            admin_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.DEFAULT_FROM_EMAIL],  # Send to connect.veya@gmail.com
            fail_silently=False,
        )
        print(f'Newsletter subscription notification sent to admin')
    except Exception as e:
        import traceback
        error_msg = f'Error sending admin newsletter notification: {str(e)}\n{traceback.format_exc()}'
        print(error_msg)
    
    return Response({'status': 'success', 'message': 'Successfully subscribed to newsletter'}, status=status.HTTP_200_OK)