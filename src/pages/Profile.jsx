import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  auth,
  db,
  doc,
  getDoc,
  setDoc,
  storage
} from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../components/Navbar";

export default function Profile() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    uid: "",
    email: "",
    name: "",
    profilePic: "",
  });
  const user = auth.currentUser;

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
  if (!user) {
    nav("/login");
    return;
  }

  async function loadProfile() {
    try {
      const d = await getDoc(doc(db, "users", user.uid));
      if (d.exists()) {
        const data = d.data();
        // Use Google profile pic if Firestore profilePic is empty
        setProfile((p) => ({ 
          ...p, 
          ...data,
          profilePic: data.profilePic || user.photoURL || "" 
        }));
      } else {
        const base = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || (user.email ? user.email.split("@")[0] : "Anonymous"),
          profilePic: user.photoURL || "", // Use Google profile pic
        };
        await setDoc(doc(db, "users", user.uid), base);
        setProfile(base);
      }
    } catch (e) {
      alert("Failed to load profile: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  loadProfile();
}, [user, nav]);



  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);


  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    try {
      let photoURL = profile.profilePic || "";

      // If user picked a new file, upload it to Storage
      if (file) {
        const fileRef = ref(storage, `profilePics/${profile.uid}`);
        await uploadBytes(fileRef, file);
        photoURL = await getDownloadURL(fileRef);
      }

      const update = {
        uid: profile.uid,
        email: profile.email,
        name: profile.name,
        profilePic: photoURL,
      };

      await setDoc(doc(db, "users", profile.uid), update, { merge: true });
      setProfile((p) => ({ ...p, profilePic: photoURL }));
      setFile(null);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  }


  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navbar />

      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 sm:px-8">
            <h2 className="text-3xl font-bold text-white">My Profile</h2>
            <p className="text-blue-100 mt-1">Manage your account information</p>
          </div>

          {/* Content */}
          <div className="px-6 py-8 sm:px-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Picture Preview */}
                <div className="flex-shrink-0">
                  {previewUrl || profile.profilePic ? (
                    <img
                      src={previewUrl || profile.profilePic}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200">
                      {profile.email ? profile.email[0].toUpperCase() : "U"}
                    </div>
                  )}
                </div>


                {/* Email Field (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    readOnly
                    value={profile.email}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your display name"
                  />
                </div>

                
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                    className="w-full px-4 py-3 border border-2 border-dashed border-gray-300 rounded-lg bg-white
               focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer
               hover:bg-gray-200"
                  />
                  
                </div>


                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => nav("/")}
                    className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-all"
                  >
                    Back to Chat
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}