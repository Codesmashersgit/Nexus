const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAISuggestions = async (req, res) => {
    try {
        const { transcript } = req.body;
        if (!transcript) {
            return res.status(400).json({ message: "Transcript is required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an interview assistant named "Nexus AI". 
      The following is a live transcript of a meeting/interview. 
      Analyze the transcript and provide 2-3 short, helpful suggestions or hints for the user to answer better or points to mention.
      Keep it professional, concise, and helpful.
      
      Transcript: "${transcript}"
      
      Suggestions (bullet points):
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ suggestions: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ message: "Failed to generate AI suggestions", error: error.message });
    }
};

module.exports = { getAISuggestions };
