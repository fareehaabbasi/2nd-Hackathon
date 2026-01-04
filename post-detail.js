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
      .select(`*, profiles(username)`)
      .eq("id", postId)
      .single();

    if (error) throw error;

    const {
      data: { user },
    } = await client.auth.getUser();

    const isOwner = user && user.id === post.user_id;

    postDetail.innerHTML = `
  <div class="card shadow-sm border-0 rounded-3">

    <!-- Post Image -->
    ${post.imageUrl ? `<img src="${post.imageUrl}" class="card-img-top" style="object-fit:cover; max-height:400px;">` : ""}

    <!-- Card Body -->
    <div class="card-body">
      <span class="badge bg-primary mb-2">${post.category}</span>
      <h3 class="card-title fw-bold mb-3">${post.title}</h3>
      <p class="card-text text-secondary mb-3">${post.content}</p>
      <div class="text-muted small mb-3">Posted at: ${new Date(post.created_at).toLocaleString()}</div>
      <!-- User Info -->
    <div class="card-header bg-white d-flex align-items-center gap-2 border-bottom">
      <i class="bi bi-person-circle fs-4"></i>
      <strong class="text-primary">${post.profiles?.username || "Unknown"}</strong>
    </div>
  </div>
`;


  } catch (err) {
    console.error(err);
    postDetail.innerHTML = "<p class='text-danger'>Failed to load post</p>";
  }
}

fetchPostDetail();
