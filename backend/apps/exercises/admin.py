from django.contrib import admin
from .models import Exercise

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'primary_muscle', 'difficulty', 'media_type', 'is_media_active', 'updated_at')
    list_filter = ('type', 'primary_muscle', 'difficulty', 'media_type', 'is_media_active')
    search_fields = ('name', 'primary_muscle', 'equipment')
    readonly_fields = ('id', 'created_at', 'updated_at')

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'name', 'type', 'difficulty', 'primary_muscle', 'secondary_muscles', 'muscle_groups', 'equipment')
        }),
        ('Instructions & Coaching', {
            'fields': ('instructions', 'form_tips', 'breathing', 'common_mistakes')
        }),
        ('Exercise Media & Demonstrations', {
            'fields': ('media_type', 'media_source', 'animation_url', 'video_url', 'thumbnail_url', 'media_url', 'is_media_active'),
            'description': 'Configure demonstration media (animation, video, gif, 3D model, or vector illustration).'
        }),
        ('Progression Variations', {
            'fields': ('easier_variation_id', 'harder_variation_id'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
