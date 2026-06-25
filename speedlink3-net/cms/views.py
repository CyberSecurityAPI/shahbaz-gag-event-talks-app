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
