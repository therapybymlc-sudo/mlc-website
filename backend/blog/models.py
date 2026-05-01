from django.db import models
from therapy.models import TherapistProfile

class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = "Blog Categories"

    def __str__(self):
        return self.name

class BlogTag(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class BlogPost(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    author = models.ForeignKey(TherapistProfile, on_delete=models.SET_NULL, null=True, related_name="blog_posts")
    cover_image_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Rich Text Content
    content = models.TextField()
    
    # SEO & Metadata
    meta_title = models.CharField(max_length=255, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.TextField(blank=True, null=True, help_text="Comma separated keywords")
    
    # Relations
    category = models.ForeignKey(BlogCategory, on_delete=models.SET_NULL, null=True, related_name="posts")
    tags = models.ManyToManyField(BlogTag, related_name="posts", blank=True)
    
    # Status
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title
