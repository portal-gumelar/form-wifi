const API_BASE_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:5000";

export const api = {
  getRegistrations: async (page?: number, limit?: number, search?: string) => {
    let url = `${API_BASE_URL}/api/registrations`;
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error("Gagal mengambil data");
    return res.json();
  },
  
  insertRegistration: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Gagal menyimpan data");
    return res.json();
  },
  
  updateStatus: async (timestamp: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/api/registrations/${encodeURIComponent(timestamp)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error("Gagal update status");
    return res.json();
  },
  
  deleteRegistration: async (timestamp: string) => {
    const res = await fetch(`${API_BASE_URL}/api/registrations/${encodeURIComponent(timestamp)}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error("Gagal menghapus data");
    return res.json();
  },
  
  uploadKtp: async (fileBlob: Blob, fileName: string) => {
    const formData = new FormData();
    formData.append('file', fileBlob, fileName);
    const res = await fetch(`${API_BASE_URL}/api/upload-ktp`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error("Gagal mengunggah KTP");
    const result = await res.json();
    return result.publicUrl;
  }
};
