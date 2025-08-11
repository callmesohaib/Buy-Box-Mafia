const API_BASE_URL = "http://localhost:3001/api/deals";

const getAuthToken = () => localStorage.getItem("token");

// Helper to remove undefined fields from an object
const removeUndefined = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined)
  );
};

// Add a new deal
export const addDeal = async (dealData) => {
  const token = getAuthToken();
  // Remove undefined fields to avoid Firestore error
  const cleanDealData = removeUndefined(dealData);
  // For debugging
  const res = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanDealData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Get all deals
export const getDeals = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Get a single deal by ID
export const getDealById = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Get deals by status
export const getDealsByStatus = async (status) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/status/${status}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Update a deal
export const updateDeal = async (id, updateData) => {
  const token = getAuthToken();
  const cleanUpdateData = removeUndefined(updateData);
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(cleanUpdateData),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Delete a deal
export const deleteDeal = async (id) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Import multiple deals
export const importDeals = async (deals) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ deals }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Get deals for current user (pass user object from useAuth)
export const getMyDeals = async (user) => {
  const deals = await getDeals();
  if (!user) return [];
  return deals.filter(
    (deal) => deal.submittedBy === user.email || deal.submittedBy === user.id
  );
};

// Get deals by submitter
export const getDealsBySubmitter = async (submitterId) => {
  const deals = await getDeals();
  return deals.filter((deal) => deal.submittedBy === submitterId);
};

// Get potential buyers for a specific deal
export const getDealMatches = async (dealId) => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/${dealId}/matches`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Get potential buyers count for all deals
export const getPotentialBuyersCount = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/potential-buyers/count`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};

// Get overview analytics data
export const getOverviewAnalytics = async () => {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
  }
  return res.json();
};
