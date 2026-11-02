import os
from dotenv import load_dotenv
from google import genai
import json
from pathlib import Path

import faiss
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is missing. Check your .env file."
    )

client = genai.Client(api_key=api_key)
POLICY_DIR = ROOT / "data" / "policies"
INDEX_DIR = ROOT / "storage" / "faiss_index"

INDEX_FILE = INDEX_DIR / "index.faiss"
CHUNKS_FILE = INDEX_DIR / "chunks.json"
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
def split_text(text: str, size: int = 100, overlap: int = 20):
    words = text.split()
    chunks = []

    for start in range(0, len(words), size - overlap):
        chunk = " ".join(words[start:start + size])
        if chunk:
            chunks.append(chunk)
    return chunks
def build_index():
    INDEX_DIR.mkdir(parents=True, exist_ok=True)
    model = SentenceTransformer(MODEL_NAME)
    records = []

    for file in POLICY_DIR.glob("*.txt"):
        text = file.read_text(encoding="utf-8")

        for number, chunk in enumerate(split_text(text)):
            records.append({
                "text": chunk,
                "source": file.name,
                "chunk": number,
            })

    if not records:
        raise ValueError(
            f"No .txt policy files found in {POLICY_DIR}"
        )

    vectors = model.encode(
        [record["text"] for record in records],
        normalize_embeddings=True,
        convert_to_numpy=True,
    ).astype("float32")

    index = faiss.IndexFlatIP(vectors.shape[1])
    index.add(vectors)

    faiss.write_index(index, str(INDEX_FILE))
    CHUNKS_FILE.write_text(
        json.dumps(records, indent=2),
        encoding="utf-8",
    )

    print(f"Indexed {len(records)} chunks.")


def retrieve(question: str, top_k: int = 3):
    if not INDEX_FILE.exists() or not CHUNKS_FILE.exists():
        raise RuntimeError("Build the index first.")

    model = SentenceTransformer(MODEL_NAME)
    index = faiss.read_index(str(INDEX_FILE))
    records = json.loads(
        CHUNKS_FILE.read_text(encoding="utf-8")
    )

    query = model.encode(
        [question],
        normalize_embeddings=True,
        convert_to_numpy=True,
    ).astype("float32")

    scores, positions = index.search(
        query, min(top_k, len(records))
    )

    results = []

    for score, position in zip(scores[0], positions[0]):
        if position >= 0:
            item = records[int(position)].copy()
            item["similarity"] = float(score)
            results.append(item)

    return results

def answer_question(question: str) -> str:
    retrieved_chunks = retrieve(question, top_k=3)

    if not retrieved_chunks:
        return "I could not find relevant information in the policy."

    context = "\n\n".join(
        f"Source: {item['source']}\n{item['text']}"
        for item in retrieved_chunks
    )

    prompt = f"""
You are a helpful assistant for a health insurance
claim processing system.

Answer the question using only the policy context below.

Rules:
- Do not invent policy terms or coverage amounts.
- If the context does not contain the answer, say so.
- Do not declare a claim fraudulent based only on missing
  documents or unusual patterns.
- Explain which policy information supports your answer.

Policy context:
{context}

Question:
{question}

Answer:
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
    )

    return response.text or "No answer was generated."

if __name__ == "__main__":
    print("Building the policy index...")
    build_index()

    print("\n=== Health Insurance RAG Assistant ===")
    print("Ask questions about your policy.")
    print("Type 'exit' to quit.\n")

    while True:
        question = input("You: ").strip()

        if question.lower() in ("exit", "quit"):
            print("Goodbye!")
            break

        if not question:
            continue

        try:
            answer = answer_question(question)
            print(f"\nAssistant: {answer}\n")
        except Exception as error:
            print(f"\nError: {error}\n")
