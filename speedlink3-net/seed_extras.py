import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cms.models import Portfolio, ModuleScript, Category
from django.core.files.base import ContentFile

print("Seeding Portfolios and ModuleScripts...")

# 1. Create Portfolios
p1, created1 = Portfolio.objects.get_or_create(
    slug='aibm-cloud-erp',
    defaults={
        'title': 'AIBM Cloud ERP System',
        'description': 'A multi-tenant ledger and billing engine designed for enterprise automation. Features automated auditing loops, inventories, and custom financial reports.',
        'technologies': 'Django, PostgreSQL, Celery, Redis',
        'project_url': 'https://speedlink3.net/services/'
    }
)
if created1:
    print("- Seeded Portfolio: AIBM Cloud ERP")

p2, created2 = Portfolio.objects.get_or_create(
    slug='speedlink3-android-webview-app',
    defaults={
        'title': 'Speedlink3 WebView Android App',
        'description': 'A high-performance native WebView wrapper built for com.speedlink3.web. Features splash screens, offline page caching, and native AdMob container frames.',
        'technologies': 'Android Studio, Kotlin, Firebase Cloud Messaging, AdMob',
        'project_url': 'https://speedlink3.net/'
    }
)
if created2:
    print("- Seeded Portfolio: Speedlink3 WebView App")

# 2. Create ModuleScripts
dev_cat = Category.objects.filter(name='Software Development').first()

m1, created_m1 = ModuleScript.objects.get_or_create(
    slug='wordpress-sql-dump-parser-python',
    defaults={
        'title': 'WordPress SQL Dump Parser & Markdown Extractor',
        'description': 'A CLI tool written in Python to parse WordPress MySQL tables, clean up Gutenberg tags, and export content as clean markdown files with YAML frontmatter headers.',
        'version': '1.2.0',
        'category': dev_cat
    }
)
if created_m1:
    print("- Seeded ModuleScript: WordPress SQL Dump Parser")

m2, created_m2 = ModuleScript.objects.get_or_create(
    slug='django-glassmorphic-dark-theme-ui',
    defaults={
        'title': 'Django Glassmorphic Dark-Theme UI Framework',
        'description': 'A premium design layout system featuring background glow effects, backdrop blur filters, responsive article lists, and floating conversational chat elements.',
        'version': '1.0.5',
        'category': dev_cat
    }
)
if created_m2:
    print("- Seeded ModuleScript: Django Glassmorphic UI")

print("Seeding finished successfully.")
