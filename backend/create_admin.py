import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.models import CustomUser

username = 'admin'
email = 'admin@example.com'
password = 'admin123'

print(f"Connecting to database: {settings.DATABASES['default']['HOST']}")

user, created = CustomUser.objects.get_or_create(username=username)
user.set_password(password)
user.email = email
user.is_staff = True
user.is_superuser = True
user.role = 'ADMIN'
user.save()

if created:
    print(f"Successfully created user: {username}")
else:
    print(f"Successfully updated existing user: {username}")

print("All users currently in database:")
for u in CustomUser.objects.all():
    print(f"- {u.username} ({u.role})")
