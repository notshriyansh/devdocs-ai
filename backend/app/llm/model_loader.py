from transformers import AutoTokenizer, AutoModelForCausalLM
import torch


class LLMModel:

    def __init__(self):

        model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

        print("Loading LLM...")

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float32,
            device_map="cpu"
        )

        print("LLM loaded successfully.")

    def generate(self, prompt, max_tokens=200):

        inputs = self.tokenizer(prompt, return_tensors="pt")

        outputs = self.model.generate(
            **inputs,
            max_new_tokens=max_tokens
        )

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        return response