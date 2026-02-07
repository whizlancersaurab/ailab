const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Keep chat history per session (or you can implement per-user session later)
const history = [];

exports.chatBoat = async (req, res) => {
    try {
        const message = req.body.message;
        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message is required", success: false });
        }

        // Add user message to history
        history.push({
            role: 'user',
            parts: [{ text: message }]
        });

        // Generate AI response
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: history,
            config: {
                systemInstruction: `
You are an AI and Robotics Management Assistant. 
Guide students about AI, Robotics, and related career paths.

Rules:
- Explain clearly, beginner-friendly, practical examples if asked.
- Default answer < 30 words. Longer only if user asks.
- Keep polite, supportive, and professional tone.
- Avoid unnecessary jargon unless user requests.

Behavior:
- Answer previous questions in context.
- If user asks for clarification, explain simply.
- Stay focused on AI, Robotics, and education.
`
            },
        });

        // Push AI response to history
        history.push({
            role: 'model',
            parts: [{ text: response.text }]
        });

        res.status(200).json({ reply: response.text, success: true });

    } catch (error) {
        console.error("AI Chat Error:", error);
        const msg = "You exceeded your current quota or an error occurred. Please check your plan!";
        res.status(500).json({ message: msg, success: false });
    }
};
