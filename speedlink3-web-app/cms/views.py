from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Post, Page, Category, Portfolio, ModuleScript

def home_view(request):
    posts = Post.objects.filter(status='published').order_by('-created_at')[:3]
    portfolios = Portfolio.objects.order_by('-created_at')[:3]
    context = {
        'recent_posts': posts,
        'recent_portfolios': portfolios,
        'seo': {
            'title': 'Speedlink3 AI Technologies - Enterprise Cloud & Cognitive AI Solutions',
            'description': 'Speedlink3 AI Technologies delivers premium Cloud ERP, Managed Web Hosting, Cognitive AI pipelines, and full-stack software development.'
        }
    }
    return render(request, 'home.html', context)


def about_view(request):
    context = {
        'seo': {
            'title': 'About Us - Speedlink3 AI Technologies',
            'description': 'Discover our vision, technology leadership, and journey from bespoke software engineering to enterprise AI governance.'
        }
    }
    return render(request, 'about.html', context)


def services_view(request):
    context = {
        'seo': {
            'title': 'Our Services - Cloud, Web, & Cognitive AI',
            'description': 'Explore our enterprise systems: AIBM Cloud ERP, NVMe Web Hosting, Cognitive AI integration, and world-class app development.'
        }
    }
    return render(request, 'services.html', context)


def contact_view(request):
    if request.method == 'POST':
        # Simple handler for mock contact submissions
        name = request.POST.get('name')
        email = request.POST.get('email')
        message = request.POST.get('message')
        # Here we could save a ContactMessage model, send an email, etc.
        return render(request, 'contact.html', {
            'success': True,
            'seo': {'title': 'Contact Success - Speedlink3'}
        })
        
    context = {
        'seo': {
            'title': 'Contact Us - Get in Touch with Our Tech Team',
            'description': 'Have a project in mind? Contact our engineering team for high-end web, database, and AI pipeline consultations.'
        }
    }
    return render(request, 'contact.html', context)


def insights_view(request):
    posts = Post.objects.filter(status='published').order_by('-created_at')
    categories = Category.objects.all()
    
    category_slug = request.GET.get('category')
    if category_slug:
        posts = posts.filter(category__slug=category_slug)
        
    context = {
        'posts': posts,
        'categories': categories,
        'selected_category': category_slug,
        'seo': {
            'title': 'Insights & Tech News - Speedlink3 AI Technologies',
            'description': 'Read our latest insights, tutorials on networking, server commands, database management, and programming best practices.'
        }
    }
    return render(request, 'insights.html', context)


def post_detail_view(request, slug):
    post = get_object_or_404(Post, slug=slug, status='published')
    context = {
        'post': post,
        'seo': {
            'title': post.seo_title or f"{post.title} - Speedlink3 Insights",
            'description': post.seo_description or post.content[:160],
            'og_image': post.og_image.url if post.og_image else None
        }
    }
    return render(request, 'post_detail.html', context)


def page_detail_view(request, slug):
    page = get_object_or_404(Page, slug=slug)
    context = {
        'page': page,
        'seo': {
            'title': page.seo_title or f"{page.title} - Speedlink3",
            'description': page.seo_description or page.content[:160]
        }
    }
    return render(request, 'page_detail.html', context)



def api_posts_list(request):
    """Mock API returning all published articles in JSON format."""
    posts = Post.objects.filter(status='published').order_by('-created_at')
    data = [{
        'id': p.id,
        'title': p.title,
        'slug': p.slug,
        'created_at': p.created_at.isoformat(),
        'category': p.category.name if p.category else 'Uncategorized',
        'excerpt': p.excerpt or p.content[:200]
    } for p in posts]
    return JsonResponse({'status': 'success', 'data': data})


