import  { useEffect, useState } from 'react';
import { Mail, Eye, Send, X, AlertCircle, User, Search, CheckSquare, Square, UserPlus } from 'lucide-react';
import useAPIWrapper from '@/hooks/useAPIWrapper';
import { getUsers, sendBulkEmail } from '@/lib/adminUtil';

const UserSelector = ({
  emails,
  setEmails,
  addToast,
  callApi,
  loading,
  initialOffset = 0,
  initialLimit = 20,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  // 🔹 Sorting state
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const [pagination, setPagination] = useState({
    offset: initialOffset,
    limit: initialLimit,
    total: 0,
  });

  const fetchUsers = async () => {
    try {
      // PRECHECK #1 — Validate pagination
      if (
        !pagination ||
        typeof pagination.offset !== "number" ||
        typeof pagination.limit !== "number" ||
        pagination.limit <= 0 ||
        pagination.offset < 0
      ) {
        addToast("Invalid pagination values", "error");
        return;
      }

      // PRECHECK #2 — Always allow fetch (even without filters)
      const allowFetch = true;
      if (!allowFetch) {
        setUsers([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
        return;
      }

      // PRECHECK #3 — Clean filters
      const cleanUsername = searchTerm?.trim() || undefined;
      const cleanEmail = emailFilter?.trim() || undefined;

      // PRECHECK #4 — Avoid parallel duplicate calls
      if (loading) return;

      const data = await callApi(getUsers, {
        username: cleanUsername,
        email: cleanEmail,
        offset: pagination.offset,
        limit: pagination.limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (data == null) {
        addToast("Failed to fetch users", "error");
        return;
      }

      const usersList = Array.isArray(data?.users)
        ? data.users
        : Array.isArray(data)
        ? data
        : [];

      const totalCount =
        typeof data?.total === "number" ? data.total : usersList.length;

      setUsers(usersList);
      setPagination((prev) => ({ ...prev, total: totalCount }));
    } catch (error) {
      console.error("Error fetching users:", error);
      addToast("Error fetching users", "error");
    }
  };

  // 🔹 Search refetches with current offset/limit/sort
  const handleSearch = () => {
    // optionally reset pagination.offset to 0 if you want:
    // setPagination(prev => ({ ...prev, offset: 0 }));
    fetchUsers();
  };

  const handleLimitChange = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value) || value <= 0) return;
    setPagination((prev) => ({
      ...prev,
      limit: value,
    }));
  };

  const handleOffsetChange = (e) => {
    const value = Number(e.target.value);
    if (Number.isNaN(value) || value < 0) return;
    setPagination((prev) => ({
      ...prev,
      offset: value,
    }));
  };

  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    // optional: reset offset to 0 when changing sort
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
    // optional: reset offset to 0 when changing sort
    setPagination((prev) => ({ ...prev, offset: 0 }));
  };

  const toggleUserSelection = (user) => {
    const userId = user.id || user.email;
    setSelectedUsers((prev) =>
      prev.find((u) => (u.id || u.email) === userId)
        ? prev.filter((u) => (u.id || u.email) !== userId)
        : [...prev, user]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers([...users]);
    }
  };

  const addSelectedToRecipients = () => {
    const newEmails = selectedUsers
      .map((user) => user.email)
      .filter((email) => email && !emails.includes(email));

    if (newEmails.length === 0) {
      addToast("No new emails to add", "info");
      return;
    }

    setEmails([...emails, ...newEmails]);
    addToast(
      `Added ${newEmails.length} recipient${
        newEmails.length !== 1 ? "s" : ""
      }`,
      "success"
    );
    setSelectedUsers([]);
    setIsOpen(false);
  };

  const addAllUsersToRecipients = () => {
    const newEmails = users
      .map((user) => user.email)
      .filter((email) => email && !emails.includes(email));

    if (newEmails.length === 0) {
      addToast("No new emails to add", "info");
      return;
    }

    setEmails([...emails, ...newEmails]);
    addToast(
      `Added ${newEmails.length} recipient${
        newEmails.length !== 1 ? "s" : ""
      }`,
      "success"
    );
    setIsOpen(false);
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination((prev) => ({
        ...prev,
        offset: prev.offset + prev.limit,
      }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination((prev) => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit),
      }));
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <User className="w-4 h-4" />
        Add from Users Database
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold">Select Users</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Filters + Limit & Offset + Sorting */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <input
                type="number"
                min={1}
                value={pagination.limit}
                onChange={handleLimitChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Offset */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offset
              </label>
              <input
                type="number"
                min={0}
                value={pagination.offset}
                onChange={handleOffsetChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={handleSortByChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="created_at">Created At</option>
                <option value="username">Username</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={handleSortOrderChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              >
                <option value="desc">Desc (Newest / Z → A)</option>
                <option value="asc">Asc (Oldest / A → Z)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors w-full md:w-auto"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <button
                  onClick={selectAllUsers}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {selectedUsers.length === users.length ? (
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <span className="font-medium text-gray-700">
                  Select All ({users.length} users on this page)
                </span>
              </div>

              {users.map((user, index) => {
                const isSelected = selectedUsers.find(
                  (u) => (u.id || u.email) === (user.id || user.email)
                );
                return (
                  <div
                    key={user.id || index}
                    onClick={() => toggleUserSelection(user)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <button className="p-1">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-green-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.username || user.name || "N/A"}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination Summary + Prev/Next */}
        {!loading && users.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing{" "}
              {pagination.total === 0 ? 0 : pagination.offset + 1} -{" "}
              {Math.min(
                pagination.offset + pagination.limit,
                pagination.total
              )}{" "}
              of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={pagination.offset === 0}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={
                  pagination.offset + pagination.limit >= pagination.total
                }
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={addAllUsersToRecipients}
            disabled={users.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add All Users ({users.length})
          </button>
          <button
            onClick={addSelectedToRecipients}
            disabled={selectedUsers.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Selected ({selectedUsers.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// EmailInput Component - Handles multiple email addresses
const EmailInput = ({ emails, setEmails }) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail();
    }
  };

  const addEmail = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (!validateEmail(trimmed)) {
      setError('Invalid email format');
      return;
    }

    if (emails.includes(trimmed)) {
      setError('Email already added');
      return;
    }

    setEmails([...emails, trimmed]);
    setInputValue('');
    setError('');
  };

  const removeEmail = (emailToRemove) => {
    setEmails(emails.filter(e => e !== emailToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Recipients
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter email and press Enter"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={addEmail}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {emails.map((email, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              <span>{email}</span>
              <button
                onClick={() => removeEmail(email)}
                className="hover:bg-blue-200 rounded-full p-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">
        {emails.length} recipient{emails.length !== 1 ? 's' : ''} added
      </p>
    </div>
  );
};

// HTMLEditor Component - For editing email body
const HTMLEditor = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Email Body (HTML)
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your HTML template here..."
        rows={12}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
      />
    </div>
  );
};

// EmailPreview Component - Shows how the email will look
const EmailPreview = ({ subject, htmlBody, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Email Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <div className="space-y-2">
              <div className="flex gap-2">
                <span className="text-sm font-medium text-gray-600 w-20">Subject:</span>
                <span className="text-sm text-gray-900">{subject || '(No subject)'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div
              dangerouslySetInnerHTML={{ __html: htmlBody }}
              className="prose max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Component
export default function EmailTemplateForm({addToast}) {
  const [emails, setEmails] = useState([]);
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const {callApi,loading} = useAPIWrapper()

  const handleSendEmails = async () => {
    // Validation
    if (emails.length === 0) {
      addToast('Please add at least one recipient','error')
      return;
    }

    if (!subject.trim()) {
      addToast('Please enter an email subject','error')
      return;
    }

    if (!htmlBody.trim()) {
      addToast('Please enter an email body','error')    
      return;
    }
    
    try {
      const res = await callApi(sendBulkEmail,emails,subject,htmlBody);
      if(res!==null){
        addToast('Mails sent successfully','success')
      }else{
        addToast(`An error occured while sending mails`,'error')
      }
      setEmails([]);
    } catch (error) {
      addToast(`Unknown error occured ${error.message}`,'error')
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Campaign</h1>
              <p className="text-gray-600">Send bulk emails with your HTML templates</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="flex-1">
                <EmailInput emails={emails} setEmails={setEmails} />
              </div>
              <div>
                <UserSelector emails={emails} setEmails={setEmails} addToast={addToast} callApi={callApi} loading={loading}/>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter email subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <HTMLEditor value={htmlBody} onChange={setHtmlBody} />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowPreview(true)}
                disabled={!htmlBody.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <Eye className="w-5 h-5" />
                Preview
              </button>
              <button
                onClick={handleSendEmails}
                disabled={loading || emails.length === 0 || !subject.trim() || !htmlBody.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Emails
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <EmailPreview
        subject={subject}
        htmlBody={htmlBody}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
