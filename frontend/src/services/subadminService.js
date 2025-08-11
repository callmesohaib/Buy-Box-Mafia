const API_BASE_URL = "http://localhost:3001/api";

// API service for subadmin operations
export const subadminService = {
  // Get all subadmins
  getAllSubadmins: async () => {
    try {
      // Temporarily remove auth for testing
      const response = await fetch(`${API_BASE_URL}/subadmin/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching subadmins:", error);
      throw error;
    }
  },

  // Create new subadmin
  createSubadmin: async (subadminData) => {
    try {
      // Temporarily remove auth for testing
      const response = await fetch(`${API_BASE_URL}/subadmin/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subadminData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create subadmin");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating subadmin:", error);
      throw error;
    }
  },

  // Get subadmin by ID
  getSubadminById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subadmin/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching subadmin:", error);
      throw error;
    }
  },

  // Update subadmin
  updateSubadmin: async (id, updateData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/subadmin/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update subadmin");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating subadmin:", error);
      throw error;
    }
  },

  // Delete subadmin
  deleteSubadmin: async (id) => {
    try {

      const response = await fetch(`${API_BASE_URL}/subadmin/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        let errorMessage = "Failed to delete subadmin";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error deleting subadmin:", error);
      throw error;
    }
  },
};
