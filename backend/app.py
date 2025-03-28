from flask import Flask, request, jsonify
from scrapData import scrapdata
from chatbot import generate_chat_response
from translate import translate_text
from finetuned import generate_fine_tuned_response 
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

LANGUAGES = {
    "hindi": "hi",
    "marathi": "mr",
    "gujarati": "gu",
    "telugu": "te",
    "tamil": "ta"
}

@app.route('/scrape', methods=['GET'])
def scrape():
    topic = request.args.get('topic', 'latest')  # Default to 'latest' if no topic is provided
    try:
        data = scrapdata(topic)
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)})
    
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')

    if not user_message:
        return jsonify({'error': 'No message provided'}), 400

    response_text = generate_chat_response(user_message)
    return jsonify({'response': response_text})

@app.route('/translate', methods=['POST'])
def translate():
    data = request.json
    text = data.get("text", "")
    language = data.get("language", "").lower()

    if language not in LANGUAGES:
        return jsonify({"error": "Unsupported language"}), 400

    translated_text = translate_text(text, LANGUAGES[language])
    return jsonify({"translated_text": translated_text})

@app.route('/fine-tuned-chat', methods=['POST'])
def fine_tuned_chat():
    data = request.json
    messages = data.get('messages', [])

    if not messages:
        return jsonify({'error': 'No messages provided'}), 400

    try:
        response_text = generate_fine_tuned_response(messages)
        return jsonify({'message': response_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

