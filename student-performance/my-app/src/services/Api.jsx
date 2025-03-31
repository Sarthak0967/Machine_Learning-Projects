export const API_BASE_URL = "http://localhost:5000";

export const register = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

export const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    return response.json();
};

export const addStudent = async (studentData, token) => {
    const response = await fetch(`${API_BASE_URL}/add_student`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(studentData)
    });
    return response.json();
};

export const getStudents = async (token) => {
    const response = await fetch(`${API_BASE_URL}/students`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

export const getStudentByIdOrName = async (id, name, token) => {
    let query = id ? `id=${id}` : `name=${encodeURIComponent(name)}`;
    const response = await fetch(`${API_BASE_URL}/student?${query}`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    return response.json();
};

export const predictPerformance = async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData)
    });
    return response.json();
};