@csrf_exempt
def ai_chat_agent_api(request):
    """API for the integrated web AI chat widget."""
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            user_message = body.get('message', '').strip().lower()
            
            # Simple rule-based mock responses representing the Speedlink3 AI Agent
            response_text = "Thank you for reaching out to Speedlink3 AI Technologies. How can we help you today?"
            
            if "erp" in user_message or "aibm" in user_message:
                response_text = "Our flagship product is the **AIBM Cloud ERP Software**, designed to handle accounting, inventory, and multi-tenant ledger setups. Let us know if you'd like a custom demo!"
            elif "host" in user_message or "server" in user_message:
                response_text = "We offer **900% Faster NVMe Web Hosting** in Bangladesh with secure SSD infrastructures. Let us know your storage needs to get a quotation!"
            elif "contact" in user_message or "hire" in user_message:
                response_text = "You can fill out our Contact Form or email us directly at info@speedlink3.net. Our team usually replies within 2 hours."
            elif "hello" in user_message or "hi" in user_message:
                response_text = "Hello! I am the Speedlink3 AI Assistant. I can tell you about our AIBM ERP Software, Managed Hosting, or Full-Stack Web Development services. What are you interested in?"
                
            return JsonResponse({'status': 'success', 'reply': response_text})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
            
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=405)


from django.contrib.auth import login as auth_login, logout as auth_logout, authenticate
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.shortcuts import redirect
from django.db.models import Sum
import base64

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')
        
    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '')
        confirm_password = request.POST.get('confirm_password', '')
        terms = request.POST.get('terms')
        
        if not terms:
            error = "You must agree to the Terms of Service & Privacy Policy."
        elif password != confirm_password:
            error = "Passwords do not match."
        elif User.objects.filter(username=username).exists():
            error = "Username already exists."
        elif User.objects.filter(email=email).exists():
            error = "Email address already registered."
        else:
            try:
                # Create user
                user = User.objects.create_user(username=username, email=email, password=password)
                auth_login(request, user)
                
                # Check role and redirect
                if hasattr(user, 'profile') and user.profile.role == 'super_admin':
                    return redirect('dashboard')
                return redirect('home')
            except Exception as e:
                error = f"Error creating account: {str(e)}"
                
    context = {
        'error': error,
        'seo': {
            'title': 'Sign Up - Speedlink3 AI Technologies',
            'description': 'Create a Speedlink3 developer account to access script modules and API resources.'
        }
    }
    return render(request, 'signup.html', context)


def login_view(request):
    if request.user.is_authenticated:
        if hasattr(request.user, 'profile') and request.user.profile.role == 'super_admin':
            return redirect('dashboard')
        return redirect('home')
        
    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        
        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            
            # Check role and redirect
            if hasattr(user, 'profile') and user.profile.role == 'super_admin':
                return redirect('dashboard')
            return redirect('home')
        else:
            error = "Invalid username or password credentials."
            
    context = {
        'error': error,
        'seo': {
            'title': 'Sign In - Speedlink3 AI Technologies',
            'description': 'Log in to your Speedlink3 developer console.'
        }
    }
    return render(request, 'login.html', context)


def logout_view(request):
    auth_logout(request)
    return redirect('home')


