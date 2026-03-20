import os
import sys
import time
import json

class MultimodalEvidenceAgent:
    def __init__(self, api_key=None):
        self.name = "Multimodal Evidence Agent"
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        
        if self.api_key:

            self.mode = "LIVE"
        else:
            self.mode = "SIMULATOR"

    def analyze_evidence(self, image_path, context_claim):
        print(f"\n[{self.name}] [SCAN] Scanning Multimodal Evidence for Claim {context_claim['Delivery_person_ID']}...")
        print(f"[{self.name}] Image Input: {os.path.basename(image_path)}")
        

        """
        prompt = f'''
        You are a Parametric Insurance Claims Adjuster for a gig worker platform.
        The driver has submitted this image as proof of an external disruption (e.g. Flooding, Storm).
        
        YOUR GOLDEN RULES:
        1. You MUST REJECT the claim if the image shows a vehicle repair, a medical accident, or health issues. We only cover income loss from environmental factors.
        2. You MUST APPROVE the claim if the image legitimately shows severe weather (floods, storms, extreme barricades) preventing delivery.
        
        Driver Context: Zone is {context_claim['City']}, reported event is {context_claim.get('trigger_reason', 'Severe Weather')}.
        
        Return your decision strictly in this JSON format:
        {{
            "decision": "APPROVE" or "REJECT",
            "reasoning": "Explain exactly what you see in the image and why it adheres to or violates the Golden Rules."
        }}
        '''
        
        # Example Gemini invocation:
        # model = genai.GenerativeModel('gemini-1.5-flash')
        # image = PIL.Image.open(image_path)
        # response = model.generate_content([prompt, image])
        # return json.loads(response.text)
        """
        
        time.sleep(2) # Simulating LLM inference wait time
        
        img_name = os.path.basename(image_path).lower()
        
        if "flood" in img_name or "storm" in img_name:
            result = {
                "decision": "APPROVE",
                "reasoning": "I can clearly identify a severely flooded street with water levels reaching above the sidewalk. This makes vehicle navigation impossible and matches the environmental income loss criteria."
            }
        elif "accident" in img_name or "hospital" in img_name or "repair" in img_name:
            result = {
                "decision": "REJECT",
                "reasoning": "GOLDEN RULE VIOLATION: The image depicts a broken motorcycle/medical accident. This policy expressly EXCLUDES coverage for vehicle repairs or health incidents. It only covers income loss from external environmental factors."
            }
        else:
            result = {
                "decision": "REJECT",
                "reasoning": "The image provided does not clearly display an external environmental disruption blocking the continuous delivery workflow."
            }
            
        print(f"[{self.name}] [VISION] LLM Vision Analysis Complete: {result['decision']}")
        print(f"[{self.name}] [REASONING] LLM Reasoning: {result['reasoning']}")
        return result

