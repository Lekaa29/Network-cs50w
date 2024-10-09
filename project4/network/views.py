from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.decorators import login_required
import json
from django.http import JsonResponse


from .models import User, Post, Followers, Like 


def index(request):
    return render(request, "network/index.html", {
        'user': request.user
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
@csrf_exempt
def create_post(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        print("create_post")
        text = data.get('text')
        
        new_post = Post(text=text, creator=request.user)
        new_post.save()
        
        test = Post.objects.all()
        for post in test:
            print(post.text)
        
        return JsonResponse({"message": "Post created successfully."}, status=201)

    return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

        
def get_posts(request, type):
    start = int(request.GET.get("start") or 0)
    if start == 1:
        start = 0
    end = int(request.GET.get("end") or 9)
    print("getting posts")
    
    print(request.GET.get('userid'))
    
    posts = Post.objects.none()
    print(type)
    if type == "main":
        posts = Post.objects.all()
    elif type == "following":
        posts = Post.objects.filter(creator__in=Followers.objects.filter(follower=request.user).values('profile'))
    elif type == "profile":
        profile_id = int(request.GET.get("userid"))
        profile = User.objects.get(pk=profile_id)
        posts = Post.objects.filter(creator=profile)
    elif type == "all_posts":
        posts = Post.objects.all()
    else:
        posts = Post.objects.filter(creator=request.user)
    
    posts = posts.order_by("-date").all()
    count = len(posts)
    print(posts[0], start)
    posts = posts[start:end + 1]
    print("POSTS:", posts)
    print(posts[0])
    
    user = request.user.id or 0
    print("jebemti mater", user)
    if (user):
        serialized_posts = [post.serialize_user(request.user) for post in posts]
    else:
        serialized_posts = [post.serialize() for post in posts]
    
    response_data = {
        "posts": serialized_posts,  # Serialize the profile data
        "post_count": count    # Whether the current user is following the profile
    }
    
    return JsonResponse(response_data, safe=False)

def edit_post(request, postid):
    data = json.loads(request.body.decode('utf-8'))
    print("create_post")
    text = data.get('text')
    
    post = Post.objects.get(pk=postid)
    post.text = text
    post.save()
    
    return JsonResponse({"message": "Post edited successfully."}, status=201)

    
    

@login_required
def follow(request, profile_id):
    profile = User.objects.get(pk=profile_id)
    
    follow = Followers.objects.filter(profile=profile, follower=request.user)
    
    if follow:
        follow.delete()
        
        return JsonResponse({"message": "Unfollowed successfully."}, status=201)

    
    new_follower = Followers(profile=profile, follower=request.user)
    new_follower.save()
    
    return JsonResponse({"message": "Followed successfully."}, status=201)


def profile(request, profile_id):
    profile = User.objects.get(pk=profile_id)
    
    print("bkt mazo",request.user)
    user = request.user.id or 0
    if(user):
        is_following = Followers.objects.filter(profile=profile, follower=request.user).exists()
    else:
        is_following = False
    response = [profile, follow]
    response_data = {
        "profile": profile.serialize(),  # Serialize the profile data
        "is_following": is_following     # Whether the current user is following the profile
    }
    
    return JsonResponse(response_data)

def like_post(request, post_id):
    post = Post.objects.get(pk=post_id)
    Like.objects.get_or_create(user=request.user, post=post)
    return JsonResponse({"message": "Post liked successfully"}, status=201)

def unlike_post(request, post_id):
    post = Post.objects.get(pk=post_id)
    Like.objects.filter(user=request.user, post=post).delete()
    return JsonResponse({"message": "Post unliked successfully"}, status=200)

def get_post(request, postid):
    post = Post.objects.get(pk=postid)
    
    return JsonResponse(post.serialize_user(user=request.user), safe=False)

    
    