import google.generativeai as genai

# Configure the Gemini API
genai.configure(api_key="AIzaSyDxtipjq-0M7JJTC6XvTvy34_gdHAJA-iE")

# Initialize the Gemini model
model = genai.GenerativeModel("gemini-2.0-flash")

def generate_chat_response(user_message):
    """
    Sends a user message to the Gemini API and returns the AI-generated response.
    """
    try:
        response = model.generate_content(
            user_message,
            generation_config=genai.types.GenerationConfig(
                candidate_count=1,
                max_output_tokens=200,  # Adjust based on expected response length
                temperature=0.7
            )
        )
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"