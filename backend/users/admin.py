from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import residuo, contabilidad, User

admin.site.register(User, UserAdmin)
admin.site.register(residuo)
admin.site.register(contabilidad)