from database import Session
from sqlalchemy import MetaData, update
import requests
import time
import re


# Ollama API
OLLAMA_URL = 'http://localhost:11434/api/chat'
OLLAMA_MODEL = 'llama3'

def extract_option(text):
    match = re.search(r'\b([0-3])\b', text)
    return int(match.group(1)) if match else None

def get_llama_answer(question, options):
    prompt = f"""Question: {question}

Options:
0. {options['A']}
1. {options['B']}
2. {options['C']}
3. {options['D']}

What is the correct option? Do not guess. Reply only with the digit: 0, 1, 2, or 3 corresponding to the correct answer."""
    
    payload = {
        'model': OLLAMA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that responds only with a single digit (0, 1, 2, or 3) for the correct option."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "stream": False
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=15)
        response.raise_for_status()
        content = response.json()['message']['content'].strip()
        return extract_option(content)
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    try:
        session = Session()
        metadata = MetaData()
        metadata.reflect(bind=session.bind)
        questions_table = metadata.tables['physicsquestion']

        results = session.execute(
            questions_table.select()
            .where(questions_table.c.Correct_option == None)
            .order_by(questions_table.c.id.asc())
        ).fetchall()

        for row in results:
            qid = row.id
            question = row.Question
            options = {
                'A': row.Option_1,
                'B': row.Option_2,
                'C': row.Option_3,
                'D': row.Option_4
            }

            print(f"Processing physics Question ID: {qid}")
            answer = get_llama_answer(question, options)

            if answer is not None and answer in range(4):
                stmt = update(questions_table).where(questions_table.c.id == qid).values(Correct_option=answer)
                session.execute(stmt)
                session.commit()
                print(f"✅ Updated ID {qid} with answer: {answer}")
            else:
                print(f"❌ Skipped ID {qid} due to no valid answer")

            time.sleep(1)  # avoid overwhelming CPU or rate limits

        session.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
