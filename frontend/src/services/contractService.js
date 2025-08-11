const API_BASE_URL = "http://localhost:3001/api";
const getAuthToken = () => localStorage.getItem("token");
export const uploadFileToServer = async (file) => {
  const token = getAuthToken?.();
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: fd,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Upload failed (${res.status})`);
  }
  return res.json();
};

export const deleteUploadedFile = async (publicId) => {
  const token = getAuthToken?.();
  if (!publicId) return false;
  const res = await fetch(
    `${API_BASE_URL}/uploads/${encodeURIComponent(publicId)}`,
    {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    console.warn("Failed to delete uploaded file", await res.text());
    return false;
  }
  return true;
};
