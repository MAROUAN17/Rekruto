from dotenv import load_dotenv
import os
from google import genai
from google.genai import types
import json
import requests
from fastapi.responses import StreamingResponse


# Import templates
try:
    with open("Resume.html", "r") as file:
        resume_template = file.read()
    with open("Cover_Letter.html", "r") as file:
        cover_letter_template = file.read().strip()
    with open("data.json", "r") as file:
        user_data = file.read().strip()
    with open("Cover_letter_prompt.txt", "r") as file:
        cover_letter_prompt = file.read().strip()
    with open("Resume_prompt.txt", "r") as file:
        resume_prompt = file.read().strip()
    with open("system_prompt.txt", "r") as file:
        system_prompt = file.read().strip()
except Exception as e:
    print(f"Error Opening file: {e}")
##################

load_dotenv()


class AIagent:
    def __init__(self):
        self.client = genai.Client()
        self.model = "gemini-2.5-flash"
        self.resume_template = resume_template
        self.cover_letter_template = cover_letter_template
        self.resume_system_prompt = resume_prompt
        self.cover_letter_prompt = cover_letter_prompt
        self.system_prompt = system_prompt

    def generateDocs(self, data, job_description):
        user_prompt = f"""Generate both resume and cover letter for this candidate.
Job Description:
{job_description}

Candidate's Data:
{data}

Resume template:
{self.resume_template}

Cover letter template:
{self.cover_letter_template}
"""
        print("Waiting for Ai-Agent to respond...\n")
        response = self.client.models.generate_content(
            model=self.model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=self.system_prompt,
                temperature=0.3,
                response_mime_type="application/json",
            ),
        )
        print("Response Ready!")
        result = json.loads(response.text)
        return result

    def exportPDF_bytes(self, data: dict[str, str]):
        payload = {"html": data["html"], "title": data["title"]}
        response_pdf = requests.post(
            "http://puppeteer:3000/generate-pdf",
            json=payload,
            headers={"Content-Type": "application/json"},
            stream=True,
        )

        # Collect all chunks
        chunks = []
        for chunk in response_pdf.iter_content(chunk_size=8192):
            chunks.append(chunk)

        return b"".join(chunks)

    def exportPDF(self, data: dict[str, str]):
        payload = {"html": data["html"], "title": data["title"]}
        response_pdf = requests.post(
            "http://puppeteer:3000/generate-pdf",
            json=payload,
            headers={"Content-Type": "application/json"},
            stream=True,
        )

        def streamChunks():
            for chunk in response_pdf.iter_content(chunk_size=8192):
                yield chunk

        if response_pdf.status_code == 200:
            print("File received successfully!")
            return StreamingResponse(  # sending pdf bytes directly without buffering
                streamChunks(),
                status_code=200,
                media_type=response_pdf.headers.get("content-type"),
                headers={
                    "Content-Disposition": response_pdf.headers.get(
                        "content-disposition", ""
                    )
                },
            )
        else:
            raise ("Error: ", response_pdf.status_code)
