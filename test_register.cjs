const axios = require('axios');

const register = async () => {
    const uniqueId = Math.floor(Math.random() * 100000);
    const payload = {
        user: {
            login: `testuser${uniqueId}@example.com`,
            email: `testuser${uniqueId}@example.com`,
            password: "password123",
            firstName: "Test",
            lastName: "User",
            authorities: ["ROLE_CLIENT"]
        },
        person: {
            firstName: "Test",
            firstLastName: "User",
            phoneNumber: 3000000000 + uniqueId,
            documentTypeId: 1, // Assuming 1 exists, or strict check? 
            // Previous user logs showed docTypeId=4. Let's try 1 or fetch types? 
            // Better to use safe data. I'll use 1 and hope.
            documentNumber: 10000000 + uniqueId,
            bornDate: "2000-01-01"
        }
    };

    try {
        console.log("Sending payload:", JSON.stringify(payload, null, 2));
        const res = await axios.post('http://localhost:8080/auth/register', payload);
        console.log("Success:", res.status, res.data);
    } catch (err) {
        if (err.response) {
            console.error("Error Status:", err.response.status);
            console.error("Error Data:", JSON.stringify(err.response.data, null, 2));
        } else {
            console.error("Error:", err.message);
        }
    }
};

register();
