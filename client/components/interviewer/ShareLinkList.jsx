import { Clipboard, CheckCircle, Trash2 } from 'lucide-react';

const ShareLinkList = ({ links, isLoading, copiedLink, onCopyLink, onDeleteLink }) => {
  return (
    <>
      {isLoading && <p className="text-gray-500 text-center">Loading...</p>}
      
      {!isLoading && links.length === 0 && (
        <p className="text-gray-500 text-center">No links created yet</p>
      )}
      
      <ul className="space-y-3">
        {links.map((link, index) => {
          const linkUrl = `${process.env.NEXT_PUBLIC_EXTERNAL_SHARE_BASE_URL}feedbacks/${link.id}`;
          return (
            <li key={index} className="border rounded-md p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{link.name}</span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => onCopyLink(linkUrl, link.id)}
                    className="text-purple-600 hover:text-purple-800 flex items-center text-sm"
                  >
                    {copiedLink === link.id ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => onDeleteLink(link.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {link.expires === "never" 
                  ? "No expiry" 
                  : `Expires: ${new Date(link.expires).toLocaleDateString()}`
                }
                {link.requires_password && " • Password protected"}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export default ShareLinkList;
