document.addEventListener('DOMContentLoaded', () => {
    
    document.querySelector('#all-posts-nav').addEventListener('click', () => load_all_posts());
    if (document.querySelector('#following-nav')){
        
        document.querySelector('#following-nav').addEventListener('click', () => load_following());
    }
    console.log("radi");
    // By default, load the inbox
    
    
    if (document.querySelector('#profile-nav')){
        document.querySelector('#main-nav').addEventListener('click', () => load_main());
        document.querySelector('#profile-nav').addEventListener('click', () => load_profile(userId));
        load_main();
    }
    else{
        document.querySelector('#main-nav').addEventListener('click', () => load_main_notlogged());
        load_main_notlogged();
    }
   

    


})

function load_following(){
    console.log("load_following");
    document.querySelector('#main').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#following').style.display = 'block';
    document.querySelector('#edit-post').style.display = 'none';

    console.log("doc:" + document.querySelector('#following'));
    let counter = 1;
    const quantity = 10;

    load_posts("following", counter, quantity, 0);
}

function edit_post(postId, event){
    event.preventDefault();
    document.querySelector('#main').style.display = 'none';
    document.querySelector('#profile').style.display = 'none';
    document.querySelector('#all-posts').style.display = 'none';
    document.querySelector('#following').style.display = 'none';
    document.querySelector('#edit-post').style.display = 'block';

    const postArea = document.querySelector('#post-area');
    console.log("edit post");
    fetch(`/post/${postId}`)
    .then((response) => response.json())
    .then(data => {
        postArea.value = data.text;
    }
    )

    document.querySelector("#edit-post-form").onsubmit = (event) => {
        event.preventDefault();
        console.log("edit post");
        fetch(`/edit-post/${postId}`,  {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'), // Use Django's CSRF protection
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: postArea.value
            })

        })
        .then(
            () => {
                load_main();
            }
        )

    }
    
}

function load_main_notlogged(){
    document.querySelector('#main').style.display = 'block';
    document.querySelector('#profile').style.display = 'none';

    let counter = 1;
    const quantity = 10;

    load_posts("main", counter, quantity, 0);
    

}

function load_profile_notlogged(userid){
    document.querySelector('#main').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    

    

    const profileContainer = document.querySelector('#profile-cont');

    const element = document.createElement('div');

    fetch(`/profile/${userid}`)
    .then((response) => response.json())
    .then(data => {
        const user = data.profile;
        const is_following = data.is_following;

        console.log("load profile");
        profileContainer.innerHTML = `
            <a style="font-size:24px; font-weight:bold; display:block; margin-bottom:10px;">${user.username}</a>
            <a style="display:block; margin-bottom:5px;">Followers: ${user.followers}</a>
            <a style="display:block;">Following: ${user.following}</a>
        `;
       
        
    })

    let counter = 1;
    const quantity = 10;

    load_posts("profile", counter, quantity, userid);
}

function load_main(){
    document.querySelector('#main').style.display = 'block';
    document.querySelector('#profile').style.display = 'none';
    if(document.querySelector('#following')){
        document.querySelector('#all-posts').style.display = 'none';
        document.querySelector('#following').style.display = 'none';
        document.querySelector('#edit-post').style.display = 'none';
    }


    
    document.querySelector("#create-post-form").onsubmit = (event) => {
        event.preventDefault();


        console.log("submit button clicked");

        const postText = document.querySelector("#create-post-text");

        if (postText.value.trim().length === 0) {
            alert("Post cannot be empty");
            return;
        }


        create_post(postText.value);

        postText.value = "";
    }


    let counter = 1;
    const quantity = 10;

    load_posts("main", counter, quantity, 0);
    

}

