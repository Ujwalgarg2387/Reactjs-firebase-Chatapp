// SearchUser.jsx
import { useState } from "react";
import { db, collection, getDocs } from "../firebase";

export default function SearchUser({ setSelected }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  async function search(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      let found = false;
      const q = query.toLowerCase();

      snap.forEach((doc) => {
        const u = doc.data();
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();

        if (name.includes(q) || email.includes(q)) {
          setSelected({ ...u });
          found = true;
        }
      });

      if (!found) {
        alert("No user found with that name or email");
      }
    } catch (error) {
      alert("Search failed: " + error.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <form onSubmit={search} className="space-y-2">
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Search users..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        disabled={searching}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {searching ? "Searching..." : "Search"}
      </button>
    </form>
  );
}
