# scratch/list_urls.py
import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.urls import get_resolver

def list_urls(lis, prefix=''):
    for entry in lis:
        if hasattr(entry, 'url_patterns'):
            list_urls(entry.url_patterns, prefix + str(entry.pattern))
        else:
            print(f"{prefix}{str(entry.pattern)}")

print("--- REGISTERED CLINICAL ROUTES ---")
list_urls(get_resolver().url_patterns)