function load_profile(userid){
    if (document.querySelector('#profile-nav')){
        document.querySelector('#following').style.display = 'none';
        document.querySelector('#all-posts').style.display = 'none';
        document.querySelector('#edit-post').style.display = 'none';

    }
    else{
        return load_profile_notlogged(userid);
    }
    document.querySelector('#main').style.display = 'none';
    document.querySelector('#profile').style.display = 'block';
    

    

    const profileContainer = document.querySelector('#profile-cont');

    const element = document.createElement('div');

    fetch(`/profile/${userid}`)
    .then((response) => response.json())
    .then(data => {
        const user = data.profile;
        const is_following = data.is_following;

        console.log("load profile");
        profileContainer.innerHTML = `
            <a style="font-size:24px; font-weight:bold; display:block; margin-bottom:10px;">${user.username}</a>
            <a style="display:block; margin-bottom:5px;">Followers: ${user.followers}</a>
            <a style="display:block;">Following: ${user.following}</a>
        `;
        if (user.id != userId){

            const div = document.createElement('div');
            if(is_following){
                div.innerHTML = `
                <form id="follow-form">
                    <input type="submit"  value="Unfollow"/>
                </form>
                `;
            }
            else{
                div.innerHTML = `
                <form id="follow-form">
                    <input type="submit"  value="Follow"/>
                </form>
                `;
            }
            
            profileContainer.append(div);
            document.querySelector('#follow-form').onsubmit = (event) => {
                event.preventDefault(); // Prevent form from refreshing the page
                follow(user.id); // Call the follow function with the user ID
            };
        }
    })

    let counter = 1;
    const quantity = 10;

    load_posts("profile", counter, quantity, userid);




}

