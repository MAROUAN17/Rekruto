from fastapi import FastAPI
from services.agent import AIagent
from fastapi.responses import HTMLResponse
import zipfile
import io
from fastapi.responses import StreamingResponse

app = FastAPI()

# client = genai.Client()
# response = client.models.generate_content(model="gemini-2.5-flash", contents="Hey!")
# print(response.text)
# def generateCv():

agent = AIagent()
with open("data.json", "r") as file:
    user_data = file.read().strip()

temp_res = {
    "resume": '<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8"/>\n<meta name="viewport" content="width=device-width,initial-scale=1"/>\n<title>Oussama Ait Laasri - Resume</title>\n<style>\n*{margin:0;padding:0;box-sizing:border-box}\nbody{font-family:Calibri,Arial,sans-serif;line-height:1.4;color:#000;background:#fff}\n.resume{max-width:8.5in;padding:.1in;background:#fff}\n.header{text-align:center;margin-bottom:16px}\n.header h1{font-size:20px;font-weight:bold;letter-spacing:2px;margin-bottom:4px}\n.contact-info{font-size:11px}\n.section{margin-bottom:12px}\n.section-title{font-size:12px;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #000;padding-bottom:2px;margin-bottom:8px;letter-spacing:.5px}\n.section-content{font-size:11px}\n.job-header,.project-header,.education-header{display:flex;justify-content:space-between;font-weight:bold;margin-bottom:2px}\n.job-title,.project-title{font-weight:normal;font-style:italic;margin-bottom:4px}\n.education-details{display:flex;justify-content:space-between;margin-bottom:2px}\n.education-details div:first-child{font-style:italic}\nul{margin-left:20px;margin-top:4px;margin-bottom:8px}\nli{margin-bottom:3px}\n.summary-text{margin-bottom:8px;text-align:justify}\n.skill-row{margin-bottom:3px}\n.skill-label{font-weight:bold;display:inline}\n@media print{body{background:#fff}.resume{margin:0;padding:.2in}}\n</style>\n</head>\n<body>\n<div class="resume">\n<div class="header">\n<h1>OUSSAMA AIT LAASRI</h1>\n<div class="contact-info">+212628128429 • oussamasan02@gmail.com • linkedin.com/oussama-ait-laasri • github.com/Geesama02</div>\n</div>\n<div class="section">\n<div class="section-title">Summary</div>\n<div class="section-content">\n<p class="summary-text">Motivated Software Engineering student with a robust foundation in system-level programming (C, C++) and backend development principles. Eager to leverage strong problem-solving and debugging skills to contribute to advanced AI research and development, with a proven ability to quickly adapt to new technologies like Go (Golang) and ensure the reliability and scalability of backend systems.</p>\n</div>\n</div>\n<div class="section">\n<div class="section-title">Education</div>\n<div class="section-content">\n<div class="education-header"><div><strong>Software Engineering</strong></div><div><strong>2023 - PRESENT</strong></div></div>\n<div class="education-details"><div>1337 Coding School (42 Network)</div></div>\n<div style="margin-bottom:4px">Self-driven, project-based learning with a focus on algorithms, programming, collaborative projects and peer-based learning.</div>\n<div class="education-header"><div><strong>Specialized Technician in Full-Stack Web</strong></div><div><strong>2021 - 2023</strong></div></div>\n<div class="education-details"><div>OFPPT</div></div>\n<div style="margin-bottom:4px">Vocational training program specializing in full-stack web development, covering front-end and back-end technologies.</div>\n</div>\n</div>\n<div class="section">\n<div class="section-title">Technical Skills</div>\n<div class="section-content">\n<div class="skill-row"><span class="skill-label">Programming Languages:</span> C, C++, Python, Javascript, Typescript, MySQL</div>\n<div class="skill-row"><span class="skill-label">Backend Technologies:</span> Fastify, WebSockets, NGINX, Docker, Docker Compose, MariaDB, Redis, HTTP Servers</div>\n<div class="skill-row"><span class="skill-label">Tools & Methodologies:</span> Git, Agile, Debugging, Testing, System Calls, Process Management</div>\n<div class="skill-row"><span class="skill-label">Core Competencies:</span> Problem Solving, Communication, Collaboration, Adaptability, Time Management</div>\n</div>\n</div>\n<div class="section">\n<div class="section-title">Projects</div>\n<div class="section-content">\n<div class="project-header"><div><strong>Web-Server</strong></div><div>JAN 2025 - MAR 2025</div></div>\n<div class="project-title">Custom HTTP Server in C++</div>\n<ul>\n<li>Built a custom HTTP server from scratch, demonstrating expertise in socket programming and multi-threading for efficient, scalable server architecture.</li>\n<li>Implemented robust error handling and logging mechanisms to ensure server reliability and reproducibility.</li>\n<li>Focused on adherence to web protocols, enabling comprehensive testing and validation of backend system responses.</li>\n</ul>\n<div class="project-header"><div><strong>Inception</strong></div><div>APR 2025 - MAY 2025</div></div>\n<div class="project-title">Docker Virtualized Infrastructure with Multiple Services</div>\n<ul>\n<li>Designed and deployed a Docker-based multi-service infrastructure, ensuring scalability and consistent operation of various backend components.</li>\n<li>Configured NGINX with SSL, WordPress with MariaDB, Redis for caching, and an FTP server, demonstrating robust system integration.</li>\n<li>Utilized Docker Compose for orchestration, enhancing reproducibility and maintainability of the complex environment.</li>\n</ul>\n<div class="project-header"><div><strong>NeonPong</strong></div><div>JUL 2025 - SEP 2025</div></div>\n<div class="project-title">Full-Stack Web Application</div>\n<ul>\n<li>Developed a real-time multiplayer backend using Fastify and WebSockets, ensuring low-latency gameplay and responsive user interactions.</li>\n<li>Implemented user authentication and matchmaking systems, including comprehensive unit and integration tests for solution verification.</li>\n<li>Collaborated in an Agile team environment, providing structured feedback on solution quality and architecture.</li>\n</ul>\n<div class="project-header"><div><strong>Minishell</strong></div><div>AUG 2024 - OCT 2024</div></div>\n<div class="project-title">Custom Shell in C</div>\n<ul>\n<li>Developed a custom Unix shell, demonstrating deep understanding of system calls, process management, and environment variable handling.</li>\n<li>Implemented command parsing, piping, and redirection functionalities, focusing on robust error handling and debugging.</li>\n<li>Ensured the shell\'s reliability and reproducibility through rigorous testing of various command execution scenarios.</li>\n</ul>\n</div>\n</div>\n</div>\n</body>\n</html>',
    "title": "Oussama Ait Laasri - Backend Software Engineer Resume (AI Jobs)",
}


