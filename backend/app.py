from flask import Flask, request, jsonify
from scrapData import scrapdata
from chatbot import generate_chat_response, save_uploaded_document, generate_document_response
from translate import translate_text
from finetuned import generate_fine_tuned_response 
from flask_cors import CORS
import os
import tempfile
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

LANGUAGES = {
    "hindi": "hi",
    "marathi": "mr",
    "gujarati": "gu",
    "telugu": "te",
    "tamil": "ta"
}

GOOGLE_API_KEY = 'AIzaSyB4IIN_7-dRYZYS6V4Tszznfm7uoxcyIwE'
genai.configure(api_key=GOOGLE_API_KEY)

# Storage for documents (in a real application, use a database)
documents = {}
UPLOAD_FOLDER = tempfile.gettempdir()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


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
    # formatted_response = "\n".join([f"• {point.strip()}" for point in response_text.split('*') if point.strip()])
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

@app.route('/upload-document', methods=['POST'])
def upload_document():
    if 'document' not in request.files:
        return jsonify({'status': 'error', 'message': 'No document part'}), 400
    
    file = request.files['document']
    
    document_info, error = save_uploaded_document(file, app.config['UPLOAD_FOLDER'])
    
    if error:
        return jsonify({'status': 'error', 'message': error}), 400
    
    # Store document information
    document_id = document_info['id']
    documents[document_id] = document_info
    
    return jsonify({
        'status': 'success',
        'document': {
            'id': document_id,
            'filename': document_info['filename']
        }
    })

@app.route('/document-chat', methods=['POST'])
def document_chat():
    document_id = request.form.get('document_id')
    user_message = request.form.get('message')
    
    if not document_id or not user_message:
        return jsonify({'error': 'Document ID and message are required'}), 400
    
    if document_id not in documents:
        return jsonify({'error': 'Document not found'}), 404
    
    document_content = documents[document_id]['content']
    
    response_text, error = generate_document_response(document_content, user_message)
    
    if error:
        return jsonify({'error': error}), 500
    
    return jsonify({'response': response_text})

if __name__ == '__main__':
    app.run(debug=True)

