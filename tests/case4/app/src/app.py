from fastapi import FastAPI
import streamlit as st
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "Agentic AI System"}

def run_streamlit():
    st.title("Agentic AI Interface")
    st.write("This is the main interface for interacting with the AI system.")
    # Add Streamlit UI code here

if __name__ == "__main__":
    # Run Streamlit in a separate thread
    import threading
    threading.Thread(target=run_streamlit).start()
