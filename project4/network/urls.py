
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    
    path("follow/<int:profile_id>", views.follow, name="follow"),
    path("posts/<str:type>", views.get_posts, name="get_posts"),
    path("create_post", views.create_post, name="create_post"),
    path("profile/<int:profile_id>", views.profile, name="profile"),
    path('like/<int:post_id>', views.like_post, name='like_post'),
    path('unlike/<int:post_id>', views.unlike_post, name='unlike_post'),
    path("post/<int:postid>", views.get_post, name="get_post"),
    path("edit-post/<int:postid>", views.edit_post, name="edit-post")
]
