const API_BASE_URL = "http://localhost:3001/api/deals";

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem("token");

// Helper function to make API calls
const makeApiCall = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};

// Add a new deal
export const addDeal = async (dealData) => {
  return makeApiCall("", {
    method: "POST",
    body: JSON.stringify(dealData),
  });
};

// Get all deals
export const getDeals = async () => {
  return makeApiCall("");
};

// Get a single deal by ID
export const getDealById = async (id) => {
  return makeApiCall(`/${id}`);
};

// Get deals by MLS number
export const getDealsByMlsNumber = async (mlsNumber) => {
  return makeApiCall(`/mls/${mlsNumber}`);
};

// Get deals by status
export const getDealsByStatus = async (status) => {
  return makeApiCall(`/status/${status}`);
};

// Update a deal
export const updateDeal = async (id, updateData) => {
  return makeApiCall(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
};

// Delete a deal
export const deleteDeal = async (id) => {
  return makeApiCall(`/${id}`, {
    method: "DELETE",
  });
};

// Import multiple deals
export const importDeals = async (deals) => {
  return makeApiCall("/import", {
    method: "POST",
    body: JSON.stringify({ deals }),
  });
};

// Get deals for current user
export const getMyDeals = async () => {
  const deals = await getDeals();
  const currentUserEmail = localStorage.getItem("email");
  const currentUserId = localStorage.getItem("userId");
  
  return deals.filter(deal => 
    deal.submittedBy === currentUserEmail || deal.submittedBy === currentUserId
  );
};

// Get deals by submitter
export const getDealsBySubmitter = async (submitterId) => {
  const deals = await getDeals();
  return deals.filter(deal => deal.submittedBy === submitterId);
}; 