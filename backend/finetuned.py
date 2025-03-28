import os
from google.generativeai import GenerativeModel
import google.generativeai as genai
from google.generativeai.types.generation_types import StopCandidateException

# Configure the Gemini API
os.environ['GOOGLE_API_KEY'] = 'AIzaSyB4IIN_7-dRYZYS6V4Tszznfm7uoxcyIwE'  
genai.configure(api_key='AIzaSyB4IIN_7-dRYZYS6V4Tszznfm7uoxcyIwE')

def generate_fine_tuned_response(messages):
    """
    Generate a response using a fine-tuned Gemini model
    
    Args:
        messages (list): List of message dictionaries with 'role' and 'content' keys
    
    Returns:
        str: Generated response from the fine-tuned model
    """
    try:
        # Initialize the fine-tuned model 
        # Note: Replace 'your-fine-tuned-model-id' with actual model ID
        model = GenerativeModel('tunedModels/generate-num-2981')
        
        # Transform messages to match Gemini's expected input format
        gemini_messages = []
        for msg in messages:
            role = 'user' if msg['role'] == 'user' else 'model'
            gemini_messages.append({
                'role': role,
                'parts': [{'text': msg['content']}]
            })
        
        # Generate response
        response = model.generate_content(
            gemini_messages,
            generation_config={
                'temperature': 0.7,
                'max_output_tokens': 10000
            }
        )
        
        # Return the generated text
        return response.text
    
    except StopCandidateException as stop_ex:
        # Handle potential generation stopping
        return "I apologize, but I couldn't complete the response."
    
    except Exception as e:
        # Log the error and provide a fallback response
        print(f"Error in fine-tuned chat: {e}")
        return "I'm experiencing some technical difficulties. Please try again."

# Optional: Add some test code to verify the function
if __name__ == '__main__':
    test_messages = [
        {'role': 'user', 'content': 'Hello, how are you today?'}
    ]
    response = generate_fine_tuned_response(test_messages)
    print("Test Response:", response)