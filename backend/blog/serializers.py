from django.utils.text import slugify
from rest_framework import serializers
from .models import BlogCategory, BlogTag, BlogPost
from therapy.serializers import TherapistProfileSerializer

class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'description': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        name = (attrs.get('name') or '').strip()
        if not name:
            raise serializers.ValidationError({'name': 'Category name is required.'})
        attrs['name'] = name

        slug = (attrs.get('slug') or '').strip()
        if not slug:
            base = slugify(name) or 'category'
            slug = base
            counter = 2
            while BlogCategory.objects.filter(slug=slug).exclude(
                pk=getattr(self.instance, 'pk', None)
            ).exists():
                slug = f'{base}-{counter}'
                counter += 1
            attrs['slug'] = slug
        return attrs

class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
        }

    def validate(self, attrs):
        name = (attrs.get('name') or '').strip()
        if not name:
            raise serializers.ValidationError({'name': 'Tag name is required.'})
        attrs['name'] = name

        slug = (attrs.get('slug') or '').strip()
        if not slug:
            base = slugify(name) or 'tag'
            slug = base
            counter = 2
            while BlogTag.objects.filter(slug=slug).exclude(
                pk=getattr(self.instance, 'pk', None)
            ).exists():
                slug = f'{base}-{counter}'
                counter += 1
            attrs['slug'] = slug
        return attrs

class BlogPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_avatar = serializers.URLField(source='author.profile_image_url', read_only=True)
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'cover_image_url', 'author_name', 'author_avatar',
            'category', 'tags', 'status', 'published_at', 'created_at', 'meta_description'
        ]

class BlogPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_avatar = serializers.URLField(source='author.profile_image_url', read_only=True)
    category = BlogCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), source='category', write_only=True, required=False, allow_null=True
    )
    tags = BlogTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=BlogTag.objects.all(), source='tags', write_only=True, many=True, required=False
    )
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'content', 'cover_image_url', 'author_name', 'author_avatar',
            'category', 'category_id', 'tags', 'tag_ids', 'status', 'published_at', 'created_at', 'updated_at',
            'meta_title', 'meta_description', 'meta_keywords'
        ]

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        post = BlogPost.objects.create(**validated_data)
        if tags:
            post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        return instance
