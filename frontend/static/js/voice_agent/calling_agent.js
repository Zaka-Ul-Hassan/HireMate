// frontend\static\js\voice_agent\calling_agent.js

document.addEventListener("DOMContentLoaded", () => {
  debugger
  const startCallBtn = document.getElementById("start-call");

  if (!startCallBtn) return;

  startCallBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    startCallBtn.textContent = "📞 Starting call...";
    startCallBtn.disabled = true;

    const customerNumber = "+923227834344";
    // const customerNumber = "+923230256717";

    try {
      console.log("Initiating AI voice call...");

      const response = await fetch(
        `/api/voice-agent/make_call?customer_number=${encodeURIComponent(customerNumber)}`,
        {
          method: "POST",
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

    const data = await response.json();

      if (data.status) {
        Swal.fire({
          icon: "success",
          title: "AI Call Started!",
          text: data.message,
          confirmButtonColor: "#3085d6",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Action Required",
          text: data.error || "Please upload your resume first.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong while starting the call.",
        confirmButtonColor: "#d33",
      });
    } finally {
      startCallBtn.disabled = false;
      startCallBtn.textContent = "📞 Call AI Agent";
    }
  });
});
