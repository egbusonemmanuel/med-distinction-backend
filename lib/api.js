// ================================
// 🌐 API CONFIGURATION (Final)
// ================================

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:4000"
    : "https://med-learn-production.up.railway.app");

console.log("🌐 Using API Base URL:", BASE_URL);


// Helper function
async function safeFetch(url, options = {}) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (err) {
    console.error("❌ API Error:", err);
    throw err;
  }
}

// ================================
// 👤 USER / AUTH ENDPOINTS
// ================================
export async function fetchUserProfile() {
  return safeFetch(`${BASE_URL}/api/profile`);
}

export async function fetchLeaderboard(limit = 10) {
  return safeFetch(`${BASE_URL}/api/leaderboard?limit=${limit}`);
}

export async function fetchCourses() {
  return safeFetch(`${BASE_URL}/api/courses`);
}

export async function fetchQuizzes() {
  return safeFetch(`${BASE_URL}/api/quizzes`);
}

export async function submitQuiz(quizId, answers, userEmail) {
  return safeFetch(`${BASE_URL}/api/quizzes/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quizId, answers, email: userEmail }),
  });
}

export async function fetchFlashcards() {
  return safeFetch(`${BASE_URL}/api/flashcards`);
}

export async function createFlashcard(data) {
  return safeFetch(`${BASE_URL}/api/flashcards/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function fetchCompetitions() {
  return safeFetch(`${BASE_URL}/api/competitions`);
}

export async function joinCompetition(competitionId, userEmail) {
  return safeFetch(`${BASE_URL}/api/competitions/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ competitionId, email: userEmail }),
  });
}

export async function submitCompetitionResult(competitionId, userEmail, score) {
  return safeFetch(`${BASE_URL}/api/competitionresult/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ competitionId, email: userEmail, score }),
  });
}

export async function fetchLibraryItems() {
  return safeFetch(`${BASE_URL}/api/library`);
}

export async function uploadLibraryItem(formData) {
  const res = await fetch(`${BASE_URL}/api/library/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function checkAdmin(email) {
  return safeFetch(`${BASE_URL}/api/admin/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export async function fetchAllUsers() {
  return safeFetch(`${BASE_URL}/api/admin/users`);
}

export async function deleteUser(email) {
  return safeFetch(`${BASE_URL}/api/admin/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}
