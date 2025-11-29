const existingToken = localStorage.getItem("accessToken");
if (existingToken) {
    window.location.href = "http://127.0.0.1:5500/frontend/public/index.html";
}

const form = document.getElementById("register-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault(); // prevent page reload

  // Get values
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3333/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // Handle non-OK responses
    if (!response.ok) {
      const error = await response.json();

      if (error?.message === "User with that Email already exists") {
        return alert("Já existe um usuário com esse email.");
      }

      // Generic unknown error
      return alert("Erro ao criar conta.");
    }

    // If success, backend returns: { user: { id, email } }
    const data = await response.json();

    alert("Conta criada com sucesso!");

    // Optionally redirect to login page
    window.location.href = "http://127.0.0.1:5500/frontend/public/login.html";
  } catch (err) {
    console.error("Register error:", err);
    alert("Connection error");
  }
});
