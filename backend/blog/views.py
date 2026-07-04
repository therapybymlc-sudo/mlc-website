from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from django.utils import timezone
from .models import BlogPost, BlogCategory, BlogTag
from .serializers import (
    BlogPostListSerializer, BlogPostDetailSerializer,
    BlogCategorySerializer, BlogTagSerializer
)

class PublicBlogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Publicly accessible endpoints for the blog directory and details.
    Allows searching by keywords, tags, and categories.
    """
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    def get_queryset(self):
        # Only return published posts for the public API
        queryset = BlogPost.objects.filter(status='published').select_related('author', 'category').prefetch_related('tags')
        
        # Smart Search & Filtering
        search_query = self.request.query_params.get('search', None)
        category_slug = self.request.query_params.get('category', None)
        tag_slugs = self.request.query_params.getlist('tags', [])
        
        if search_query:
            # Full-text style search across title, content, meta_keywords, and tags
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(content__icontains=search_query) |
                Q(meta_keywords__icontains=search_query) |
                Q(tags__name__icontains=search_query)
            ).distinct()
            
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
            
        if tag_slugs:
            # Must contain any of the tags
            queryset = queryset.filter(tags__slug__in=tag_slugs).distinct()
            
        return queryset

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    @action(detail=False, methods=['get'])
    def meta_data(self, request):
        """Returns available categories and tags for the filter sidebar."""
        categories = BlogCategorySerializer(BlogCategory.objects.all(), many=True).data
        tags = BlogTagSerializer(BlogTag.objects.all(), many=True).data
        return Response({
            'categories': categories,
            'tags': tags
        })


class AdminBlogViewSet(viewsets.ModelViewSet):
    """
    Admin endpoints for managing blog posts.
    Requires authentication. Role checks should ideally be enforced here.
    """
    permission_classes = [permissions.IsAuthenticated]
    queryset = BlogPost.objects.all().select_related('author', 'category').prefetch_related('tags')
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostDetailSerializer

    def perform_create(self, serializer):
        # Automatically assign the author if not passed
        author = getattr(self.request.user, 'therapist_profile', None)
        # Handle slug generation if needed, but assuming frontend sends it
        published_at = timezone.now() if serializer.validated_data.get('status') == 'published' else None
        serializer.save(author=author, published_at=published_at)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get('status', instance.status)

        if new_status == 'published' and (instance.status != 'published' or not instance.published_at):
            serializer.save(published_at=timezone.now())
        else:
            serializer.save()

class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer

class AdminTagViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
