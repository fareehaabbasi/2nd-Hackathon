import client from "./config.js";

// -------------------- Loader
const loader = document.getElementById("loader-overlay");
function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

// -------------------- Containers
const postsContainer = document.getElementById("myPostsContainer");
const editModal = new bootstrap.Modal(document.getElementById("editPostModal"));

// -------------------- Fetch & Display User's Posts
async function fetchMyPosts() {
  showLoader();
  try {
    // Current User
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    const { data: posts, error } = await client
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    postsContainer.innerHTML = "";

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = "<p>You have not posted anything yet.</p>";
      return;
    }

    posts.forEach((post) => {
      const postDiv = document.createElement("div");
      postDiv.className = "col-md-6 mb-4 post-card";

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

          <!-- Edit & Delete -->
          <div>
            <button class="btn btn-sm btn-warning edit-btn" data-id="${
              post.id
            }">
              <i class="bi bi-pencil-square"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${
              post.id
            }">
              <i class="bi bi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

      postsContainer.appendChild(postDiv);
    });

    // Attach action buttons after cards are rendered
    attachActionButtons();
  } catch (err) {
    console.error("Error fetching posts:", err);
    postsContainer.innerHTML = `<p class="text-danger">Error loading posts: ${err.message}</p>`;
  } finally {
    hideLoader();
  }
}

// -------------------- Attach Edit & Delete Button Handlers
function attachActionButtons() {
  // Edit buttons
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", () => editPost(btn.dataset.id));
  });

  // Delete buttons
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.id;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This post will be permanently deleted!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      try {
        showLoader();
        const { error } = await client.from("posts").delete().eq("id", postId);
        if (error) throw error;

        Swal.fire("Deleted!", "Post has been deleted.", "success");
        fetchMyPosts(); // Refresh posts list
      } catch (err) {
        console.error("Delete error:", err);
        Swal.fire("Error", err.message, "error");
      } finally {
        hideLoader();
      }
    });
  });
}

// -------------------- Edit Post
async function editPost(id) {
  try {
    showLoader();

    const { data, error } = await client
      .from("posts")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;

    document.getElementById("editPostId").value = data.id;
    document.getElementById("editTitle").value = data.title;
    document.getElementById("editContent").value = data.content;
    document.getElementById("editCategory").value = data.category;

    editModal.show();
  } catch (err) {
    console.error("Error fetching post:", err);
    Swal.fire("Error", err.message, "error");
  } finally {
    hideLoader();
  }
}

window.editPost = editPost; // Make globally accessible

// -------------------- Update Post
document
  .getElementById("editPostForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editPostId").value;

    try {
      showLoader();

      const updatedData = {
        title: document.getElementById("editTitle").value,
        content: document.getElementById("editContent").value,
        category: document.getElementById("editCategory").value,
      };

      // Optional image update
      const imageFile = document.getElementById("editImage").files[0];
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await client.storage
          .from("post-images")
          .upload(fileName, imageFile);
        if (uploadError) throw uploadError;

        const { data: publicData } = client.storage
          .from("post-images")
          .getPublicUrl(uploadData.path);
        updatedData.imageUrl = publicData.publicUrl;
      }

      const { error } = await client
        .from("posts")
        .update(updatedData)
        .eq("id", id);
      if (error) throw error;

      Swal.fire("Success", "Post updated successfully!", "success");
      editModal.hide();
      fetchMyPosts(); // Refresh posts list
    } catch (err) {
      console.error("Error updating post:", err);
      Swal.fire("Error", err.message, "error");
    } finally {
      hideLoader();
    }
  });

// -------------------- Initial fetch
fetchMyPosts();
