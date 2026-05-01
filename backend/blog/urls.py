from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicBlogViewSet, AdminBlogViewSet, AdminCategoryViewSet, AdminTagViewSet

router = DefaultRouter()
router.register(r'public/posts', PublicBlogViewSet, basename='public-blog')
router.register(r'admin/posts', AdminBlogViewSet, basename='admin-blog')
router.register(r'admin/categories', AdminCategoryViewSet, basename='admin-category')
router.register(r'admin/tags', AdminTagViewSet, basename='admin-tag')

urlpatterns = [
    path('', include(router.urls)),
]
