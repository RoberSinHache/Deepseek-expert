from dotenv import load_dotenv
import os

# import namespaces
from azure.core.credentials import AzureKeyCredential
from azure.ai.language.questionanswering import QuestionAnsweringClient
from azure.ai.language.conversations import ConversationAnalysisClient

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
ai_project_name_deepseek = os.getenv('QA_PROJECT_NAME_DEEPSEEK')
ai_deployment_name_deepseek = os.getenv('QA_DEPLOYMENT_NAME_DEEPSEEK')
ai_project_name_intent = os.getenv('QA_PROJECT_NAME_INTENT')
ai_deployment_name_intent = os.getenv('QA_DEPLOYMENT_NAME_INTENT')

# Configure Azure QnA client
credential = AzureKeyCredential(ai_key)
qna_client = QuestionAnsweringClient(endpoint=ai_endpoint, credential=credential)

@app.route('/ask', methods=['POST'])
def handle_question():
    try:
        data = request.json
        model = data.get('model', 'deepseek-expert')
        
        if model == 'deepseek-expert':
            project_name = ai_project_name_deepseek
            deployment_name = ai_deployment_name_deepseek
            response = qna_client.get_answers(
                question=data['question'],
                project_name=project_name,
                deployment_name=deployment_name
            )
            answers = [{
                "answer": candidate.answer if candidate.confidence >= 0.1 else "I´m not able to help you with that. You can ask me anything about deepseek papers :D",
                "confidence": candidate.confidence
            } for candidate in response.answers]
        elif model == 'intent-detector':
            project_name = ai_project_name_intent
            deployment_name = ai_deployment_name_intent
            client = ConversationAnalysisClient(
                ai_endpoint, AzureKeyCredential(ai_key)
            )
            with client:
                query = data['question']
                result = client.analyze_conversation(
                    task={
                        "kind": "Conversation",
                        "analysisInput": {
                            "conversationItem": {
                                "participantId": "1",
                                "id": "1",
                                "modality": "text",
                                "language": "en",
                                "text": query
                            },
                            "isLoggingEnabled": False
                        },
                        "parameters": {
                            "projectName": project_name,
                            "deploymentName": deployment_name,
                            "verbose": True
                        }
                    }
                )

            """ top_intent = result["result"]["prediction"]["topIntent"] """
            entities = result["result"]["prediction"]["entities"]

            answers = []
            if entities:
                top_intents = sorted(result["result"]["prediction"]["intents"], key=lambda x: x["confidenceScore"], reverse=True)[:5]
                intent_details = '\n'.join([
                    f'- {"🎯 " if i == 0 else "  "}**{intent["category"]}** _{intent["confidenceScore"] * 100:.2f}%_' 
                    for i, intent in enumerate(top_intents)
                ])
                entity_details = '\n'.join([f'- **{entity["text"]}** ({entity["category"]}) _{entity["confidenceScore"] * 100:.2f}%_' for entity in entities])
                answers.append({
                    "answer": f'_Detected Intents_:\n{intent_details}\n\n\n_Entities_:\n{entity_details}',
                    "confidence": result["result"]["prediction"]["intents"][0]["confidenceScore"]
                })
            else:
                top_intents = sorted(result["result"]["prediction"]["intents"], key=lambda x: x["confidenceScore"], reverse=True)[:5]
                intent_details = '\n'.join([
                    f'- {"🎯 " if i == 0 else "  "}**{intent["category"]}** _{intent["confidenceScore"] * 100:.2f}%_' 
                    for i, intent in enumerate(top_intents)
                ])
                entity_details = ''
                
                answers.append({
                    "answer": f'_Detected Intents_:\n{intent_details}' + (f'\n\n\n_Entities_:\n{entity_details}' if entity_details else ''),
                    "confidence": result["result"]["prediction"]["intents"][0]["confidenceScore"]
                })
        
        return jsonify({"answers": answers, "error": None})
    
    except Exception as e:
        print(f'Error occurred: {e}')  # Log the error
        return jsonify({'error': str(e)}), 500

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
