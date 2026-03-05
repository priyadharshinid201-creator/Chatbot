from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from transformers import pipeline
# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for communication with React

# Load environment variables
load_dotenv()

# Hugging Face chatbot model (default: BlenderBot)
HF_CHAT_MODEL = os.getenv("HF_CHAT_MODEL", "tiiuae/falcon-rw-1b")
chatbot = pipeline(
    "text-generation",
    model=HF_CHAT_MODEL
)


# --------- Normal Chatbot Endpoint ---------
@app.route("/normal-chat", methods=["POST"])
def normal_chat():
    data = request.json
    user_input = data.get("message")

    if not user_input:
        return jsonify({"error": "No message provided"}), 400

    result = chatbot(
        user_input,
        max_new_tokens=128,
        do_sample=True,
        temperature=0.7,
        top_p=0.9,
    )

    chatbot_response = result[0].get("generated_text", "").strip()

    if not chatbot_response:
        chatbot_response = "Sorry, I couldn't generate a response."

    return jsonify({"response": chatbot_response})

# Run the Flask app
if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
