from django.contrib import admin
from .models import UserManager, User, UserPreference

# Register your models here.
admin.site.register([
    'UserManager',
    'User',
    'UserPreference'
])