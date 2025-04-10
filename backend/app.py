import json
from flask import Flask, request, jsonify
from scrapData import scrapdata
from chatbot import generate_chat_response, save_uploaded_document, generate_document_response,generate_rag_response
from translate import translate_text
from finetuned import generate_fine_tuned_response 
from flask_cors import CORS
from googletrans import Translator
import time
import random
from quiz_generator import QuizGenerator
from datetime import timedelta, datetime
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
import os
import tempfile
import google.generativeai as genai
from chroma_vector_sentence_trasformer import get_collection, get_data, ask_question , get_answer
from bson import ObjectId
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

LANGUAGES = {
    "hindi": "hi",
    "marathi": "mr",
    "gujarati": "gu",
    "telugu": "te",
    "tamil": "ta"
}


api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Storage for documents (in a real application, use a database)
documents = {}
UPLOAD_FOLDER = tempfile.gettempdir()
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return "Welcome to the NLP API!"

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

    doc_info = documents[document_id]
    document_path = doc_info['path']
    
    # Get the file extension to handle different file types
    file_extension = document_path.split('.')[-1].lower()

    response_text, references, error = generate_document_response(
        document_path=document_path,
        file_extension=file_extension,
        user_message=user_message
    )

    if error:
        return jsonify({'error': error}), 500

    file_url = f"/uploads/{os.path.basename(document_path)}"

    return jsonify({
        'response': response_text,
        'references': references,
        'fileUrl': file_url
    })


# @app.route('/get-answer-from-vector-database', methods=['POST', 'GET'])
# def get_answerer_from_vector_database():
#     """
#     API to get the answer from the vector database and pass the context to generate RAG response.
#     """
#     try:
#         # Get data from request
#         data = request.json
#         question = data.get('question')

#         # Basic validation for question
#         if not question or len(question) < 2:
#             return jsonify({"status": "error", "message": "Question is too short or missing"}), 400

#         # Fetch result from the vector database
#         result = get_answer(question)

#         # Check if relevant data is available
#         if isinstance(result["documents"], list) and len(result["documents"]) > 0:
#             for i in result["documents"][0]:
#                 context += i + " "
#         else:
#             context = ""

#         if isinstance(result["metadatas"], list) and len(result["metadatas"]) > 0:
#             for i in result["metadatas"][0]:
#                 if "source" in i:
#                     links.append(i["source"])

#         # Prepare context and links
#         print("----" * 5, "context", "----" * 5)
#         print("----" * 5, context, "----" * 5)
#         print("----" * 5, "links", "----" * 5)
#         print("----" * 5, links, "----" * 5)
#         context = " ".join(result["documents"][0])
#         links = [metadata.get("source", "") for metadata in result["metadatas"][0] if "source" in metadata]

#         # Get RAG response
#         rag_response = genrate_rag_response(question, context, links)

#         # Check if the response is valid JSON
#         if isinstance(rag_response, dict) and "error" in rag_response:
#             return jsonify({"status": "error", "message": rag_response["error"]}), 500

#         # Return the success response
#         return jsonify({"status": "success", "data": rag_response}), 200

#     except Exception as e:
#         return jsonify({"status": "error", "message": str(e)}), 500
@app.route('/get-answer-from-vector-database', methods=['POST'])
def get_answer_asam():
    data = request.json
    question = data.get('question', '')
    if not question:
        return jsonify({'error': 'No question provided'}), 400
    result = get_answer(question)
    #print("result    " ,result)
    context = " ".join(result["documents"][0])
    links = [item["source"] for item in result["metadatas"][0] if "source" in item]

    ans = generate_rag_response(question, context, links)
    print("----" * 5, ans)
    try:
        # Convert answer to JSON format
        ans_json = ans  # Since the response is string, convert to JSON
        return jsonify({"status": "success", "data": ans_json}), 200
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


####################### Quiz #########################
dotenv_path = os.path.join(os.path.dirname(__file__), '../frontend/.env')
load_dotenv(dotenv_path)
if(os.getenv("MONGO_URI")) :
    client = MongoClient(os.getenv("MONGO_URI"))  # Use environment variable for MongoDB connection
else:
    print("Mongo URI not found in environment variables. Using local MongoDB connection.")
db = client['Hackathon']  
quiz_collection = db['NLP_Quiz']

