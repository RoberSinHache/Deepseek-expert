# Azure QnA Bot Project

This project implements a Question and Answer bot using Azure AI Language Services. The knowledge base is specifically trained on Deepseek research papers, allowing users to ask questions and get accurate answers about those papers, and also, an intent detector chatbot that analyzes input messages to detect and display the top five potential intentions with their corresponding probabilities.

## Prerequisites

Before running this project, you need to set up the required Azure resources. Please follow the steps outlined in:
[Microsoft Learning - Create a Question Answering Solution](https://microsoftlearning.github.io/mslearn-ai-language/Instructions/Exercises/02-qna.html)

This tutorial will guide you through:
- Creating an Azure AI Language Service resource
- Creating and configuring your knowledge base
- Getting the necessary credentials for the application

## Deployment Options

### Option 1: Deploy to Render

This project is configured to be deployed as a Docker container on Render. You can use the provided Dockerfile to build and deploy the application.

### Option 2: Run Locally

To run the application locally, follow these steps:

1. Ensure you have Python installed on your system

2. Create a `.env` file in the root directory of the project using the `.env.template` as reference. Fill in the following variables with the values from your Azure resources:
   ```
    AI_SERVICE_ENDPOINT=your_ai_service_endpoint_here
    AI_SERVICE_KEY=your_ai_service_key_here

    # QA Service Configuration
    QA_DEPLOYMENT_NAME_DEEPSEEK=your_qa_deployment_name_here
    QA_PROJECT_NAME_DEEPSEEK=your_qa_project_name_here

    # Intent Service Configuration
    QA_DEPLOYMENT_NAME_INTENT=your_qa_deployment_name_here
    QA_PROJECT_NAME_INTENT=your_qa_project_name_here
   ```

3. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open your web browser and navigate to `http://localhost:5000` (or the port shown in the terminal)

