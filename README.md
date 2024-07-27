# MetaModel

MetaModel is a web app designed to simplify the process of defining and working with complex data structures.

Built on top of [instructor](https://github.com/jxnl/instructor) and [pydantic](https://github.com/pydantic/pydantic), MetaModel uses a custom JSON schema to create dynamic pydantic models for parsing unstructured text or image inputs.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flazyhope%2Fmetamodel)

## Features

- **Intuitive Schema Definition:** Define complex data structures with ease using MetaModel's JSON format. Specify data types, constraints, nested schemas, and more. **Or, describe your schema in natural language, and let language models generate it for you!**
- **LLM-Powered Data Extraction:** Parse text or images into structured data using LLMs from various providers, thanks to [litellm](https://github.com/BerriAI/litellm).
- **Built-in Validation:** Ensure data integrity with Pydantic's built-in data validation against your schema definition.
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
   npm install
   ```

3. Set up the backend:

   ```sh
   cd ../backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory and add your environment variables:

   ```sh
   VITE_API_URL=http://localhost:8000
   BACKEND_CORS_ORIGINS="http://localhost,http://localhost:5173"
   ```

### Running the Application

1. Start the backend server:

   ```sh
   cd backend
   uvicorn app.main:app --reload
   ```

2. In a new terminal, start the frontend development server:

   ```sh
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to use.

## Docker Deployment

To deploy the application using Docker:

1. Ensure Docker and Docker Compose are installed on your system.
2. Run the following command in the root directory:

   ```sh
   docker-compose up --build
   ```

3. Access the application at `http://localhost:80`.

## Usage

1. Choose language models and enter your API key.
2. Customize other settings for optimal performance.
3. Use the schema builder interface to create your data structure.
4. Interact with the AI chat to refine your schema or parse data.
5. Import existing JSON schemas or export your created schemas.

## TODO

- Allows metamodel schema export
- Add `dict` type support
- Add documentation for API endpoints
- Add tests
