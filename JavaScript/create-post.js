import client from "./config.js";

// ---------------Loader functions
const loader = document.getElementById("loader-overlay");
function showLoader() {
  loader.style.display = "flex";
}
function hideLoader() {
  loader.style.display = "none";
}

// ------------------------Optional: Preview image before submit
const pImage = document.getElementById("pimage");
pImage.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      let imgPreview = document.getElementById("imgPreview");
      if (!imgPreview) {
        imgPreview = document.createElement("img");
        imgPreview.id = "imgPreview";
        imgPreview.style.width = "100px";
        imgPreview.style.marginTop = "10px";
        pImage.parentElement.appendChild(imgPreview);
      }
      imgPreview.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// ------------------------Upload Image File to Supabase Storage and Get URL
const imageFile = document.getElementById("pimage").files[0];
async function uploadImage(f) {
  if (!f) return null; // agar file select nahi hai
  const fileName = `${Date.now()}_${f.name}`;
  try {
    const { data, error } = await client.storage
      .from("post-images")
      .upload(fileName, f);

    if (error) throw error;

    const { data: publicData } = client.storage
      .from("posts")
      .getPublicUrl(data.path);
      console.log("Uploaded Image URL:", publicData.publicUrl);

    return publicData.publicUrl;
  } catch (err) {
    console.error("Upload Error:", err.message);
    return null;
  }
}

//-------------------------------------Create post form submission
const form = document.getElementById("createPostForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  showLoader();

  try {
    // Current User
    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // 2. Get form values
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const category = document.getElementById("category").value;
    const imageFile = document.getElementById("pimage").files[0];


    // Upload Image Url if image is selected
    const imageUrl = await uploadImage(pimage.files[0]);

      // Insert Post
      const {error} = await client.from("posts").insert([
        {
            user_id: user.id,
            title,
            content,
            category,
            imageUrl: imageUrl,
        }
      ]);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Product Added",
        text: `Post has been added successfully!`,
      }); 
      form.reset();
  } catch (error) {
    console.error("Error creating post:", error);
    Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
  } finally {
    hideLoader();
  }
});
