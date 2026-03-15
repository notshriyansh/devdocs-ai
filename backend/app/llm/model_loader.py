from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

_model = None
_tokenizer = None


def get_llm():

    global _model
    global _tokenizer

    if _model is None:

        model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

        print("Loading LLM...")

        _tokenizer = AutoTokenizer.from_pretrained(model_name)

        _model = AutoModelForCausalLM.from_pretrained(
            model_name,
            dtype=torch.float32,
            device_map="cpu"
        )

        print("LLM loaded successfully.")

    return _model, _tokenizer


def generate(prompt, max_tokens=200):

    model, tokenizer = get_llm()

    inputs = tokenizer(prompt, return_tensors="pt")

    outputs = model.generate(
        **inputs,
        max_new_tokens=max_tokens
    )

    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    return response[len(prompt):]