from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from pydantic import BaseModel
from langchain_groq import ChatGroq # type: ignore
from typing import List, Optional
from langchain.prompts import PromptTemplate
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

import os
import uuid
import googlemaps # type: ignore

from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

api_key = os.getenv('GROQ_API_KEY')
# print("GROQ_API_KEY:", api_key)
google_maps_api_key = os.getenv("GOOGLE_MAPS_API_KEY")
gmaps = googlemaps.Client(key=google_maps_api_key)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Model
class ChatRequest(BaseModel):
    message: str
    session_id: str = uuid.uuid4().hex  # Generate a new session ID if not provided
    api_key: str = api_key # Groq API key from frontend

# Response Model
class ChatResponse(BaseModel):
    answer: str
    history: Optional[List[dict]] = []  # Optional chat history
    session_id: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        # Initialize Groq (your existing config)
        llm = ChatGroq(
            groq_api_key=request.api_key,
            model_name="Gemma2-9b-It",
            temperature=0.8
        )

        # Define the response schema
        response_schemas = [
            ResponseSchema(name="answer", description="The main response to the user's query"),
            ResponseSchema(name="action", description="The action to take, if any (e.g., 'call_google_maps', 'none')"),
            ResponseSchema(name="parameters", description="Parameters for the action, if applicable (e.g., origin, destination)"),
        ]
        output_parser = StructuredOutputParser.from_response_schemas(response_schemas)

        # Define the prompt template
        prompt_template = PromptTemplate(
            template=(
                "You are a helpful assistant with map knowledge. Respond to the user's query in a structured format.\n\n"
                "User Query: {user_query}\n\n"
                "Response Format:\n"
                "{format_instructions}"
            ),
            input_variables=["user_query"],
            partial_variables={"format_instructions": output_parser.get_format_instructions()},
        )

        # Generate the prompt
        prompt = prompt_template.format(user_query=request.message)

        # Get the LLM response
        llm_response = llm.invoke(prompt)

        # Parse the LLM response
        parsed_response = output_parser.parse(llm_response.content)

        # Handle actions (e.g., call Google Maps API)
        # if parsed_response["action"] == "call_google_maps":
        #     parameters = parsed_response["parameters"]
        #     origin = parameters.get("origin")
        #     destination = parameters.get("destination")

            # Call Google Maps Directions API
            # directions_result = gmaps.directions(origin, destination)
            # if directions_result:
            #     route = directions_result[0]["legs"][0]
            #     steps = route["steps"]
            #     directions = "\n".join([step["html_instructions"] for step in steps])
            #     parsed_response["answer"] += f"\n\nDirections:\n{directions}"

        
        return ChatResponse(
            answer=parsed_response['answer'],
            history=[{"role": "user", "content": request.message}, {"role": "assistant", "content": parsed_response['answer']}],
            session_id=request.session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn # type: ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)

