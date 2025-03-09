from googletrans import Translator

# Initialize translator
translator = Translator()

# Define a function to translate text
def translate_text(text, target_language):
    try:
        translation = translator.translate(text, dest=target_language)
        return translation.text
    except Exception as e:
        return f"Error translating text: {str(e)}"
