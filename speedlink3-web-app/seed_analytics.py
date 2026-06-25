import os
import django
import random
import datetime
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from cms.models import SubscriptionPackage, UserProfile, VisitorLog, SaleRecord, AlertNotification, CronTaskLog

print("Starting analytics, billing, and roles database seeding...")

# 1. Ensure Subscription Packages exist
packages_data = [
    ('Guest Tier', 'guest-tier', 0.00, 'Basic free tier access to public developer policy pages.', 0),
    ('Developer Pro', 'developer-pro', 999.00, 'Access to technical tutorials, custom script templates, and community code blocks.', 15),
    ('Enterprise Suite', 'enterprise-suite', 4999.00, 'Direct API access, direct modules downloads, custom AIBM Cloud ERP demo, and 1-on-1 developer consultations.', 999)
]

packages = []
for name, slug, price, desc, limit in packages_data:
    pkg, created = SubscriptionPackage.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'price': price,
            'description': desc,
            'allowed_downloads': limit
        }
    )
    packages.append(pkg)
    if created:
        print(f"- Seeded Package: {name}")

# 2. Update existing 'admin' user profile to 'super_admin'
admin_user = User.objects.filter(username='admin').first()
if admin_user:
    profile, _ = UserProfile.objects.get_or_create(user=admin_user)
    profile.role = 'super_admin'
    profile.subscription_package = SubscriptionPackage.objects.get(slug='enterprise-suite')
    profile.save()
    print(f"- Mapped user '{admin_user.username}' to role: {profile.get_role_display()}")

# 3. Create other mock users for subscriber logs
users_data = [
    ('jane_dev', 'jane@dev.io', 'subscriber', 'developer-pro'),
    ('mark_architect', 'mark@cloudcorp.com', 'subscriber', 'enterprise-suite'),
    ('steve_coder', 'steve@git.net', 'guest', 'guest-tier'),
    ('alice_editor', 'alice@news.speedlink3.net', 'creator', None)
]

for username, email, role, pkg_slug in users_data:
    user, created = User.objects.get_or_create(username=username, email=email)
    if created:
        user.set_password('pass1234')
        user.save()
        print(f"- Created User: {username}")
        
    profile, _ = UserProfile.objects.get_or_create(user=user)
    profile.role = role
    if pkg_slug:
        profile.subscription_package = SubscriptionPackage.objects.get(slug=pkg_slug)
    profile.save()

# 4. Seed Visitor Logs (capturing page views and unique IPs)
paths = ['/', '/services/', '/about/', '/contact/', '/insights/', '/insights/bdcom-olt-show-cli-commands/', '/insights/best-linux-distros-of-2023/', '/insights/cloud-erp-for-business-management/']
user_agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36 Speedlink3AndroidApp/1.0.0', # WebView Agent
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.1 Mobile/15E148 Safari/604.1'
]

print("Generating mock visitor logs...")
# Clear existing to start clean
VisitorLog.objects.all().delete()

# Create 40 past visitor logs
for i in range(40):
    ip = f"103.112.54.{random.randint(10, 250)}"
    path = random.choice(paths)
    ua = random.choice(user_agents)
    # Spanning last 24 hours
    offset = random.randint(10, 1440)
    timestamp = timezone.now() - datetime.timedelta(minutes=offset)
    
    log = VisitorLog(
        ip_address=ip,
        path=path,
        user_agent=ua,
        is_live=False
    )
    log.save()
    # Force override auto_now_add timestamp
    VisitorLog.objects.filter(id=log.id).update(timestamp=timestamp)

# Create 8 live visitor logs (within last 3 minutes)
for i in range(8):
    ip = f"203.82.190.{random.randint(10, 250)}"
    path = random.choice(paths)
    ua = random.choice(user_agents)
    timestamp = timezone.now() - datetime.timedelta(seconds=random.randint(10, 180))
    
    log = VisitorLog(
        ip_address=ip,
        path=path,
        user_agent=ua,
        is_live=True
    )
    log.save()
    VisitorLog.objects.filter(id=log.id).update(timestamp=timestamp)

# 5. Seed Sale Records
print("Generating mock sales logs...")
SaleRecord.objects.all().delete()

sales_data = [
    ('jane_dev', 999.00, 'Developer Pro Monthly Subscription', 'TXN-9018471'),
    ('mark_architect', 4999.00, 'Enterprise Suite Monthly Subscription', 'TXN-5820194'),
    ('steve_coder', 999.00, 'Developer Pro Monthly Subscription', 'TXN-1209384'),
]

for username, amount, service, txn_id in sales_data:
    user = User.objects.filter(username=username).first()
    SaleRecord.objects.create(
        user=user,
        amount=amount,
        service_name=service,
        transaction_id=txn_id,
        status='completed'
    )

# 6. Seed Cron Logs
print("Generating scheduler cron logs...")
CronTaskLog.objects.all().delete()

cron_runs = [
    ('RSS News Publisher', 'success', 'Feed aggregator fetched 4 draft updates from RSS stream successfully.'),
    ('Revenue Daily Auditor', 'success', 'Daily sales sum checked, matched against SSLCommerz payment database.'),
    ('System Cleanup Utility', 'success', 'Flushed 104 older idle sessions logs.'),
    ('Auto Email Broadcaster', 'success', 'Periodic news digest dispatched successfully to 14 active subscribers.')
]

for task, status, details in cron_runs:
    CronTaskLog.objects.create(
        task_name=task,
        status=status,
        details=details
    )

print("Database seeding completed successfully.")
