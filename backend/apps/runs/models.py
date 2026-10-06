import uuid
from django.db import models
from django.conf import settings

class Run(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='runs')
    title = models.CharField(max_length=200, default='Outdoor Run')
    distance_meters = models.FloatField()
    duration_seconds = models.PositiveIntegerField()
    avg_pace_sec_km = models.PositiveIntegerField()
    max_pace_sec_km = models.PositiveIntegerField(blank=True, null=True)
    elevation_gain_meters = models.FloatField(default=0.0)
    calories_burned = models.PositiveIntegerField(blank=True, null=True)
    polyline = models.TextField(blank=True, default='')
    started_at = models.DateTimeField()
    completed_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-started_at']

class RunPoint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run = models.ForeignKey(Run, on_delete=models.CASCADE, related_name='points')
    latitude = models.FloatField()
    longitude = models.FloatField()
    altitude = models.FloatField(blank=True, null=True)
    speed = models.FloatField(blank=True, null=True)
    accuracy = models.FloatField(blank=True, null=True)
    sequence_order = models.PositiveIntegerField()
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ['sequence_order']

class RunSplit(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    run = models.ForeignKey(Run, on_delete=models.CASCADE, related_name='splits')
    split_number = models.PositiveSmallIntegerField()
    distance_meters = models.FloatField(default=1000.0)
    duration_seconds = models.PositiveIntegerField()
    pace_sec_km = models.PositiveIntegerField()
    elevation_change = models.FloatField(default=0.0)

    class Meta:
        ordering = ['split_number']
