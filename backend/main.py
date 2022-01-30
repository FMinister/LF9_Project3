import uvicorn
from fastapi import FastAPI, Request, HTTPException, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import logging
from sqlmodel import Session, select
from database_context.db_context import engine, create_db_and_tables
from models.ticket_model import Issue
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import os

logging.basicConfig(filename="./logs/log.txt", encoding="utf-8", level=logging.DEBUG)
logger = logging.getLogger("main")

app = FastAPI()


# TODO: Maybe add IPFire as origins to allow CORS, right now it's a wildcard
origins = [
    "*",
    # "http://192.168.72.3:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    logger.info("DB created.")


@app.get("/", response_class=HTMLResponse)
async def serve_spa(request: Request):
    logger.info("Frontend called.")
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/api/post")
def post_data(i: Issue):
    logger.info("Data posted.")
    try:
        issue = Issue(
            email=i.email,
            section=i.section,
            title=i.title,
            issue=i.issue,
            attachments=i.attachments,
            solved=i.solved,
            timestamp=i.timestamp,
        )

        with Session(engine) as session:
            session.add(issue)
            session.commit()
            session.refresh(issue)
            logger.info("Issue saved to DB.")

        return issue
    except Exception as e:
        logger.debug(f"Couldn't save data: {str(e)}")
        return HTTPException(status_code=404, detail="Couldn't save data.")


@app.post("/api/postIssue")
async def post_issue(
    email: str = Form(...),
    section: str = Form(...),
    title: str = Form(...),
    issue: str = Form(...),
    attachments: str = Form(...),
    solved: bool = Form(...),
    timestamp: int = Form(...),
    files: Optional[List[UploadFile]] = File(None)
):
    logger.info("Data posted.")
    try:
        issue = Issue(
            email=email,
            section=section,
            title=title,
            issue=issue,
            attachments=attachments,
            solved=solved,
            timestamp=timestamp,
        )

        if files is not None:
            for file in files:
                contents = await file.read()
                save_file(file.filename, contents)

        with Session(engine) as session:
            session.add(issue)
            session.commit()
            session.refresh(issue)
            logger.info("Issue saved to DB.")

        return issue
    except Exception as e:
        logger.debug(f"Couldn't save data: {str(e)}")
        return HTTPException(status_code=404, detail="Couldn't save data.")


@app.get("/api/allData")
def read_current_user():
    issues = get_all_issues()
    return {"Issues": issues}


# @app.post("/api/upload")
# async def upload(file: UploadFile = File(...)):
#
#     # in case you need the files saved, once they are uploaded
#     contents = await file.read()
#     save_file(file.filename, contents)
#
#     return {"Uploaded Filenames": file.filename, "uploaded file": file}


@app.post("/api/upload")
async def upload(files: Optional[List[UploadFile]] = File(None)):

    print(files)
    if files is None:
        return {"No files uploaded."}

    # in case you need the files saved, once they are uploaded
    for file in files:
        contents = await file.read()
        save_file(file.filename, contents)

    return {"Uploaded Filenames": [file.filename for file in files]}


def save_file(filename, data):
    file = os.path.join(f"{os.getcwd()}/pictures/", filename)
    with open(file, "wb") as f:
        f.write(data)


def get_all_issues():
    with Session(engine) as session:
        values = session.exec(select(Issue)).all()

        return values


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
