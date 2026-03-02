import { customFetch } from "./apiWrapper";

/**
 * Fetches all blogs, optionally filtered by the most recent.
 */
export async function getAllBlogs(recent = false) {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/api/blogs`;
    if (recent) {
      url += '?recent=true';
    }
    try {
      const response = await fetch(url,{
        next: { revalidate: 3600 }, // Revalidate data once per hour
      });
      return response;
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      throw error;
    }
  }
  
  /**
   * Fetches a single blog by its ID.
   */
  export async function getBlogById(blogId) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/id/${blogId}`);
      return response;
    } catch (error) {
      console.error('Error fetching blog by ID:', error);
      throw error;
    }
  }
  
  /**
   * Fetches blogs by a specific tag.
   */
  export async function getBlogsByTag(user, tag) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs/tag/${tag}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      return response;
    } catch (error) {
      console.error('Error fetching blogs by tag:', error);
      throw error;
    }
  }
  
  // ------------------ADMIN ROUTES--------------------------
  
  /**
   * Creates a new blog post.
   */
  export async function createBlog(blog) {
    try {
      const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/blogs/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blog),
      });
      return response;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }
  
/**
 * Uploads an image to a blog post.
 * 
 * @param {string} blogId - The ID of the blog to add the image to.
 * @param {File} imageFile - The image file selected by the user.
 * @param {string} token - The user's authentication token (Bearer token).
 * @returns {Promise<Response>} - The server response.
 */
export async function addImageToBlog(blogId, imageFile, token) {
  try {
    // Create form data and append the file
    const formData = new FormData();
    formData.append("file", imageFile);

    // Send POST request to the FastAPI endpoint
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/blogs/add-image/${blogId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Auth header only; do NOT set Content-Type for multipart/form-data
      },
      body: formData,
    });

   return response;
  } catch (error) {
    console.error('Error uploading image to blog:', error);
    throw error;
  }
}

/**
 * Sets the featured status of a blog.
 *
 * @param {string} blogId - The ID of the blog to update.
 * @param {boolean} featured - Whether the blog should be featured.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Response>} - The server response.
 */
export async function setFeaturedStatus(blogId, featured, token) {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/blogs/set-featured/${blogId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ featured }),
    });

    return response;
  } catch (error) {
    console.error('Error setting featured status:', error);
    throw error;
  }
}

/**
 * Sets the cover image status for a blog.
 *
 * @param {string} blogId - The ID of the blog to set as the cover image.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Response>} - The server response.
 */
export async function setCoverImage(blogId, isCoverImage, token) {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/blogs/set-cover-image/${blogId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ "is_cover_image":isCoverImage }),
    });

    return response;
  } catch (error) {
    console.error('Error setting cover image:', error);
    throw error;
  }
}

/**
 * Deletes a blog by ID.
 *
 * @param {string} blogId - The ID of the blog to delete.
 * @param {string} token - The user's authentication token.
 * @returns {Promise<Response>} - The server response.
 */
export async function deleteBlog(blogId, token) {
  try {
    const response = await customFetch(`${process.env.NEXT_PUBLIC_API_URL}/api/internal/blogs/${blogId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
}