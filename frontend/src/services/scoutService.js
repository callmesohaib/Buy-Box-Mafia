export const scoutService = {
  getAllScouts: async () => {
    try {
      const response = await fetch("http://localhost:3001/api/scout/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const res = await response.json();
      if (res.success) return res.data;
      throw new Error(res.message || "Failed to fetch scout info");
    } catch (error) {
      console.error("Error fetching scouts:", error);
      throw error;
    }
  },
};
