import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cms.models import Post, Page, Category

# Define categories
categories_def = {
    'Cloud & Hosting': [
        'cloud-erp-for-business-management',
        'nvme-web-hosting-in-bangladesh'
    ],
    'Software Development': [
        'best-linux-distros-of-2023',
        'build-ludo-game-in-python',
        'google-apis-explorer-google-for-developers',
        'how-to-configure-android-studio-properly',
        'html-entities-currency-symbols-and-ascii-currency-character-code-reference',
        'top-15-php-projects-ideas-and-topics-with-free-source-code-2024'
    ],
    'Networking': [
        'bdcom-olt-show-cli-commands',
        'networking-what-it-is-and-how-to-do-it-successfully',
        'types-of-computer-network'
    ],
    'Compliance & Policies': [
        'play-store-app-developer-policy',
        'unsubscribe-user-data-deletion'
    ],
    'News & Events': [
        'google-next-24-is-our-global-exhibition-on-apr-9-11-2024-mandalay-bay-las-vegas'
    ]
}

print("Starting recategorization process...")

for cat_name, slugs in categories_def.items():
    # Get or create category
    category, _ = Category.objects.get_or_create(name=cat_name)
    print(f"\nCategory: {category.name}")
    
    # Update matching Posts
    updated_posts = Post.objects.filter(slug__in=slugs).update(category=category)
    print(f"  - Updated {updated_posts} posts")
    
    # Update matching Pages (if pages have category fields, though in models Page does not have category, let's keep it safe)
    # Check if Page has category
    if hasattr(Page, 'category'):
        updated_pages = Page.objects.filter(slug__in=slugs).update(category=category)
        print(f"  - Updated {updated_pages} pages")

# Clean up empty default "Uncategorized" category if no posts belong to it
uncategorized = Category.objects.filter(name="Uncategorized").first()
if uncategorized:
    posts_count = uncategorized.posts.count()
    modules_count = uncategorized.modules.count()
    if posts_count == 0 and modules_count == 0:
        uncategorized.delete()
        print("\nDeleted empty Uncategorized category.")

print("\nRecategorization complete.")
