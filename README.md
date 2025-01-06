# MetaModel

https://github.com/user-attachments/assets/bb900b4e-b231-472a-b9f9-98c802dd7210

MetaModel is a web application that streamlines the extraction and generation of structured data from unstructured text or images. It leverages advanced language models to parse information according to the provided schema, which can be defined either in plain language or through a user-friendly visual interface.

Built on top of [instructor](https://github.com/jxnl/instructor) and [pydantic](https://github.com/pydantic/pydantic), MetaModel creates dynamic Pydantic models for constraining and validating data. It also integrates with [litellm](https://github.com/BerriAI/litellm) to support language models from various providers.

## Features

- **Intuitive Schema Definition:** Easily define complex data structures using MetaModel's JSON format. Specify data types, constraints, nested schemas, and more. **Or, describe your schema in plain language, and let language models generate it for you!**
- **LLM-Powered Data Extraction:** Parse text or images into structured data using language models from various providers, supported by [litellm](https://github.com/BerriAI/litellm).
- **Built-in Validation:** Ensure data integrity with Pydantic's built-in data validation against your schema constraints.
- **Interactive Web Interface:**  A user-friendly interface allows you to easily create, edit, and test your schemas.
- **Streamlined Workflow:**  Seamlessly integrate data extraction into your applications and workflows using MetaModel's backend API. Define schemas, send parse requests, and receive structured data effortlessly.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- Python (v3.11 or later)
- Docker and Docker Compose (optional, for containerized deployment)

### Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/lazyhope/metamodel.git
   cd metamodel
   ```

2. Set up the frontend:

   ```sh
   cd frontend
   echo "VITE_API_URL=http://localhost:8000" > .env  # Set the API URL

   # Optionally, set the preset language model and token
   echo "VITE_PRESET_MODEL_NAME=your-model-name-here" >> .env
   echo "VITE_PRESET_TOKEN=your-token-here" >> .env  # Don't use real API keys here
   npm install
   ```

3. Set up the backend:

   ```sh
   cd ../backend
   echo "BACKEND_CORS_ORIGINS=http://localhost,http://localhost:5173" > .env  # Set the CORS origins (separated by commas) or use * to allow all
   # Or use regex to specify CORS origins
   echo 'BACKEND_CORS_ORIGINS_REGEX="^https?://localhost(:\d+)?$"' >> .env

   # Optionally, set the preset language model and token matching the frontend
   echo "PRESET_MODEL_NAME=your-model-name-here" >> .env
   echo "PRESET_TOKEN=your-token-here" >> .env  # Don't use real API keys here
   echo "LITELLM_API_KEY=your-real-api-key-here" >> .env  # Use real API key here
   pip install -r requirements.txt
   ```

### Running the Application

1. Start the backend server:

   ```sh
   cd backend
   source .env
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

2. In a new terminal, start the frontend development server:

   ```sh
   cd frontend
   source .env
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to use.

## Deploy to Vercel

See [frontend/README.md](frontend/README.md)

## Docker Deployment

To deploy the application using Docker:

1. Ensure Docker and Docker Compose are installed on your system.
2. Edit `.env` file in the root directory and set your environment variables, see [.env.example](.env.example) for reference.

   ```sh
   cp .env.example .env
   ```

3. Run the following command in the root directory:

   ```sh
   docker compose up --build
   ```

4. Access the application at `http://localhost:80`.

It is also possible to deploy frontend and backend separately using their respective Dockerfile and environment variables.

## Usage

1. Choose language models and enter your API key in the settings.
2. Customize other parameters for optimal performance.
3. Use the schema builder interface to create your own data structure.
4. Interact with the AI chat to refine your schema or parse data.
5. Import existing JSON schemas or export your created schemas.

## API Documentation

[Swagger UI](https://metamodel.onrender.com/docs)

The doc server may take up to a minute to spin up due to inactivity on Render's free tier,
see <https://render.com/docs/free#spinning-down-on-idle> for more information.
