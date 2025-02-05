from dotenv import load_dotenv
import os

# import namespaces
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.questionanswering import QuestionAnsweringClient

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import threading

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load Azure configuration
load_dotenv()
ai_endpoint = os.getenv('AI_SERVICE_ENDPOINT')
ai_key = os.getenv('AI_SERVICE_KEY')
ai_project_name = os.getenv('QA_PROJECT_NAME')
ai_deployment_name = os.getenv('QA_DEPLOYMENT_NAME')

# Configure Azure QnA client
credential = AzureKeyCredential(ai_key)
qna_client = QuestionAnsweringClient(endpoint=ai_endpoint, credential=credential)

@app.route('/ask', methods=['POST'])
def handle_question():
    data = request.json
    try:
        response = qna_client.get_answers(
            question=data['question'],
            project_name=ai_project_name,
            deployment_name=ai_deployment_name
        )
        
        answers = [{
            "answer": candidate.answer,
            "confidence": candidate.confidence
        } for candidate in response.answers]
        
        return jsonify({"answers": answers, "error": None})
    
    except Exception as e:
        return jsonify({"answers": [], "error": str(e)}), 500

@app.route('/')
def index():
    return render_template('index.html')

def main():
    try:
        if __name__ == '__main__':
            app.run(host='0.0.0.0', port=5000, threaded=True)

    except Exception as ex:
        print(ex)


if __name__ == "__main__":
    main()