@app.route('/save-quiz', methods=['POST'])
def save_quiz():
    data = request.json
    if not data or not all(key in data for key in ["userId", "quizId", "YoutubeLink"]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        quiz_history = {
            "userId": data["userId"],
            "quizId": data["quizId"],
            "YoutubeLink": data["YoutubeLink"],
            "timestamp": datetime.utcnow()
        }
        
        # Add additional fields if present
        if "title" in data:
            quiz_history["quiz_title"] = data["title"]
        if "difficulty" in data:
            quiz_history["difficulty"] = data["difficulty"]
        if "question_types" in data:
            quiz_history["question_types"] = data["question_types"]
        if "num_questions" in data:
            quiz_history["num_questions"] = data["num_questions"]
            
        result = db.QuizHistory.insert_one(quiz_history)
        return jsonify({"status": "success", "message": "Quiz history saved", "id": str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/get-quiz-history', methods=['GET'])
def get_quiz_history():
    try:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"status": "error", "message": "User ID is required"}), 400
            
        query = {"userId": user_id}
        quizzes = list(db.QuizHistory.find(query))
        
        # Convert ObjectId to string for JSON serialization
        for quiz in quizzes:
            quiz['_id'] = str(quiz['_id'])
            if 'timestamp' in quiz:
                quiz['date_taken'] = quiz['timestamp'].isoformat()
        
        return jsonify({"status": "success", "quizzes": quizzes}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/get-quiz', methods=['GET'])
def get_quiz():
    try:
        quiz_id = request.args.get('id')
        
        if quiz_id:
            # Get a specific quiz
            quiz = db.QuizHistory.find_one({"_id": ObjectId(quiz_id)})
            if not quiz:
                return jsonify({"status": "error", "message": "Quiz not found"}), 404
                
            # Convert ObjectId to string for JSON serialization
            quiz['_id'] = str(quiz['_id'])
            if 'timestamp' in quiz:
                quiz['date_taken'] = quiz['timestamp'].isoformat()
                
            return jsonify({"status": "success", "quiz": quiz}), 200
        else:
            # Get all quizzes (limit to 100 for performance)
            quizzes = list(db.QuizHistory.find().limit(100))
            for quiz in quizzes:
                quiz['_id'] = str(quiz['_id'])
                if 'timestamp' in quiz:
                    quiz['date_taken'] = quiz['timestamp'].isoformat()
                    
            return jsonify({"status": "success", "quizzes": quizzes}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/delete-quiz/<quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    try:
        result = db.QuizHistory.delete_one({"_id": ObjectId(quiz_id)})
        
        if result.deleted_count > 0:
            return jsonify({"status": "success", "message": "Quiz deleted successfully"}), 200
        else:
            return jsonify({"status": "error", "message": "Quiz not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/update-quiz/<quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data provided"}), 400
        
    try:
        # Create update document with only fields that are provided
        update_data = {}
        for key, value in data.items():
            update_data[key] = value
            
        result = db.QuizHistory.update_one(
            {"_id": ObjectId(quiz_id)},
            {"$set": update_data}
        )
        
        if result.modified_count > 0:
            return jsonify({"status": "success", "message": "Quiz updated successfully"}), 200
        else:
            return jsonify({"status": "error", "message": "Quiz not found or no changes made"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/generate-quiz-with-preferences', methods=['POST'])
def generate_quiz_with_preferences():
    data = request.json
    url_or_topic = data.get('url_or_topic', '')
    num_questions = data.get('num_questions', 10)
    difficulty = data.get('difficulty', 'medium')
    question_types = data.get('question_types', ['multiple_choice'])

    if not url_or_topic:
        return jsonify({'status': 'error', 'message': 'Please provide a URL or topic'}), 400

    valid_question_types = ['multiple_choice', 'true_false', 'fill_blank', 'wh_question']
    question_types = [qtype for qtype in question_types if qtype in valid_question_types]
    if not question_types:
        question_types = ['multiple_choice']

    try:
        time.sleep(1)
        quiz_generator = QuizGenerator()
        quiz = quiz_generator.generate_quiz(url_or_topic, {
            'num_questions': num_questions,
            'difficulty': difficulty,
            'question_types': question_types
        })
        
        if not quiz:
            return jsonify({'status': 'error', 'message': 'Failed to generate quiz.'}), 500
        
        return jsonify({'status': 'success', 'quiz': quiz})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Configure Google Gemini API Key
#genai.configure(api_key="AIzaSyD5pUujhEudld3niF7fCIIJhYL4l-1wHcc")  # Replace with your actual API key

#------------------------------XAI---------------------------------------------------------#
# @app.route("/get-lime-explanation", methods=["POST"])
# def lime_explanation():
#     question = request.json.get("question")
#     docs = collection.query(query_texts=[question], n_results=5, include=["documents"])["documents"][0]

#     def predictor(texts):
#         embeddings = model.encode(texts, normalize_embeddings=True)
#         query_embedding = model.encode([question], normalize_embeddings=True)[0]
#         similarities = np.dot(embeddings, query_embedding)
#         return similarities.reshape(-1, 1)

#     explainer = LimeTextExplainer(class_names=["similarity"])
#     exp = explainer.explain_instance(question, predictor, num_features=10)
#     explanation = exp.as_list()

#     return jsonify({"explanation": explanation})
if __name__ == '__main__':
    app.run(debug=True)