@app.get("/", response_class=HTMLResponse)
def root():
    jd = """Job title- Backend Software Engineer

 AI Jobs is hiring for one of the global players in the artificial intelligence industry, seeking experienced Backend Software Engineers with strong expertise in Go (Golang). This project-based engagement supports advanced AI research and development efforts that extend real-world coding benchmarks across diverse technical domains.


This is a unique opportunity to apply your backend engineering expertise to projects shaping the next generation of intelligent systems.


Key Responsibilities

Develop and validate coding benchmarks in Go, curating issues, solutions, and test suites from real-world repositories.
Ensure benchmark tasks include comprehensive unit and integration tests for solution verification.
Maintain scalability and consistency of benchmark distribution and quality.
Debug, optimize, and document benchmark code for reliability and reproducibility.
Provide structured feedback on solution quality, architecture, and best practices.


Ideal Qualifications

3-10 years of experience as a Backend Engineer, Machine Learning Engineer, or Applied Data Scientist.
Degree in Computer Science, Software Engineering, or related field.
Proven expertise in Go (Golang).
Experience with debugging, testing, and validating backend systems.
Excellent attention to detail and clear technical communication skills.


Project Timeline

Start Date: Immediate
Duration: 1 month
Commitment: Part-time (15-20 hours/week)
Schedule: Fully remote and asynchronous — flexible working hours


Compensation & Contract

Hourly Rate: $90/hour + performance-based bonuses (average total ~$200/hour)
Contract Type: Independent Contractor
Payment: Daily via Stripe Connect"""
    docs_json = agent.generateDocs(user_data, jd)
    print(docs_json)
    resume_json = {"html": docs_json["resume"], "title": docs_json["resume_title"]}
    cover_letter_json = {
        "html": docs_json["cover_letter"],
        "title": docs_json["cover_letter_title"],
    }
    resume_pdf = agent.exportPDF_bytes(resume_json)
    cover_letter_pdf = agent.exportPDF_bytes(cover_letter_json)

    # zip files
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr(resume_json["title"], resume_pdf)
        zf.writestr(cover_letter_json["title"], cover_letter_pdf)

    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": 'attachment; filename="documents.zip"'},
    )
