import uuid
from django.db import models
from django.conf import settings

class FeedPost(models.Model):
    class PostType(models.TextChoices):
        TEXT = 'TEXT', 'Text'
        IMAGE = 'IMAGE', 'Image'
        VIDEO = 'VIDEO', 'Video'
        WORKOUT = 'WORKOUT', 'Workout'
        RUN = 'RUN', 'Run'
        PERSONAL_RECORD = 'PERSONAL_RECORD', 'Personal Record'
        STREAK = 'STREAK', 'Streak'
        RANK_PROMOTION = 'RANK_PROMOTION', 'Rank Promotion'
        MILESTONE = 'MILESTONE', 'Milestone'

    class MediaType(models.TextChoices):
        NONE = 'NONE', 'None'
        IMAGE = 'IMAGE', 'Image'
        VIDEO = 'VIDEO', 'Video'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    title = models.CharField(max_length=200, blank=True, default='')
    caption = models.TextField(blank=True, default='')
    post_type = models.CharField(max_length=50, choices=PostType.choices, default=PostType.WORKOUT)
    media_url = models.CharField(max_length=500, blank=True, null=True)
    media_type = models.CharField(max_length=20, choices=MediaType.choices, default=MediaType.NONE)
    thumbnail_url = models.CharField(max_length=500, blank=True, null=True)
    xp_earned = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Workout / Run specific metrics
    total_volume_kg = models.FloatField(blank=True, null=True)
    distance_meters = models.FloatField(blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    pr_exercise_name = models.CharField(max_length=150, blank=True, null=True)
    pr_value = models.FloatField(blank=True, null=True)
    
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user} - {self.post_type} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

class PostLike(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')

class PostComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class PostReport(models.Model):
    class ReportReason(models.TextChoices):
        SPAM = 'SPAM', 'Spam'
        HARASSMENT = 'HARASSMENT', 'Harassment'
        INAPPROPRIATE = 'INAPPROPRIATE', 'Inappropriate Content'
        HATE_ABUSIVE = 'HATE_ABUSIVE', 'Hate or Abusive Content'
        MISLEADING = 'MISLEADING', 'Misleading Information'
        OTHER = 'OTHER', 'Other'

    class ReportStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        RESOLVED = 'RESOLVED', 'Resolved'
        DISMISSED = 'DISMISSED', 'Dismissed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(FeedPost, on_delete=models.CASCADE, related_name='reports')
    reported_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_reports')
    reason = models.CharField(max_length=50, choices=ReportReason.choices, default=ReportReason.SPAM)
    details = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, choices=ReportStatus.choices, default=ReportStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
