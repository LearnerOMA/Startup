import google.generativeai as genai
import os
import io
import uuid
import docx
import PyPDF2
from pptx import Presentation

# Configure the Gemini API
genai.configure(api_key="AIzaSyDxtipjq-0M7JJTC6XvTvy34_gdHAJA-iE")

# Initialize the Gemini model
model = genai.GenerativeModel("gemini-2.0-flash")

def generate_chat_response(user_message):
    """
    Sends a user message to the Gemini API and returns the AI-generated response.
    """
    
    prompt = f"""You are an AI assistant specialized in helping students prepare for UPSC and MPSC exams.
        Your goal is to provide accurate, helpful information about exam preparation, syllabus, 
        study materials, strategies, and answer general questions.
        
        User question: {user_message}
        """
        
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=400,  # Adjust based on expected response length
                temperature=0.7
            )
        )
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"


def extract_text_from_file(file, file_extension):
    """Extract text content from different file types"""
    
    try:
        file_content = file.read()
        
        if file_extension == 'txt':
            # For text files, decode content
            return file_content.decode('utf-8', errors='replace')
        
        elif file_extension == 'pdf':
            # For PDF files
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        
        elif file_extension == 'docx':
            # For Word documents
            doc = docx.Document(io.BytesIO(file_content))
            text = []
            for para in doc.paragraphs:
                text.append(para.text)
            return '\n'.join(text)
        
        elif file_extension == 'pptx':
            # For PowerPoint presentations
            ppt = Presentation(io.BytesIO(file_content))
            text = []
            for slide in ppt.slides:
                for shape in slide.shapes:
                    if hasattr(shape, "text"):
                        text.append(shape.text)
            return '\n'.join(text)
        
        return "Unable to extract text from this document format."
    
    except Exception as e:
        return f"Error extracting text: {str(e)}"

def save_uploaded_document(file, upload_folder):
    """Save an uploaded file and extract its content"""
    
    if file.filename == '':
        return None, "No selected file"
    
    file_extension = file.filename.split('.')[-1].lower()
    
    if file_extension not in ['pdf', 'docx', 'pptx', 'txt']:
        return None, "Unsupported file format"
    
    try:
        # Extract text based on file type
        content = extract_text_from_file(file, file_extension)
        
        # Generate a unique ID for the document
        document_id = str(uuid.uuid4())
        
        # Save file to disk
        file_path = os.path.join(upload_folder, document_id + '.' + file_extension)
        file.seek(0)
        file.save(file_path)
        
        # Return document information
        return {
            'id': document_id,
            'filename': file.filename,
            'content': content,
            'path': file_path
        }, None
    
    except Exception as e:
        return None, str(e)

def generate_document_response(document_content, user_message, model_name="gemini-2.0-flash"):
    """Generate a response based on document content and user query"""
    
    try:
        # Create a prompt that includes document context
        prompt = f"""
        Based on the following document content: 

        {document_content[:10000]}  # Limiting to first 10000 chars to avoid token limits
        
        Answer this question: {user_message}
        
        If the answer cannot be found in the document, let the user know.
        """
        
        # Use Gemini to generate a response
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        
        return response.text, None
    
    except Exception as e:
        return None, str(e)