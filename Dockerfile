FROM python:3.8.18-alpine3.18

ENV APP /scheduler
RUN mkdir ${APP}
WORKDIR ${APP}

COPY ./backend/requirements.txt ./

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

COPY ./backend/*.py ./
COPY ./backend/upload_pdf.html ./
COPY ./backend/all_courses.json ./
RUN mkdir ${APP}/dist
COPY ./backend/dist/ ./dist

ENV PORT=3000
EXPOSE 3000

CMD [ "gunicorn", "-w 4", "server:app" ]
