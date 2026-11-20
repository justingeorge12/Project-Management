
import { useEffect, useState } from "react";
import {
  UserPlus,
  Trash2,
  Users,
  Search,
  X,
  Check,
} from "lucide-react";
import api from "../../services/api";

function getErrorMessage(error, fallback) {
  const data = error.response?.data;

  if (data?.user_id) {
    return Array.isArray(data.user_id)
      ? data.user_id[0]
      : data.user_id;
  }

  if (data?.detail) return data.detail;

  return fallback;
}

function ProjectMembers({ projectId, projectOwnerId }) {
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isOwner = currentUser?.id === projectOwnerId;

  const fetchMembers = async () => {
    try {
      const response = await api.get(
        `/projects/${projectId}/members/`
      );

      setMembers(response.data);
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load project members.")
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [profileResponse, membersResponse] = await Promise.all([
          api.get("/accounts/me/"),
          api.get(`/projects/${projectId}/members/`),
        ]);

        setCurrentUser(profileResponse.data);
        setMembers(membersResponse.data);
      } catch (err) {
        setError(
          getErrorMessage(err, "Unable to load project members.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Search available users whenever the search text changes.
  useEffect(() => {
    if (!isOwner) return;

    const fetchAvailableUsers = async () => {
      try {
        setSearching(true);

        const response = await api.get(
          `/projects/${projectId}/available-users/`,
          {
            params: { search },
          }
        );

        setAvailableUsers(response.data.results || []);
      } catch (err) {
        setAvailableUsers([]);
        setError(
          getErrorMessage(err, "Unable to search users.")
        );
      } finally {
        setSearching(false);
      }
    };

    fetchAvailableUsers();
  }, [projectId, search, isOwner]);

  const handleSelectUser = (user) => {
  setSelectedUser(user);
  setSearch("");
  setAvailableUsers([]);
  setShowUserDropdown(false);
  setError("");
};

  const handleAddMember = async () => {
    if (!selectedUser) {
      setError("Please select a user first.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      setSuccess("");

      await api.post(`/projects/${projectId}/members/`, {
        user_id: selectedUser.id,
      });

      setSuccess(
        `${selectedUser.username} added successfully.`
      );

      setSelectedUser(null);
      setSearch("");
      setAvailableUsers([]);

      await fetchMembers();
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to add this member.")
      );
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (member) => {
    const confirmed = window.confirm(
      `Remove ${member.user.username} from this project?`
    );

    if (!confirmed) return;

    try {
      setRemovingId(member.user.id);
      setError("");
      setSuccess("");

      await api.delete(
        `/projects/${projectId}/members/${member.user.id}/`
      );

      setMembers((previousMembers) =>
        previousMembers.filter(
          (item) => item.user.id !== member.user.id
        )
      );

      setSuccess("Member removed successfully.");
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to remove this member.")
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Users size={20} />
            Project Members
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            People who have access to this project
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600">
          {members.length} members
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {isOwner && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Add project member
          </label>

          {selectedUser ? (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                  {selectedUser.username.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {selectedUser.first_name || selectedUser.last_name
                      ? `${selectedUser.first_name} ${selectedUser.last_name}`.trim()
                      : selectedUser.username}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-red-600"
                title="Change selection"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                <Search size={18} className="text-slate-400" />

                <input
                    type="text"
                    value={search}
                    onFocus={() => setShowUserDropdown(true)}
                    onChange={(event) => {
                        setSearch(event.target.value);
                        setShowUserDropdown(true);
                    }}
                    placeholder="Search by name, username or email..."
                    className="w-full py-3 text-sm outline-none"
                    />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                        setSearch("");
                        setShowUserDropdown(true);
                        }}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              {showUserDropdown && (
                <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
                {searching ? (
                  <p className="p-4 text-center text-sm text-slate-500">
                    Searching users...
                  </p>
                ) : availableUsers.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {availableUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleSelectUser(user)}
                        className="flex w-full items-center gap-3 border-b border-slate-100 p-3 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-600">
                          {user.username.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-800">
                            {user.first_name || user.last_name
                              ? `${user.first_name} ${user.last_name}`.trim()
                              : user.username}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {user.email}
                          </p>
                        </div>

                        <Check
                          size={17}
                          className="text-indigo-500"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="p-4 text-center text-sm text-slate-500">
                    No available users found.
                  </p>
                )}
              </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleAddMember}
            disabled={!selectedUser || adding}
            className="mt-3 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus size={17} />
            {adding ? "Adding member..." : "Add Member"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Loading members...
        </p>
      ) : members.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No project members found.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {member.user.username}

                  {member.user.id === projectOwnerId && (
                    <span className="ml-2 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-600">
                      Owner
                    </span>
                  )}
                </p>

                <p className="truncate text-sm text-slate-500">
                  {member.user.email}
                </p>
              </div>

              {isOwner && member.user.id !== projectOwnerId && (
                <button
                  type="button"
                  onClick={() => handleRemoveMember(member)}
                  disabled={removingId === member.user.id}
                  title="Remove member"
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ProjectMembers;
