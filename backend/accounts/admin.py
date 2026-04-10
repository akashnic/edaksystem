from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'full_name', 'role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Details', {'fields': ('full_name', 'department', 'role')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Profile Details', {
            'classes': ('wide',),
            'fields': ('full_name', 'department', 'role'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)
