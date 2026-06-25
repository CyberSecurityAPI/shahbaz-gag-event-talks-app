import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cms.models import Post, Page, Category
from django.contrib.auth.models import User

extracted_dir = r"C:\agy-cli-projects\speedlink3.net\extracted_content"

# Ensure admin user exists
admin_user = User.objects.get(username='admin')

# Ensure a default category exists for posts
default_cat, _ = Category.objects.get_or_create(name="Uncategorized")

print("Starting import of extracted WordPress posts and pages...")
imported_posts = 0
imported_pages = 0

if not os.path.exists(extracted_dir):
    print(f"Error: Extracted content directory does not exist at {extracted_dir}")
    exit(1)

for file in os.listdir(extracted_dir):
    if not file.endswith(".md"):
        continue
        
    filepath = os.path.join(extracted_dir, file)
    with open(filepath, "r", encoding="utf-8") as f:
        content_text = f.read()
        
    # Simple markdown frontmatter parser
    if content_text.startswith("---"):
        parts = content_text.split("---", 2)
        if len(parts) >= 3:
            frontmatter = parts[1]
            body = parts[2].strip()
            
            # Parse YAML-like frontmatter
            metadata = {}
            for line in frontmatter.strip().split("\n"):
                if ":" in line:
                    k, v = line.split(":", 1)
                    metadata[k.strip()] = v.strip().strip('"').strip("'")
            
            title = metadata.get("title", "No Title")
            slug = metadata.get("slug", file[:-3])
            post_type = metadata.get("type", "post")
            created_date = metadata.get("date")
            
            if post_type == "post":
                # Create or update Post
                post, created = Post.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": title,
                        "author": admin_user,
                        "content": body,
                        "status": "published",
                        "category": default_cat,
                        "seo_title": title,
                        "seo_description": body[:160]
                    }
                )
                if created:
                    imported_posts += 1
                    print(f"- Imported Post: {title}")
            elif post_type == "page":
                # Create or update Page
                page, created = Page.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": title,
                        "content": body,
                        "seo_title": title,
                        "seo_description": body[:160]
                    }
                )
                if created:
                    imported_pages += 1
                    print(f"- Imported Page: {title}")

print(f"\nImport finished successfully. Imported {imported_posts} posts and {imported_pages} pages.")
