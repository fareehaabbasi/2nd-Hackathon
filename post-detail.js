import client from "./config.js";

const postDetail = document.getElementById("postDetail");

const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

if (!postId) {
  postDetail.innerHTML = "<p class='text-danger'>Invalid post</p>";
}

// ---------------- Fetch Post Detail
async function fetchPostDetail() {
  try {
    const { data: post, error } = await client
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error) throw error;

    const {
      data: { user },
    } = await client.auth.getUser();

    const isOwner = user && user.id === post.user_id;

    postDetail.innerHTML = `
      <div class="card shadow">
        ${post.imageUrl ? `<img src="${post.imageUrl}" class="card-img-top">` : ""}
        <div class="card-body">
          <span class="badge bg-primary mb-2">${post.category}</span>
          <h3>${post.title}</h3>
          <p class="mt-3">${post.content}</p>
          <div class="text-muted small">Posted at: ${new Date(post.created_at).toLocaleString()}</div>

          ${
            isOwner
              ? `<div class="mt-4 d-flex gap-2">
                    <button class="btn btn-warning btn-sm" onclick="openEdit(${post.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePost(${post.id})">Delete</button>
                 </div>`
              : ""
          }
        </div>
      </div>
    `;

  } catch (err) {
    console.error(err);
    postDetail.innerHTML = "<p class='text-danger'>Failed to load post</p>";
  }
}

fetchPostDetail();
