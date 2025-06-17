import pandas as pd
from openpyxl.workbook import Workbook
import re
df=pd.read_csv("subjects-questions.csv")
print(df.columns)
df = df[df['Subject'] == 'Biology']  # Filter only physics rows
def split_question_options(text):
    # 1. Normalize all A/B/C/D options to form '\nA.', '\nB.', etc
    text = re.sub(r'\n([A-Da-d])\s*\.', lambda m: '\n' + m.group(1).upper() + '.', text)

    # 2. Now split the question based on exact '\nA.', '\nB.', '\nC.', '\nD.'
    parts = re.split(r'\nA\.|\nB\.|\nC\.|\nD\.', text)

    # 3. Clean whitespace and ignore empty splits
    parts = [p.strip() for p in parts if p.strip() != '']

    # 4. Ensure 5 parts (Question + 4 options) — pad if missing
    while len(parts) < 5:
        parts.append('')

    return pd.Series({
        'Question': parts[0],
        'Option 1': parts[1],
        'Option 2': parts[2],
        'Option 3': parts[3],
        'Option 4': parts[4]
    })
# Apply splitting function to each row
split_cols = df['eng'].apply(split_question_options)
# Merge new columns into original dataframe
df = pd.concat([df, split_cols], axis=1)
# Drop 'eng' column if no longer needed
df.drop(columns=['eng'], inplace=True)
df.dropna()
# Replace empty strings '' with NaN
df.replace('', pd.NA, inplace=True)
# Drop rows where ANY column has NaN (i.e., any missing value)
df.dropna(inplace=True)
# Reset index after dropping
df.reset_index(drop=True, inplace=True)
def assign_toughness(question):
    length = len(question)
    if length < 50:
        return 'Easy'
    elif 50 <= length <= 150:
        return 'Medium'
    else:
        return 'Hard'
# Apply this function to the 'Question' column
df['Toughness'] = df['Question'].apply(assign_toughness)
df.to_csv('NEET_BIOLOGY.csv')
df.to_excel('NEET_Questions_Cleaned1.xlsx', index=False)