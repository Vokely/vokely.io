import { useEffect, useState } from 'react'
import { createBlog, getAllBlogs, addImageToBlog, setFeaturedStatus, setCoverImage, deleteBlog } from '@/lib/blogsUtil'
import useToastStore from '@/store/toastStore';
import useAlertStore from '@/store/alertDialogstore';

export default function Blogs() {
  const addToast = useToastStore((state) => state.addToast);
  const openAlertDialog = useAlertStore((state) => state.openAlert);
  const [view, setView] = useState('view');
  const [blogs, setBlogs] = useState([]);
  const [jsonInput, setJsonInput] = useState('');
  const [imageFileMap, setImageFileMap] = useState({});

  useEffect(() => {
    if (view === 'view') {
      fetchBlogs();
    }
  }, [view]);

  const fetchBlogs = async () => {
    try {
      const response = await getAllBlogs();
      if (!response.ok) {
        addToast('Failed to fetch blogs', 'error', 'top-middle', 3000);
        return;
      }
      const data = await response.json();
      setBlogs(data.blogs);
    } catch (error) {
      addToast('An error occurred while fetching blogs', 'error', 'top-middle', 3000);
    }
  };

  const handleCreateBlog = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const response = await createBlog(parsed);
      if (!response.ok) {
        addToast('Failed to create blog', 'error', 'top-middle', 3000);
      } else {
        addToast('Blog created successfully', 'success', 'top-middle', 3000);
        setJsonInput('');
      }
    } catch (err) {
      addToast('Invalid JSON or request error', 'error', 'top-middle', 3000);
    }
  };

  const handleImageUpload = async (blogId) => {
    const imageFile = imageFileMap[blogId];
    if (!imageFile) {
      addToast('Image is required', 'error', 'top-middle', 3000);
      return;
    }
    try {
      const response = await addImageToBlog(blogId, imageFile);
      if (!response.ok) {
        addToast('Failed to upload image', 'error', 'top-middle', 3000);
      } else {
        addToast('Image uploaded successfully', 'success', 'top-middle', 3000);
        setImageFileMap((prev) => ({ ...prev, [blogId]: null }));
        fetchBlogs(); // Refresh to get latest image with timestamp
      }
    } catch (error) {
      addToast('An unknown error occurred', 'error', 'top-middle', 3000);
    }
  };

  const handleFileChange = (blogId, file) => {
    setImageFileMap((prev) => ({ ...prev, [blogId]: file }));
  };

  const handleSetFeatured = async (blogId,isFeatured) => {
    try {
      const response = await setFeaturedStatus(blogId, isFeatured);
      if (!response.ok) {
        addToast('Failed to set blog as featured', 'error', 'top-middle', 3000);
      } else {
        addToast('Blog marked as featured', 'success', 'top-middle', 3000);
        fetchBlogs();
      }
    } catch (err) {
      addToast('An error occurred while setting featured', 'error', 'top-middle', 3000);
    }
  };

  const handleSetCoverImage = async (blogId,isCoverImage) => {
    try {
      const response = await setCoverImage(blogId, isCoverImage);
      if (!response.ok) {
        addToast('Failed to set blog as cover image', 'error', 'top-middle', 3000);
      } else {
        addToast('Blog marked as cover image', 'success', 'top-middle', 3000);
        fetchBlogs(); 
      }
    } catch (err) {
      addToast('An error occurred while setting cover image', 'error', 'top-middle', 3000);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    const generate = await openAlertDialog(
      'Confirm',
      'Are you sure you want to delete this blog?'
    );
    if (!generate) return;
  
    try {
      const response = await deleteBlog(blogId);
      if (!response.ok) {
        addToast('Failed to delete blog', 'error', 'top-middle', 3000);
      } else {
        addToast('Blog deleted successfully', 'success', 'top-middle', 3000);
        fetchBlogs();
      }
    } catch (err) {
      addToast('An error occurred while deleting blog', 'error', 'top-middle', 3000);
    }
  };
  

  return (
    <div className="p-4 mx-auto">
      <div className="flex justify-start space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            view === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setView('view')}
        >
          View Blogs
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            view === 'add' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
          onClick={() => setView('add')}
        >
          Add Blog
        </button>
      </div>

      {view === 'view' && (
        <div className="grid md:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="border rounded-lg p-4 shadow-sm">
              <h2 className="font-bold text-lg flex items-center gap-2">{blog.title}</h2>
                {blog.featured && <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded float-right">Featured</span>}
                {blog.isCoverImage && <span className="text-xs bg-blue-400 text-black px-2 py-0.5 rounded float-right">Cover</span>}
              <p className="text-sm text-gray-500">{blog.slug}</p>
              {blog.image && (
                <img
                  src={`${blog.image}?t=${Date.now()}`}
                  alt={blog.title}
                  className="mt-2 max-h-48 object-contain"
                />
              )}
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(blog.id, e.target.files[0])}
                  className="mb-2"
                />
                <button
                  onClick={() => handleImageUpload(blog.id)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md mr-2"
                >
                  Upload Image
                </button>
                {!blog.featured && (
                  <button
                    onClick={() => handleSetFeatured(blog.id,true)}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md"
                  >
                    Set as Featured
                  </button>
                )}
                {!blog.isCoverImage && (
                  <button
                    onClick={() => handleSetCoverImage(blog.id,true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md mt-2"
                  >
                    Set as Cover Image
                  </button>
                )}
                {blog.featured && (
                <button
                  onClick={() => handleSetFeatured(blog.id,false)}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md mt-2"
                >
                  Unset Featured
                </button>
              )}

              {blog.isCoverImage && (
                <button
                  onClick={() => handleSetCoverImage(blog.id,false)}
                  className="px-3 py-1 bg-gray-600 text-white rounded-md mt-2"
                >
                  Unset Cover Image
                </button>
              )}

              <button
                onClick={() => handleDeleteBlog(blog.id)}
                className="px-3 py-1 bg-red-600 text-white rounded-md mt-2"
              >
                Delete Blog
              </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'add' && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Paste Blog JSON</h2>
          <textarea
            className="w-full h-64 p-3 border rounded-md mb-4"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste blog JSON here"
          />
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md"
            onClick={handleCreateBlog}
          >
            Submit Blog
          </button>
        </div>
      )}
    </div>
  );
}
