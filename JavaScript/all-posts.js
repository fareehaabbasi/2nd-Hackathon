import client from "./config.js";

const loader = document.getElementById("loader-overlay");
const postsContainer = document.getElementById("postsContainer");

function showLoader() { loader.style.display = "flex"; }
function hideLoader() { loader.style.display = "none"; }

async function fetchAndDisplayPosts() {
  showLoader();
  try {
    const { data: posts, error } = await client
      .from("posts")
      .select("*")
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
        <div class="card shadow-sm h-100">
          ${post.imageUrl ? `<img src="${post.imageUrl}" class="card-img-top" alt="Post Image" style="object-fit: cover; height: 300px;">` : ''}
          <div class="card-body">
            <span class="badge bg-primary mb-2">${post.category}</span>
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text">${post.content}</p>
            <div class="text-muted small mt-2 mb-2">Posted at: ${new Date(post.created_at).toLocaleString()}</div>
            <div class="text-muted small mt-2">Posted by: ${post.user_id}</div>
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
