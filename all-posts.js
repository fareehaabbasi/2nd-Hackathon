import client from "./config.js";

const loader = document.getElementById("loader-overlay");
const postsContainer = document.getElementById("postsContainer");

function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

async function fetchAndDisplayPosts() {
  showLoader();
  try {
    const { data: posts, error } = await client
      .from("posts")
      .select(`*, profiles(username)`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    postsContainer.innerHTML = "";
    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = "<p>No posts available.</p>";
      return;
    }

    posts.forEach((post) => {
      const postDiv = document.createElement("div");
      postDiv.className = "col-md-6 mb-4";

      postDiv.innerHTML = `
      <div class="card-body">
  <div class="card shadow-sm h-100">
    ${
      post.imageUrl
        ? `
      <img src="${post.imageUrl}" class="card-img-top" 
           style="height:200px; object-fit:cover;">
    `
        : ""
    }
    <div class="card-body">
    <div class="d-flex align-items-center gap-2 mb-2">
          <i class="bi bi-person-circle fs-5"></i>
          <strong>${post.profiles?.username || "Unknown"}</strong>
        </div>
      <span class="badge bg-primary mb-2">${post.category}</span>

      <h5 class="card-title">${post.title}</h5>

      <p class="card-text">
        ${
          post.content.length > 120
            ? post.content.slice(0, 120) + "..."
            : post.content
        }
      </p>

      <div class="d-flex justify-content-between align-items-center">
        <small class="text-muted">
          ${new Date(post.created_at).toLocaleDateString()}
        </small>

        <!-- READ MORE BUTTON -->
        <a href="post-detail.html?id=${post.id}" 
           class="btn btn-sm btn-outline-primary">
          Read More
        </a>
      </div>
    </div>
  </div>
`;

      postsContainer.appendChild(postDiv);
    });
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    postsContainer.innerHTML = "<p>Error loading posts.</p>";
  } finally {
    hideLoader();
  }
}

fetchAndDisplayPosts();
