import google.generativeai as genai
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled
import re
from langdetect import detect
from googletrans import Translator

class QuizGenerator:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-pro-latest")
    
    def extract_video_id(self, youtube_url):
        """Extracts the video ID from a YouTube URL."""
        pattern = r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^\"&?\/\s]{11})"
        match = re.search(pattern, youtube_url)
        return match.group(1) if match else None
    
    def get_youtube_transcript(self, video_url):
        """Fetches the transcript in the video's original language."""
        video_id = self.extract_video_id(video_url)
        if not video_id:
            return None, "Invalid YouTube URL."

        try:
            # Fetch transcript in the original language
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            full_transcript = " ".join([entry["text"] for entry in transcript])
            return full_transcript, None
        except TranscriptsDisabled:
            return None, "Transcripts are disabled for this video."
        except Exception as e:
            return None, f"Error fetching transcript: {e}"
    
    def translate_to_english(self, text):
        """Translates text to English if it's not already in English."""
        try:
            detected_lang = detect(text)
            if detected_lang == 'en':
                return text
            translator = Translator()
            translated_text = translator.translate(text, src=detected_lang, dest='en')
            return translated_text.text
        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Return original text if translation fails
    
    def parse_quiz_response(self, raw_quiz_text):
        """Parses the raw quiz text into a structured format with improved pattern matching."""
        quiz_questions = []
        
        # Better regex to catch questions with different numbering styles
        questions_raw = re.split(r'\n\s*(?:\d+[\.\)]\s+|\d+\s+)', raw_quiz_text)
        
        if len(questions_raw) > 1:
            questions_raw = questions_raw[1:]  # Skip any text before the first question
            
            for i, question_text in enumerate(questions_raw):
                lines = question_text.strip().split('\n')
                if not lines or len(lines) < 2:  # Need at least question and one option
                    continue
                    
                question_dict = {
                    "question": f"{i+1}. {lines[0]}",
                    "options": [],
                    "correct_answer": "",
                    "type": "multiple_choice"  # Default type
                }
                
                # Improved option and answer extraction
                in_options = True
                for line in lines[1:]:
                    line = line.strip()
                    if not line:
                        continue
                        
                    # Check for correct answer line with various formats
                    if re.search(r'^correct\s+answer\s*:|\bcorrect\s*:|\banswer\s*:|^answer\s*:', line.lower()):
                        in_options = False
                        correct_answer = line[line.find(":")+1:].strip()
                        question_dict["correct_answer"] = correct_answer
                    # More flexible option pattern matching
                    elif in_options and re.match(r'^[a-dA-D][\.\)]\s+|^[a-dA-D]\s+|^\(?[a-dA-D]\)?[\.\)]\s*', line):
                        question_dict["options"].append(line)
                
                # Only add questions that have both options and a correct answer
                if question_dict["options"] and question_dict["correct_answer"]:
                    quiz_questions.append(question_dict)
                elif question_dict["options"]:  # If we have options but no explicit correct answer
                    # Try to extract answer from options if it contains "correct" marker
                    for opt in question_dict["options"]:
                        if "correct" in opt.lower():
                            question_dict["correct_answer"] = opt
                            quiz_questions.append(question_dict)
                            break
        
        return quiz_questions
    
    def generate_quiz_prompt(self, content, preferences):
        """Generates a more explicit prompt for the quiz based on preferences."""
        num_questions = preferences.get('num_questions', 5)
        difficulty = preferences.get('difficulty', 'medium')
        question_types = preferences.get('question_types', ['multiple_choice'])
        
        # Map difficulty levels
        difficulty_map = {
            "easy": "Easy: Simple recall-based questions with distinct options.",
            "medium": "Medium: Questions requiring understanding and application with slightly tricky options.",
            "hard": "Hard: Analytical questions requiring critical thinking, with closely related options."
        }
        
        # Build the question types part of the prompt
        question_type_instructions = []
        if 'multiple_choice' in question_types:
            question_type_instructions.append("Multiple Choice: Four options with one correct answer.")
        if 'true_false' in question_types:
            question_type_instructions.append("True/False: Statement that is either true or false.")
        if 'fill_blank' in question_types:
            question_type_instructions.append("Fill in the Blank: A statement with a missing word or phrase.")
        if 'wh_question' in question_types:
            question_type_instructions.append("WH Questions: Open-ended questions starting with what, why, how, etc.")
        
        prompt = f"""
        You are an expert quiz generator. Your task is to create EXACTLY {num_questions} questions for a quiz based on the following content. The quiz should assess understanding of the key concepts and information presented.

        **Content:**
        {content[:15000]}  # Limiting input to 15000 characters

        **Quiz Specifications:**

        - **Number of Questions:** EXACTLY {num_questions} questions, no more, no less
        - **Difficulty Level:** {difficulty_map.get(difficulty, difficulty_map['medium'])}
        - **Question Types:** {', '.join(question_type_instructions)}
        - **Avoid:** Do not generate questions that are trivial, ambiguous, or rely on information not provided in the content.

        **IMPORTANT: You MUST generate EXACTLY {num_questions} questions following this format:**

        For each question, follow this format EXACTLY:

        1. [Question Text]
            a) [Option A]
            b) [Option B]
            c) [Option C]
            d) [Option D]
        Correct Answer: [Letter of Correct Option] - [Brief restatement of the correct answer]

        **Example:**

        1. What is the capital of France?
            a) London
            b) Paris
            c) Rome
            d) Berlin
        Correct Answer: b - Paris

        Now, generate EXACTLY {num_questions} questions based on the provided content and specifications. Be concise and accurate. Do not add any additional text between questions or at the end. Make sure each question follows the exact format shown above.
        """
        
        return prompt
    
    def is_youtube_url(self, url):
        """Checks if the provided string is a YouTube URL."""
        youtube_pattern = r"(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/|youtu\.be\/)"
        return bool(re.match(youtube_pattern, url))
    
    def generate_quiz(self, url_or_topic, preferences):
        """Generates a quiz based on a YouTube URL or a topic with validation and retry."""
        try:
            # Check if input is a YouTube URL
            if self.is_youtube_url(url_or_topic):
                # Get transcript from YouTube
                transcript, error = self.get_youtube_transcript(url_or_topic)
                if error:
                    return []
                
                # Translate if needed
                content = self.translate_to_english(transcript)
            else:
                # Use the topic directly
                content = f"Generate a quiz about the topic: {url_or_topic}"
            
            # Add validation and retry logic
            max_attempts = 3  # Try up to 3 times
            desired_count = preferences.get('num_questions', 5)
            quiz_questions = []
            
            for attempt in range(max_attempts):
                # Generate quiz prompt
                prompt = self.generate_quiz_prompt(content, preferences)
                
                # Generate quiz with Gemini
                response = self.model.generate_content(prompt)
                raw_quiz = response.text
                
                # Parse and format quiz
                parsed_questions = self.parse_quiz_response(raw_quiz)
                
                # Check if we got enough questions
                if len(parsed_questions) >= desired_count:
                    quiz_questions = parsed_questions[:desired_count]  # Take exactly the desired count
                    break
                else:
                    print(f"Attempt {attempt+1}: Got {len(parsed_questions)} questions instead of {desired_count}. " +
                          (f"Retrying..." if attempt < max_attempts-1 else "Using what we have."))
                    quiz_questions = parsed_questions  # Use what we have if all attempts fail
            
            # If we still don't have enough questions after all attempts,
            # generate simple placeholder questions to make up the difference
            if len(quiz_questions) < desired_count:
                for i in range(len(quiz_questions), desired_count):
                    placeholder_q = {
                        "question": f"{i+1}. Question about {url_or_topic}",
                        "options": [
                            "a) Option A", 
                            "b) Option B", 
                            "c) Option C", 
                            "d) Option D"
                        ],
                        "correct_answer": "Please regenerate this quiz",
                        "type": "multiple_choice"
                    }
                    quiz_questions.append(placeholder_q)
            
            return quiz_questions
        except Exception as e:
            print(f"Error generating quiz: {e}")
            return []