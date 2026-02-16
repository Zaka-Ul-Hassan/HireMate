// frontend\static\js\voice_agent\calling_agent.js

document.addEventListener("DOMContentLoaded", () => {
  const startCallBtn = document.getElementById("start-call");

  if (!startCallBtn) return;

  startCallBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    startCallBtn.textContent = "📞 Starting call...";
    startCallBtn.disabled = true;

    const customerNumber = "+923230256717";

    try {
      console.log("Initiating AI voice call...");

      // Get token from localStorage (or wherever you store it)
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("You are not logged in. Please login first.");
      }

      const response = await fetch(
        `/api/voice-agent/make_call?customer_number=${encodeURIComponent(customerNumber)}`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}` // send token here
          },
        }
      );

      // Parse JSON response even if status is not ok
      const data = await response.json();

      if (response.status === 401 || data.status === false) {
        // Show error from backend
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Unauthorized or failed request",
          confirmButtonColor: "#d33",
        });
      } else if (data.status === true) {
        // Show success from backend
        Swal.fire({
          icon: "success",
          title: "AI Call Started!",
          text: data.message || "Call started successfully.",
          confirmButtonColor: "#3085d6",
        });
      } else {
        // Fallback warning
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: data.message || "Something went wrong.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong while starting the call.",
        confirmButtonColor: "#d33",
      });
    } finally {
      startCallBtn.disabled = false;
      startCallBtn.textContent = "📞 Call AI Agent";
    }
  });
});
