// frontend\static\js\voice_agent\calling_agent.js

document.addEventListener("DOMContentLoaded", () => {
  debugger
  const startCallBtn = document.getElementById("start-call");

  if (!startCallBtn) return;

  startCallBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    startCallBtn.textContent = "📞 Starting call...";

    // You can later make these dynamic (from input fields)
    // const customerNumber = "+923227834344";
    const customerNumber = "+923230256717";
    const message = "Hi Zaka Ul Hassan how are you";

    try {
      console.log("Initiating AI voice call...");

      const response = await fetch(
        `/api/voice-agent/make_call?customer_number=${encodeURIComponent(customerNumber)}&message=${encodeURIComponent(message)}`,
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
      console.log("📞 Call started successfully:", data);
      toaster.success("AI Call Started Successfully!");
    } catch (error) {
      console.error("Error starting call:", error);
      toaster.error("Error starting call: " + error.message);
    } finally {
      startCallBtn.textContent = "📞 Call AI Agent";
    }
  });
});
