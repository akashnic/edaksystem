from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('RECEIVER', 'Receiver Operator'),
        ('DISPATCHER', 'Dispatcher Operator'),
    )
    
    full_name = models.CharField(max_length=255, null=True, blank=True)
    department = models.CharField(max_length=255, null=True, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='RECEIVER')
    
    def __str__(self):
        return f"{self.username} ({self.role})"
