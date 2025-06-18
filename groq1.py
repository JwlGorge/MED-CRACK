from database import SessionLocal
from sqlalchemy import MetaData, update
import requests
import time
import re
from dotenv import load_dotenv
import os

# Groq API

load_dotenv()
GROQ_API_KEY=os.getenv('groqapi')
GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
MODEL = 'llama3-8b-8192'

def extract_option(text):
    match = re.search(r'\b([A-D])\b', text.upper())
    return match.group(1) if match else None

def get_groq_answer(question, options):
    prompt = f"""Question: {question}
    Options:
    A. {options['A']}
    B. {options['B']}
    C. {options['C']}
    D. {options['D']}

    What is the correct option? Reply only with A, B, C, or D."""
    
    headers = {
        'Authorization': f'Bearer {GROQ_API_KEY}',
        'Content-Type': 'application/json'
    }

    payload = {
        'model': MODEL,
        'messages': [{'role': 'user', 'content': prompt}],
        'max_tokens': 10
    }

    try:
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        content = response.json()['choices'][0]['message']['content'].strip()
        return extract_option(content)
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    session = SessionLocal()
    metadata = MetaData()
    metadata.reflect(bind=session.bind)
    questions_table = metadata.tables['questions']

    results = session.execute(questions_table.select()).fetchall()

    for row in results:
        qid = row.id
        question = row.Question
        options = {'A': row.Option_1, 'B': row.Option_2, 'C': row.Option_3, 'D': row.Option_4}

        print(f"Processing Question ID: {qid}")

        answer = get_groq_answer(question, options)

        stmt = update(questions_table).where(questions_table.c.id == qid).values(Correct_option=answer)
        session.execute(stmt)
        session.commit()

        print(f"Updated ID {qid} with answer: {answer}")
        time.sleep(1)  # avoid hitting rate limits


    session.close()

if __name__ == "__main__":
    main()