@csrf_exempt
def google_auth_callback(request):
    """Callback view to process credentials from Google One Tap Sign-In."""
    if request.method == 'POST':
        credential = request.POST.get('credential')
        if not credential:
            return JsonResponse({'status': 'error', 'message': 'No credential token supplied'}, status=400)
            
        try:
            # Decode JWT payload (Header.Payload.Signature)
            parts = credential.split('.')
            if len(parts) != 3:
                return JsonResponse({'status': 'error', 'message': 'Malformed JWT'}, status=400)
                
            payload_b64 = parts[1]
            payload_b64 += '=' * (-len(payload_b64) % 4)  # Add base64 padding
            payload_decoded = base64.b64decode(payload_b64).decode('utf-8')
            user_info = json.loads(payload_decoded)
            
            email = user_info.get('email')
            google_sub = user_info.get('sub')
            name = user_info.get('name', '')
            avatar = user_info.get('picture', '')
            
            if not email:
                return JsonResponse({'status': 'error', 'message': 'OAuth payload lacks email'}, status=400)
                
            # Get or create user
            user = User.objects.filter(email=email).first()
            if not user:
                # Generate unique username
                username = email.split('@')[0]
                counter = 1
                orig_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{orig_username}{counter}"
                    counter += 1
                    
                user = User.objects.create_user(username=username, email=email)
                # Password-less google user, set dummy
                user.set_unusable_password()
                user.save()
                
            # Log user in
            auth_login(request, user)
            
            # Map avatar and sub inside UserProfile
            profile = user.profile
            profile.google_id = google_sub
            profile.avatar_url = avatar
            profile.save()
            
            if profile.role == 'super_admin':
                return redirect('dashboard')
            return redirect('home')
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'JWT Decode failed: {str(e)}'}, status=400)
            
    return redirect('login')


@login_required
def dashboard_view(request):
    # Enforce role-based access to dashboard (only super_admin allowed)
    profile = request.user.profile
    if profile.role != 'super_admin':
        return render(request, '403.html', status=403)
        
    # Handle role/package changes or manual notice broadcasts via POST
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'update_role':
            profile_id = request.POST.get('profile_id')
            new_role = request.POST.get('role')
            target_profile = get_object_or_404(UserProfile, id=profile_id)
            target_profile.role = new_role
            target_profile.save()
        elif action == 'update_package':
            profile_id = request.POST.get('profile_id')
            package_id = request.POST.get('package_id')
            target_profile = get_object_or_404(UserProfile, id=profile_id)
            if package_id:
                target_profile.subscription_package = get_object_or_404(SubscriptionPackage, id=package_id)
            else:
                target_profile.subscription_package = None
            target_profile.save()
        elif action == 'trigger_alert':
            target_user_id = request.POST.get('user_id')
            title = request.POST.get('title', 'System Notice').strip()
            msg = request.POST.get('message', '').strip()
            if target_user_id and msg:
                target_user = get_object_or_404(User, id=target_user_id)
                AlertNotification.objects.create(user=target_user, title=title, message=msg)
                
        return redirect('dashboard')

    # Aggregate operational metrics
    total_users = User.objects.count()
    live_visitors = VisitorLog.objects.filter(is_live=True).count()
    total_visitors = VisitorLog.objects.count()
    unique_ips = VisitorLog.objects.values('ip_address').distinct().count()
    total_revenue = SaleRecord.objects.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0.00
    
    # Retrieve telemetry tables
    recent_visitors = VisitorLog.objects.order_by('-timestamp')[:15]
    recent_sales = SaleRecord.objects.filter(status='completed').order_by('-timestamp')[:10]
    recent_alerts = AlertNotification.objects.all().order_by('-created_at')[:10]
    recent_crons = CronTaskLog.objects.all().order_by('-run_at')[:10]
    
    # Load user directories
    user_profiles = UserProfile.objects.select_related('user', 'subscription_package').all().order_by('-created_at')[:20]
    packages = SubscriptionPackage.objects.all()
    all_users = User.objects.all()
    
    context = {
        'total_users': total_users,
        'live_visitors': live_visitors,
        'total_visitors': total_visitors,
        'unique_ips': unique_ips,
        'total_revenue': total_revenue,
        'recent_visitors': recent_visitors,
        'recent_sales': recent_sales,
        'recent_alerts': recent_alerts,
        'recent_crons': recent_crons,
        'user_profiles': user_profiles,
        'packages': packages,
        'all_users': all_users,
        'seo': {
            'title': 'Super-Admin Analytical Dashboard - Speedlink3 AI Technologies',
            'description': 'Real-time monitoring console mapping visitors, active role-based user packages, billing records, and scheduler cron outputs.'
        }
    }
    return render(request, 'dashboard.html', context)

