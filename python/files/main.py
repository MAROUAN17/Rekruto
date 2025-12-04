from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from services.agent import AIagent, AIagentLite
from fastapi.responses import HTMLResponse
import zipfile
import io
from fastapi.responses import StreamingResponse
import PyPDF2
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# client = genai.Client()
# response = client.models.generate_content(model="gemini-2.5-flash", contents="Hey!")
# print(response.text)
# def generateCv():

agent = AIagent()
agentLite = AIagentLite()
with open("data.json", "r") as file:
    user_data = file.read().strip()


@app.post("/generate")
async def root(file: UploadFile = File(...), description: str = Form(...)):
    extracted_data = await extract(file)
    docs_json = agent.generateDocs(extracted_data, description)
    # print(docs_json)
    # resume_json = {"html": docs_json["resume"], "title": docs_json["resume_title"]}
    # cover_letter_json = {
    #     "html": docs_json["cover_letter"],
    #     "title": docs_json["cover_letter_title"],
    # }
    # resume_pdf = agent.exportPDF_bytes(resume_json)
    # cover_letter_pdf = agent.exportPDF_bytes(cover_letter_json)

    # buffer = io.BytesIO()

    # with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
    #     zf.writestr(resume_json["title"] + ".html", resume_json["html"])
    #     zf.writestr(cover_letter_json["title"] + ".html", cover_letter_json["html"])
    # with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
    #     zf.writestr(resume_json["title"] + ".pdf", resume_pdf)
    #     zf.writestr(cover_letter_json["title"] + ".pdf", cover_letter_pdf)

    # buffer.seek(0)
    return docs_json

    # return StreamingResponse(
    #     iter([buffer.getvalue()]),
    #     media_type="application/zip",
    #     headers={"Content-Disposition": 'attachment; filename="documents.zip"'},
    # )


async def extract(file: UploadFile = File(...)):
    print("Got req")
    try:
        if not file.filename:
            raise HTTPException(status_code=400)

        content = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        res = agentLite.extractData(text)
        return res
    except Exception as e:
        print("err -> ", str(e))
        raise HTTPException(status_code=500, detail=str(e))
