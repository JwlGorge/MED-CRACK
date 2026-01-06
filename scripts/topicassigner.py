from database import Session
from sqlalchemy import MetaData, update
import requests
import time

# Ollama API
OLLAMA_URL = 'http://localhost:11434/api/chat'
OLLAMA_MODEL = 'llama3'

# biology_topics = [
#     # Class 11 Topics
#     "Diversity of the Living World",
#     "The Living World",
#     "Biological Classification",
#     "Plant Kingdom",
#     "Animal Kingdom",
#     "Structural Organisation in Animals and Plants",
#     "Morphology of Flowering Plants",
#     "Anatomy of Flowering Plants",
#     "Structural Organisation in Animals",
#     "Cell: Structure and Functions",
#     "Cell - The Unit of Life",
#     "Biomolecules",
#     "Cell Cycle and Cell Division",
#     "Plant Physiology",
#     "Transport in Plants",
#     "Mineral Nutrition",
#     "Photosynthesis in Higher Plants",
#     "Respiration in Plants",
#     "Plant Growth and Development",
#     "Human Physiology",
#     "Digestion and Absorption",
#     "Breathing and Exchange of Gases",
#     "Body Fluids and Circulation",
#     "Excretory Products and their Elimination",
#     "Locomotion and Movement",
#     "Neural Control and Coordination",
#     "Chemical Coordination and Integration",

#     # Class 12 Topics
#     "Reproduction",
#     "Reproduction in Organisms",
#     "Sexual Reproduction in Flowering Plants",
#     "Human Reproduction",
#     "Reproductive Health",
#     "Genetics and Evolution",
#     "Principles of Inheritance and Variation",
#     "Molecular Basis of Inheritance",
#     "Evolution",
#     "Biology and Human Welfare",
#     "Human Health and Disease",
#     "Biotechnology and Its Applications",
#     "Biotechnology: Principles and Processes",
#     "Biotechnology and its Applications",
#     "Ecology and Environment",
#     "Organisms and Populations",
#     "Ecosystem",
#     "Biodiversity and Conservation",
#     "Environmental Issues"
# ]
# physics_topics = [
#     # Class 11 Physics Topics
#     "Physical World",
#     "Units and Measurements",
#     "Motion in a Straight Line",
#     "Motion in a Plane",
#     "Laws of Motion",
#     "Work, Energy and Power",
#     "System of Particles and Rotational Motion",
#     "Gravitation",
#     "Mechanical Properties of Solids",
#     "Mechanical Properties of Fluids",
#     "Thermal Properties of Matter",
#     "Thermodynamics",
#     "Kinetic Theory",
#     "Oscillations",
#     "Waves",

#     # Class 12 Physics Topics
#     "Electric Charges and Fields",
#     "Electrostatic Potential and Capacitance",
#     "Current Electricity",
#     "Moving Charges and Magnetism",
#     "Magnetism and Matter",
#     "Electromagnetic Induction",
#     "Alternating Current",
#     "Electromagnetic Waves",
#     "Ray Optics and Optical Instruments",
#     "Wave Optics",
#     "Dual Nature of Radiation and Matter",
#     "Atoms",
#     "Nuclei",
#     "Semiconductor Electronics: Materials, Devices and Simple Circuits",
#     "Communication Systems"
# ]
chemistry_topics = [
    # Class 11 Topics
    "Some Basic Concepts of Chemistry",
    "Structure of Atom",
    "Classification of Elements and Periodicity in Properties",
    "Chemical Bonding and Molecular Structure",
    "States of Matter: Gases and Liquids",
    "Thermodynamics",
    "Equilibrium",
    "Redox Reactions",
    "Hydrogen",
    "The s-Block Element",
    "The p-Block Element (Group 13 and 14)",
    "Organic Chemistry – Some Basic Principles and Techniques",
    "Hydrocarbons",
    "Environmental Chemistry",

    # Class 12 Topics
    "The Solid State",
    "Solutions",
    "Electrochemistry",
    "Chemical Kinetics",
    "Surface Chemistry",
    "General Principles and Processes of Isolation of Elements",
    "The p-Block Element (Group 15, 16, 17, 18)",
    "The d- and f-Block Elements",
    "Coordination Compounds",
    "Haloalkanes and Haloarenes",
    "Alcohols, Phenols and Ethers",
    "Aldehydes, Ketones and Carboxylic Acids",
    "Organic Compounds Containing Nitrogen",
    "Biomolecules",
    "Polymers",
    "Chemistry in Everyday Life"
]





def format_topic(text):
    if not text:
        return None
    text = text.strip()
    for topic in chemistry_topics:
        if text.lower() in topic.lower() or topic.lower() in text.lower():
            return topic  # Return the canonical topic name
    return None

def get_llama_topic(question):
    prompt = f"""
From this list of topics:
{chemistry_topics}

Choose the most appropriate topic the following question belongs to. Reply with only one exact topic name from the list.

Question: {question}
"""

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant that replies with only one topic name from the list provided."
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
        return format_topic(content)
    except Exception as e:
        print(f"Error with LLaMA: {e}")
        return None

def main():
    print("entter table name")
    table=input()
    try:
        session = Session()
        metadata = MetaData()
        metadata.reflect(bind=session.bind)
        questions_table = metadata.tables['chemistryquestion']

        results = session.execute(  
            questions_table.select()
            .where(questions_table.c.topic==None, questions_table.c.id < 500).order_by(questions_table.c.id.asc())
        ).fetchall()

        for row in results:
            qid = row.id
            question = row.Question

            print(f"Processing Question ID: {qid}")
            topic = get_llama_topic(question)
            print(f"The topic is: {topic}")
            if topic:
                stmt = update(questions_table).where(questions_table.c.id == qid).values(topic=topic)
                session.execute(stmt)
                session.commit()
                print(f"✅ Updated ID {qid} with topic: {topic}")
            else:
                print(f"❌ Skipped ID {qid} due to no valid topic")

            time.sleep(1)  # To avoid system overload

        session.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
