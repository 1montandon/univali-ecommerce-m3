// redirect if already logged in
const existingToken = localStorage.getItem("accessToken");
if (existingToken) {
    window.location.href = "http://127.0.0.1:5500/frontend/public/index.html";
}

const form = document.getElementById("login-form");

form.addEventListener("submit", async (event) => {
    event.preventDefault(); // stop HTML from reloading the page

    // Get values
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:3333/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error?.message == "Invalid email or password") {
                return alert("Email ou Senha invalidos");
            }
        }

        // backend should return { token: "..." }
        const data = await response.json();
        localStorage.setItem("accessToken", data.accessToken);

        // redirect to dashboard
        window.location.href = "http://127.0.0.1:5500/frontend/public/index.html";
    } catch (err) {
        console.error("Login error:", err);
        alert("Connection error");
    }
});
