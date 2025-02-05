# Azure QnA Bot Project

This project implements a Question and Answer bot using Azure AI Language Services. The knowledge base is specifically trained on Deepseek research papers, allowing users to ask questions and get accurate answers about Deepseek's technology and research findings through a web interface.

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
   LANGUAGE_KEY=your_language_service_key
   LANGUAGE_ENDPOINT=your_language_service_endpoint
   PROJECT_NAME=your_project_name
   DEPLOYMENT_NAME=your_deployment_name
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

## Environment Variables

Make sure to set up the following environment variables either in your `.env` file (for local development) or in your deployment platform:

- `LANGUAGE_KEY`: Your Azure Language Service API key
- `LANGUAGE_ENDPOINT`: Your Azure Language Service endpoint URL
- `PROJECT_NAME`: The name of your QnA project in Azure
- `DEPLOYMENT_NAME`: The deployment name of your QnA project

## Note

Remember to never commit your `.env` file or expose your Azure credentials. The `.env` file is included in `.gitignore` for security purposes.
