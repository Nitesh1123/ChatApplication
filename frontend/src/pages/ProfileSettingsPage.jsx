import { useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import {
  CameraIcon,
  LoaderIcon,
  ArrowLeftIcon,
  SaveIcon,
  TrashIcon,
  AlertTriangleIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import useThemeStore from "../store/useThemeStore";

function ProfileSettingsPage() {
  const { authUser, updateProfile, isUpdatingProfile, changePassword, deleteAccount, logout } =
    useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  // Avatar state
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Personal info state
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Avatar handlers
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!imagePreview) return;
    await updateProfile({ profilePic: imagePreview });
    setImagePreview(null);
  };

  const handleCancelPhoto = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Name update handler
  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setIsUpdatingName(true);
    try {
      await updateProfile({ fullName: fullName.trim() });
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Password change handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      navigate("/login");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base">
      {/* Header */}
      <div className="h-14 bg-surface border-b border-border flex items-center px-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-medium">Back to Chat</span>
        </Link>
        <h1 className="ml-4 text-white font-semibold">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* AVATAR SECTION */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-white font-semibold mb-4">Profile Photo</h2>
          <div className="flex items-center gap-6">
            {/* Avatar with hover overlay */}
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img
                src={imagePreview || authUser?.profilePic || "/avatar.png"}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover bg-[#36393f]"
              />
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                <CameraIcon className="w-6 h-6 text-white mb-1" />
                <span className="text-white text-xs">Change Photo</span>
              </div>
            </div>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />

            <div className="flex flex-col gap-2">
              {imagePreview ? (
                <>
                  <button
                    onClick={handleSavePhoto}
                    disabled={isUpdatingProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-[#4752c4] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isUpdatingProfile ? (
                      <LoaderIcon className="w-4 h-4 animate-spin" />
                    ) : (
                      <SaveIcon className="w-4 h-4" />
                    )}
                    Save Photo
                  </button>
                  <button
                    onClick={handleCancelPhoto}
                    disabled={isUpdatingProfile}
                    className="px-4 py-2 text-muted hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#35373c] hover:bg-[#404249] text-white rounded-lg font-medium transition-colors"
                  >
                    <CameraIcon className="w-4 h-4" />
                    Choose Photo
                  </button>
                  <p className="text-muted text-xs">Max 5MB, images only</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* PERSONAL INFO SECTION */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-white font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#1e1f22] border border-border rounded-lg py-2.5 px-3 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Email
              </label>
              <input
                type="email"
                value={authUser?.email || ""}
                disabled
                className="w-full bg-[#1e1f22] border border-border rounded-lg py-2.5 px-3 text-muted cursor-not-allowed"
              />
              <p className="text-muted text-xs mt-1">Email cannot be changed</p>
            </div>

            <button
              onClick={handleSaveName}
              disabled={isUpdatingName || fullName === authUser?.fullName}
              className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-[#4752c4] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingName ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-white font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-white font-medium">Dark Mode</p>
              <p className="text-[#949ba4] text-xs mt-1">
                {theme === "dark" ? "Dark" : "Light"}
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle"
              checked={theme === "dark"}
              onChange={toggleTheme}
            />
          </div>
        </div>

        {/* PASSWORD SECTION */}
        <div className="bg-surface rounded-xl border border-border p-6">
          <h2 className="text-white font-semibold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#1e1f22] border border-border rounded-lg py-2.5 pl-3 pr-10 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#1e1f22] border border-border rounded-lg py-2.5 pl-3 pr-10 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#1e1f22] border border-border rounded-lg py-2.5 pl-3 pr-10 text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text-secondary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-[#4752c4] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? (
                <LoaderIcon className="w-4 h-4 animate-spin" />
              ) : (
                <SaveIcon className="w-4 h-4" />
              )}
              Update Password
            </button>
          </form>
        </div>

        {/* DANGER ZONE SECTION */}
        <div className="bg-surface rounded-xl border border-red-500/30 p-6">
          <h2 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
            <AlertTriangleIcon className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-muted text-sm mb-4">
            Once you delete your account, there is no going back. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors"
          >
            <TrashIcon className="w-4 h-4" />
            Delete Account
          </button>
        </div>

        <div className="pt-6 border-t border-[#3f4147]">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#2b2d31] border border-[#3f4147] hover:bg-[#ed4245] hover:border-[#ed4245] hover:text-white text-[#dcddde] rounded-lg font-medium transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <LoaderIcon className="w-5 h-5 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            )}
            Log Out
          </button>
          <p className="mt-3 text-[#949ba4] text-xs text-center">
            You will be logged out of all devices
          </p>
        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-xl border border-border p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangleIcon className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-white font-semibold text-lg">Delete Account?</h3>
            </div>
            <p className="text-muted mb-6">
              This will permanently delete your account and all your messages. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <LoaderIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <TrashIcon className="w-4 h-4" />
                )}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettingsPage;
