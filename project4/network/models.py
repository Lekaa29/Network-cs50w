from django.contrib.auth.models import AbstractUser
from django.db import models

#posts likes followers

class User(AbstractUser):
    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "followers": self.followed_by.count(),
            "following": self.following.count(),  # Add the creator's ID for the profile link
        }
    
    pass

class Followers(models.Model):
    profile = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed_by")
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following")

class Post(models.Model):
    text = models.CharField(max_length=150)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    date = models.DateTimeField(auto_now_add=True)

    def serialize_user(self, user):
        return {
            "id": self.id,
            "text": self.text,
            "creator": self.creator.username, 
            "creatorId": self.creator.id,# or the user's full name
            "date": self.date.isoformat(),
            "is_liked": Like.objects.filter(user=user, post=self).exists(),
            "likes": Like.objects.filter(post=self).count() # Use ISO format for easier parsing on the client side
        }
    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "creator": self.creator.username, 
            "creatorId": self.creator.id,# or the user's full name
            "date": self.date.isoformat(),
            "likes": Like.objects.filter(post=self).count() # Use ISO format for easier parsing on the client side
        }
    
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")