function follow(userId) {
    console.log(userId);
    fetch(`/follow/${userId}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'), // Use Django's CSRF protection
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'follow' }),
        user: userId
    })
    .then(response => {
        if (response.ok) {
            // Update the profile or refresh data as needed
            console.log("Followed user successfully.");
            // Optionally reload or update the followers/following counts
            load_profile(userId);
        } else {
            console.error("Failed to follow user.");
        }
    })
    .catch(error => console.error("Error following user:", error));

}

function create_post(text) {
    
    fetch('/create_post', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'  // Set the content type for JSON
        },
        body: JSON.stringify({
            text: text
        })
    })
    .then(response => response.json())  // Make sure to convert response to JSON
    .then(data => {
        console.log("Post created:", data);  // Log the response from the server
        // Optionally refresh posts or update UI here
        setTimeout(() => {
            console.log("After 1 second delay");
          }, 3000);
    
        return load_main();
    })
    .catch(error => console.error("Error creating post:", error));  // Handle any errors


    
}



function load_posts(type, start, quantity, userid){
    document.querySelector('#posts-main').innerHTML = '';
    document.querySelector('#posts-profile').innerHTML = '';
    var posts = document.querySelector(`#posts-${type}`);
    posts.innerHTML = '';
    var navigate_buttons = document.createElement('div');
    var back_button = document.createElement('div');
    var next_button = document.createElement('div');
    
    
    navigate_buttons.style.display = 'flex';
    navigate_buttons.style.flexDirection = 'row';
    navigate_buttons.style.justifyContent = 'space-between';

    navigate_buttons.innerHTML = `
        <form id="back_button">
            <input type="submit" value="back">
        </form>
        <form id="next_button">
            <input type="submit" value="next">
        </form>
    `;

    

    const end = start + quantity - 1;
    counter = end + 1;

    
    var post_count = 0;

    if(type === "profile"){
        fetch(`/posts/${type}?start=${start}&end=${end}&userid=${userid}`)
        .then((response) => response.json())
        .then(data => {
            post_count = data.post_count;
            data.posts.forEach((post) => add_post(post, type));
        })
        .then(() => {
            add_buttons(posts, navigate_buttons, start, end, post_count, type, quantity, userid);
        })
    }
    else{
        fetch(`/posts/${type}?start=${start}&end=${end}`)
        .then((response) => response.json())
        .then(data => {
            console.log(data);
            post_count = data.post_count;
            console.log("type1: " + type);
            data.posts.forEach((post) => add_post(post, type));
        })
        .then(() => {
            add_buttons(posts, navigate_buttons, start, end, post_count, type, quantity, userid);
        })
    

    }
}

function add_buttons(posts, navigate_buttons, start, end, post_count, type, quantity, userid){
    posts.append(navigate_buttons);
    const backbutton = document.querySelector('#back_button input[type="submit"]');
    const nextbutton = document.querySelector('#next_button input[type="submit"]');

    back_button = document.querySelector('#back_button');
    next_button = document.querySelector('#next_button');

    back_button.addEventListener('submit', (event) => {
        event.preventDefault();  // Prevent default form submission
        load_posts(type, start - quantity, quantity, userid);  // Load previous posts
    });

    next_button.addEventListener('submit', (event) => {
        event.preventDefault();  // Prevent default form submission
        load_posts(type, start + quantity, quantity, userid);  // Load next posts
    });

    console.log(parseInt(start), end);

    if(parseInt(start) === 1){
        console.log(backbutton);
        backbutton.disabled = true;
    }else{
        console.log("backbutton enabled");
        backbutton.disabled = false;
    }
    if(post_count > end){
        nextbutton.disabled = false;
    }
    else{
        nextbutton.disabled = true;
    }
}

function add_post(data, type){
    const post = document.createElement('div');
    post.id = `post-${data.id}`;
    console.log(userId);

    var likeButton = '';
    if(userId){
        likeButton = data.is_liked
            ? `<form onSubmit="unlike(${data.id},  event)"><input type="submit" value="Unlike"></form>`
            : `<form onSubmit="like(${data.id}, event)"><input type="submit" value="Like"></form>`;
    }
    else{
        likeButton = '';
    }

    const editButton = (data.creatorId === userId)
        ? `<form onSubmit="edit_post(${data.id},  event)"><input type="submit" value="Edit Post"></form>`
        : ``;

    post.innerHTML = `
        <div style="display:flex; flex-direction:column; width:500px; margin-top:24px; padding:15px; border:1px solid #ccc; border-radius:10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
            <div style="display:flex; flex-direction:row; justify-content:space-between;">
                <div class="post-creator"><a href="#" onClick="load_profile(${data.creatorId})">${data.creator}</a></div>
                ${editButton}
            </div>
            <div class="post-text" style="margin-top:10px; margin-bottom:10px;">${data.text}</div>
    
            <div style="display:flex; justify-content:space-between;">
                <div class="post-date">${new Date(data.date).toLocaleString()}</div>
                <div style="display:flex; flex-direction:row; justify-content:right;">
                    <div class="likes" style="margin-right:5px;"><a>Likes: ${parseInt(data.likes)}</a></div>
                    ${likeButton}
                </div>
            </div>
        </div>
    `;
    console.log(document.querySelector("#posts"));
    console.log("type:" + type);
    document.querySelector(`#posts-${type}`).append(post);
}

function edit(postId, event){
    event.preventDefault();
}

function like(postId, event){
    event.preventDefault();

    fetch(`/like/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({ action: 'like' })
    })
    .then(response => response.json())
    .then(data => {
        update_post(postId); // Update the post with the new data
        console.log(`Post ${postId} liked`, data);
    })
    .catch(error => console.error('Error liking post:', error));

}
function unlike(postId, event) {
    event.preventDefault();

    fetch(`/unlike/${postId}`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'unlike' }),
        postid: postId
    })
    .then(response => response.json())
    .then(data => {
        update_post(postId); // Update the post with the new data
        console.log(`Post ${postId} unliked`, data);
    })
    .catch(error => console.error('Error unliking post:', error));
}


function update_post(postId, data) {
    console.log("update: "+ postId + data);

    const postElement = document.querySelector(`#post-${postId}`);

    fetch(`/post/${postId}`)
    .then((response) => response.json())
    .then(data => {
        const editButton = (data.creatorId === userId)
        ? `<form onSubmit="edit(${data.id},  event)"><input type="submit" value="Edit Post"></form>`
        : ``;

        console.log("element" + document.querySelector(`#post-${postId}`));
        postElement.innerHTML = `
        <div style="display:flex; flex-direction:column; width:500px; margin-top:24px; padding:15px; border:1px solid #ccc; border-radius:10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;">
            <div style="display:flex; flex-direction:row; justify-content:space-between;">
                <div class="post-creator"><a href="#" onClick="load_profile(${data.creatorId})">${data.creator}</a></div>
                ${editButton}
            </div>
            <div class="post-text" style="margin-top:10px; margin-bottom:10px;">${data.text}</div>
    
            <div style="display:flex; justify-content:space-between;">
                <div class="post-date">${new Date(data.date).toLocaleString()}</div>
                <div style="display:flex; flex-direction:row; justify-content:right;">
                    <div class="likes" style="margin-right:5px;"><a>Likes: ${parseInt(data.likes)}</a></div>
                    <form onSubmit="${data.is_liked ? `unlike(${postId}, event)` : `like(${postId}, event)`}">
                        <input type="submit" value="${data.is_liked ? 'Unlike' : 'Like'}">
                    </form>
                </div>
            </div>
        </div>
    `;

        
    })
    
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Check if this cookie string begins with the given name
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}