function formatDate(dateValue) {
  const date = new Date(dateValue);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function renderError(container, message) {
  container.innerHTML = `<p class="error-text">${message}</p>`;
}

function normalizePostImagePaths(container, basePath) {
  const images = container.querySelectorAll("img");
  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) {
      return;
    }

    const isAbsolute = /^(https?:)?\/\//i.test(src) || src.startsWith("data:") || src.startsWith("/") || src.startsWith("#");
    if (isAbsolute) {
      return;
    }

    img.setAttribute("src", `${basePath}${src}`);
  });
}

async function getPosts() {
  const response = await fetch("posts/index.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load posts index");
  }
  const posts = await response.json();
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

async function renderPostList() {
  const listContainer = document.getElementById("post-list");
  if (!listContainer) {
    return;
  }

  const countLabel = document.getElementById("post-count");

  try {
    const posts = await getPosts();

    if (posts.length === 0) {
      renderError(listContainer, "No posts yet. Add your first entry in posts/index.json.");
      if (countLabel) {
        countLabel.textContent = "0 posts";
      }
      return;
    }

    listContainer.innerHTML = posts
      .map(
        (post, index) => `
          <a class="post-card" href="post.html?slug=${encodeURIComponent(post.slug)}" style="animation-delay: ${index * 75}ms">
            <p class="post-meta">${formatDate(post.date)} • ${post.readingTime || "5 min read"}</p>
            <h3>${post.title}</h3>
            <p class="post-excerpt">${post.excerpt}</p>
          </a>
        `
      )
      .join("");

    if (countLabel) {
      countLabel.textContent = `${posts.length} ${posts.length === 1 ? "post" : "posts"}`;
    }
  } catch (error) {
    renderError(listContainer, "Failed to load posts. Check posts/index.json.");
    if (countLabel) {
      countLabel.textContent = "-";
    }
  }
}

async function renderSinglePost() {
  const contentEl = document.getElementById("post-content");
  if (!contentEl) {
    return;
  }

  const titleEl = document.getElementById("post-title");
  const metaEl = document.getElementById("post-meta");
  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    renderError(contentEl, "No post selected. Open from the home page.");
    if (titleEl) {
      titleEl.textContent = "Post not found";
    }
    return;
  }

  try {
    const posts = await getPosts();
    const post = posts.find((item) => item.slug === slug);

    if (!post) {
      throw new Error("Post not found");
    }

    const postResponse = await fetch(`posts/${post.file}`, { cache: "no-store" });
    if (!postResponse.ok) {
      throw new Error("Post markdown missing");
    }

    const markdown = await postResponse.text();

    if (titleEl) {
      titleEl.textContent = post.title;
    }
    if (metaEl) {
      metaEl.textContent = `${formatDate(post.date)} • ${post.readingTime || "5 min read"}`;
    }

    if (window.marked && typeof window.marked.parse === "function") {
      contentEl.innerHTML = window.marked.parse(markdown);
      normalizePostImagePaths(contentEl, "posts/");
    } else {
      contentEl.textContent = markdown;
    }

    document.title = `${post.title} | My Blog`;
  } catch (error) {
    if (titleEl) {
      titleEl.textContent = "Post not found";
    }
    renderError(contentEl, "Could not load this post.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([renderPostList(), renderSinglePost()]);
});
